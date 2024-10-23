import mongoose, { startSession } from 'mongoose';
import { PREFIX_TITLE } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatPaginationResult, generateRandomNo, isEmptyObject, itemsQuery } from '../../core/utils';
import { sendMail } from '../../core/utils/sendMail';
import { DataStoredInToken } from '../auth';
import { PurchaseSchema } from '../purchase';
import { SettingSchema, SettingTransactionTypeEnum } from '../setting';
import { UserRoleEnum, UserSchema } from '../user';
import { PurchaseStatusEnum } from './../purchase/purchase.enum';
import CreatePayoutDto from './dtos/create.dto';
import SearchPayoutDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateStatusPayoutDto from './dtos/update.dto';
import { VALID_STATUS_CHANGE_PAIRS } from './payout.contant';
import { PayoutStatusEnum } from './payout.enum';
import { IPayout } from './payout.interface';
import PayoutSchema from './payout.model';

export default class PayoutService {
    public payoutSchema = PayoutSchema;
    public settingSchema = SettingSchema;
    public purchaseSchema = PurchaseSchema;
    public userSchema = UserSchema;

    public async create(model: CreatePayoutDto, user: DataStoredInToken): Promise<IPayout> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const newItem = model;

        if (user.role === UserRoleEnum.ADMIN) {
            if (!model.instructor_id) {
                throw new HttpException(HttpStatus.BadRequest, 'Please provide instructor_id!');
            } else {
                newItem.instructor_id = model.instructor_id;
            }
        } else {
            newItem.instructor_id = user.id;
        }

        const setting = await this.settingSchema.findOne({});
        if (!setting) {
            throw new HttpException(HttpStatus.BadRequest, 'Setting not found.');
        }
        newItem.instructor_ratio = setting.instructor_ratio;

        // transaction for rollback
        const session = await startSession();
        session.startTransaction();

        try {
            // create temporary
            let tempBalanceOrigin = 0;

            for (const item of model.transactions) {
                // check purchase exist
                const purchaseExist = await this.purchaseSchema
                    .findOne({
                        _id: item.purchase_id,
                        status: PurchaseStatusEnum.NEW,
                        is_deleted: false,
                    })
                    .session(session);
                if (!purchaseExist) {
                    throw new HttpException(HttpStatus.BadRequest, `Purchase not found or status is not new.`);
                }

                // check instructor owner purchase item
                const instructorOwnerPurchase = await this.purchaseSchema
                    .findOne({
                        _id: item.purchase_id,
                        instructor_id: newItem.instructor_id,
                    })
                    .session(session);
                if (!instructorOwnerPurchase) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Instructor not owner purchase '${purchaseExist.purchase_no}'`,
                    );
                }

                // check purchase not in any payout item
                const payoutExist = await this.payoutSchema
                    .findOne({
                        transactions: { $elemMatch: { purchase_id: item.purchase_id } },
                    })
                    .session(session);
                if (payoutExist) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Purchase '${purchaseExist.purchase_no}' already in payout list!`,
                    );
                }

                // update purchase status
                purchaseExist.status = PurchaseStatusEnum.REQUEST_PAID;
                purchaseExist.updated_at = new Date();
                const updatePurchase = await purchaseExist.save({ session });
                if (!updatePurchase) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Cannot update status purchase '${purchaseExist.purchase_no}'!`,
                    );
                }

                const { price_paid, price, discount } = purchaseExist;

                item.price_paid = price_paid;
                item.price = price;
                item.discount = discount;

                // update balance info
                tempBalanceOrigin += price_paid;
            }

            newItem.balance_origin = tempBalanceOrigin;
            newItem.balance_instructor_paid = (tempBalanceOrigin * (100 - setting.instructor_ratio)) / 100;
            newItem.balance_instructor_received = (tempBalanceOrigin * setting.instructor_ratio) / 100;

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw new HttpException(HttpStatus.BadRequest, `Create item failed! ${error}`);
        } finally {
            session.endSession();
        }

        newItem.payout_no = generateRandomNo(PREFIX_TITLE.PAYOUT);

        const createdItem = await this.payoutSchema.create(newItem);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        user: DataStoredInToken,
    ): Promise<SearchPaginationResponseModel<IPayout>> {
        const searchCondition = { ...new SearchPayoutDto(), ...model.searchCondition };
        const { payout_no, instructor_id, status, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};

        if (payout_no) {
            const keywordValue = payout_no.toLowerCase().trim();
            query = {
                ...query,
                payout_no: { $regex: keywordValue, $options: 'i' },
            };
        }

        let userId = '';
        if (user.role === UserRoleEnum.INSTRUCTOR) {
            userId = user.id;
        } else {
            if (instructor_id) {
                userId = instructor_id;
            }
        }

        if (userId) {
            query = {
                ...query,
                instructor_id: new mongoose.Types.ObjectId(userId),
            };
        }

        query = itemsQuery(query, { status, is_deleted });

        const aggregateQuery = this.payoutSchema.aggregate([
            {
                $match: query,
            },
            { $sort: { created_at: -1 } },
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'users',
                    localField: 'instructor_id',
                    foreignField: '_id',
                    as: 'instructor',
                },
            },
            { $unwind: '$instructor' },
            {
                $project: {
                    _id: 1,
                    payout_no: 1,
                    status: 1,
                    transactions: 1,
                    instructor_id: 1,
                    instructor_name: '$instructor.name',
                    instructor_email: '$instructor.email',
                    balance_origin: 1,
                    balance_instructor_paid: 1,
                    balance_instructor_received: 1,
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        ]);

        const items = await aggregateQuery.exec();
        const rowCount = await this.payoutSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<IPayout>();
        const result = formatPaginationResult<IPayout>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async updateStatus(id: string, model: UpdateStatusPayoutDto, user: DataStoredInToken): Promise<boolean> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        // check payout exist
        const payoutExist = await this.payoutSchema.findOne({ _id: id, is_deleted: false });
        if (!payoutExist) {
            throw new HttpException(HttpStatus.BadRequest, `Payout not found!`);
        }

        if (payoutExist.status === PayoutStatusEnum.COMPLETED) {
            throw new HttpException(HttpStatus.BadRequest, `Payout '${payoutExist.payout_no}' already completed!`);
        }

        const isValidChangeStatus = VALID_STATUS_CHANGE_PAIRS.some(
            (pair) => pair[0] === payoutExist.status && pair[1] === model.status,
        );

        if (!isValidChangeStatus) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Invalid status change. Current payout item '${payoutExist.payout_no}' cannot update status: ${payoutExist.status} -> ${model.status}`,
            );
        }

        // get instructor information
        const instructorExist = await this.userSchema.findOne({
            _id: payoutExist.instructor_id,
            is_verified: true,
            is_deleted: false,
        });
        if (!instructorExist) {
            throw new HttpException(HttpStatus.BadRequest, 'Instructor not exist!');
        }

        // instructor with status request_payout
        if (user.role === UserRoleEnum.INSTRUCTOR && model.status === PayoutStatusEnum.REQUEST_PAYOUT) {
            // send mail to admin
            const adminMail = process.env.EMAIL_USER || '';
            const sendMailResult = await sendMail({
                toMail: adminMail,
                subject: `Request payout from instructor ${instructorExist.email}`,
                html: `Hello, Admin! <br>Please review request payout for instructor with email <strong>${instructorExist.email}</strong> and Payout No <strong>${payoutExist.payout_no}</strong>.<br> Info banking: bank name: <strong>${instructorExist.bank_name}</strong> - bank account: <strong>${instructorExist.bank_account_no}</strong> `,
            });
            if (!sendMailResult) {
                throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${adminMail}`);
            }
        }

        // admin with status completed or rejected
        const adminStatusList = [PayoutStatusEnum.COMPLETED, PayoutStatusEnum.REJECTED];
        if (adminStatusList.includes(model.status)) {
            if (user.role !== UserRoleEnum.ADMIN) {
                throw new HttpException(HttpStatus.BadRequest, 'Only admin can update completed or rejected status.');
            }

            let subject = '';
            let html = '';

            if (model.status === PayoutStatusEnum.REJECTED) {
                if (!model.comment) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        'Please enter a comment reason reject payout of instructor!',
                    );
                }

                subject = `Your payout request has been rejected by the Administrator`;
                html = `Hello, ${instructorExist.name}! <br>Your payout has been rejected by the Administrator with reason: <strong>${model.comment}</strong> .`;
            }

            if (model.status === PayoutStatusEnum.COMPLETED) {
                // transaction for rollback
                const session = await startSession();
                session.startTransaction();
                try {
                    // get setting default
                    const settingExist = await this.settingSchema.findOne({});
                    if (!settingExist) {
                        throw new HttpException(HttpStatus.BadRequest, 'Setting not found.');
                    }

                    // update setting
                    const balance_total = settingExist.balance_total - payoutExist.balance_instructor_received;
                    const balance_old = settingExist.balance_total;
                    const balance_new = balance_old - payoutExist.balance_instructor_received;
                    const updatedSetting = await this.settingSchema.updateOne(
                        {}, // record only one
                        {
                            $push: {
                                transactions: {
                                    type: SettingTransactionTypeEnum.PAID,
                                    amount: payoutExist.balance_instructor_received,
                                    balance_old,
                                    balance_new,
                                    instructor_ratio: payoutExist.instructor_ratio,
                                    instructor_id: payoutExist.instructor_id,
                                    payout_id: payoutExist._id,
                                    created_at: new Date(),
                                },
                            },
                            $set: { balance_total, updated_at: new Date() },
                        },
                        { session },
                    );
                    if (!updatedSetting) {
                        throw new HttpException(HttpStatus.BadRequest, `Update setting failed!`);
                    }

                    // update instructor balance
                    const updatedInstructor = await this.userSchema.updateOne(
                        { _id: instructorExist.id }, // record only one
                        {
                            $inc: { balance_total: payoutExist.balance_instructor_received },
                            $push: {
                                transactions: {
                                    payout_id: payoutExist._id,
                                    payout_no: payoutExist.payout_no,
                                    payout_amount: payoutExist.balance_instructor_received,
                                    created_at: new Date(),
                                },
                            },
                            $set: { updated_at: new Date() },
                        },
                        { session },
                    );
                    if (!updatedInstructor) {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `Cannot update balance for instructor '${instructorExist.email}'!`,
                        );
                    }

                    for (const item of payoutExist.transactions) {
                        // check purchase exist
                        const purchaseExist = await this.purchaseSchema
                            .findOne({
                                _id: item.purchase_id,
                                status: PurchaseStatusEnum.REQUEST_PAID,
                                is_deleted: false,
                            })
                            .session(session);
                        if (!purchaseExist) {
                            throw new HttpException(
                                HttpStatus.BadRequest,
                                `Purchase not found or status is not request_paid.`,
                            );
                        }

                        // update purchase status
                        purchaseExist.status = PurchaseStatusEnum.COMPLETED;
                        purchaseExist.updated_at = new Date();
                        const updatePurchase = await purchaseExist.save({ session });
                        if (!updatePurchase) {
                            throw new HttpException(
                                HttpStatus.BadRequest,
                                `Cannot update status purchase '${purchaseExist.purchase_no}'!`,
                            );
                        }
                    }

                    await session.commitTransaction();
                } catch (error) {
                    await session.abortTransaction();
                    throw new HttpException(HttpStatus.BadRequest, `Update item failed! ${error}`);
                } finally {
                    session.endSession();
                }

                subject = `Your payout request has been completed by the Administrator`;
                html = `Hello, ${instructorExist.name}! <br>Your payout has been completed by the Administrator! <br> Please check info in profile balance and banking!`;
            }

            // send mail to instructor
            const sendMailResult = await sendMail({
                toMail: instructorExist.email,
                subject,
                html,
            });
            if (!sendMailResult) {
                throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${instructorExist.email}`);
            }
        }

        payoutExist.status = model.status;
        payoutExist.updated_at = new Date();
        const updatedItem = await payoutExist.save();
        if (!updatedItem) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot update payout!');
        }

        return true;
    }
}
