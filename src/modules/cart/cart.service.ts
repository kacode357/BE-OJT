import mongoose, { startSession } from 'mongoose';
import { PREFIX_TITLE } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatPaginationResult, generateRandomNo, isEmptyObject, itemsQuery } from '../../core/utils';
import { sendMail } from '../../core/utils/sendMail';
import { DataStoredInToken } from '../auth';
import { CourseSchema, CourseStatusEnum } from '../course';
import { CreatePurchaseDto, IPurchase, PurchaseSchema } from '../purchase';
import { SettingSchema, SettingTransactionTypeEnum } from '../setting';
import { UserSchema } from '../user';
import { VALID_STATUS_CHANGE_PAIRS } from './cart.constant';
import { CartStatusEnum } from './cart.enum';
import { ICart } from './cart.interface';
import CatSchema from './cart.model';
import CreateCartDto from './dtos/create.dto';
import SearchCartDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateCartDto from './dtos/update.dto';

export default class CatService {
    public cartSchema = CatSchema;
    public courseSchema = CourseSchema;
    public purchaseSchema = PurchaseSchema;
    public settingSchema = SettingSchema;
    public userSchema = UserSchema;

    public async create(model: CreateCartDto, userId: string): Promise<ICart> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        // check course exist in cart with student_id
        const cart = await this.cartSchema.findOne({
            course_id: model.course_id,
            student_id: userId,
            is_deleted: false,
        });
        if (cart) {
            throw new HttpException(HttpStatus.BadRequest, `Course is already in cart with status '${cart.status}' !`);
        }

        // check course exist
        const course = await this.courseSchema.findOne({
            _id: model.course_id,
            status: CourseStatusEnum.ACTIVE,
            is_deleted: false,
        });
        if (!course) {
            throw new HttpException(HttpStatus.BadRequest, 'Course is not exist!');
        }

        // check instructor own course
        if (course.user_id === userId) {
            throw new HttpException(HttpStatus.BadRequest, 'You cannot add courses you created to cart!');
        }

        // check course is purchased
        const purchase = await this.purchaseSchema.findOne({
            course_id: model.course_id,
            student_id: userId,
            is_deleted: false,
        });
        if (purchase) {
            throw new HttpException(HttpStatus.BadRequest, `The course '${course.name}' has been purchased!`);
        }

        model.cart_no = generateRandomNo(PREFIX_TITLE.CART);
        model.price = course.price;
        model.discount = course.discount;
        model.student_id = userId;
        model.instructor_id = course.user_id || '';

        const createdItem: ICart = await this.cartSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        userId: string,
    ): Promise<SearchPaginationResponseModel<ICart>> {
        const searchCondition = { ...new SearchCartDto(), ...model.searchCondition };
        const { course_id, status, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};

        if (course_id) {
            query = {
                ...query,
                course_id: new mongoose.Types.ObjectId(course_id),
            };
        }

        query = itemsQuery(query, { status });

        query = {
            ...query,
            student_id: new mongoose.Types.ObjectId(userId),
            is_deleted,
        };

        const aggregateQuery = this.cartSchema.aggregate([
            {
                $match: query,
            },
            { $sort: { created_at: -1 } },
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'users',
                    localField: 'student_id',
                    foreignField: '_id',
                    as: 'student',
                },
            },
            { $unwind: '$student' },
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
                $lookup: {
                    from: 'courses',
                    localField: 'course_id',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: '$course' },
            {
                $project: {
                    _id: 1,
                    cart_no: 1,
                    status: 1,
                    price: {
                        $cond: {
                            if: { $eq: ['$status', CartStatusEnum.NEW] },
                            then: '$course.price',
                            else: '$price',
                        },
                    },
                    discount: {
                        $cond: {
                            if: { $eq: ['$status', CartStatusEnum.NEW] },
                            then: '$course.discount',
                            else: '$discount',
                        },
                    },
                    course_id: 1,
                    course_name: '$course.name',
                    course_video: '$course.video_url',
                    course_image: '$course.image_url',
                    student_id: 1,
                    student_name: '$student.name',
                    instructor_id: 1,
                    instructor_name: '$instructor.name',
                    created_at: 1,
                    is_deleted: 1,
                    price_paid: {
                        $cond: {
                            if: { $eq: ['$status', CartStatusEnum.NEW] },
                            then: {
                                $cond: {
                                    if: {
                                        $and: [{ $gt: ['$course.discount', 0] }, { $lte: ['$course.discount', 100] }],
                                    },
                                    then: {
                                        $subtract: [
                                            '$course.price',
                                            { $multiply: ['$course.price', { $divide: ['$course.discount', 100] }] },
                                        ],
                                    },
                                    else: '$course.price',
                                },
                            },
                            else: '$price_paid',
                        },
                    },
                },
            },
        ]);

        const items = await aggregateQuery.exec();
        const rowCount = await this.cartSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<ICart>();
        const result = formatPaginationResult<ICart>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async getItemById(id: string): Promise<ICart> {
        const detail = await this.cartSchema.findOne({ _id: id, is_deleted: false }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }
        return detail;
    }

    // only accept status: 'waiting_paid', 'cancel', 'completed'
    public async updateStatusItem(model: UpdateCartDto, user: DataStoredInToken): Promise<boolean> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }
        const carts = model.items;

        if (model.status === CartStatusEnum.NEW) {
            throw new HttpException(HttpStatus.BadRequest, `Cannot update status Cart to '${CartStatusEnum.NEW}`);
        }

        // transaction for rollback
        const session = await startSession();
        session.startTransaction();

        let courseName = [];

        try {
            // save to setting balance
            const setting = await this.settingSchema.findOne({});
            if (!setting) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Setting default not exist! Please run api migrate setting default!`,
                );
            }

            // create temporaryBalanceTotal by balance_total
            let temporaryBalanceTotal = setting.balance_total;

            for (const item of carts) {
                // check cart exist
                const cartExists = await this.cartSchema.findOne({ _id: item._id, is_deleted: false }).session(session);
                if (!cartExists) {
                    throw new HttpException(HttpStatus.BadRequest, `Cart '${item.cart_no}' does not exist.`);
                }

                if (cartExists.status === CartStatusEnum.COMPLETED) {
                    throw new HttpException(HttpStatus.BadRequest, `Cart '${item.cart_no}' is already completed!`);
                }

                const isValidChangeStatus = VALID_STATUS_CHANGE_PAIRS.some(
                    (pair) => pair[0] === cartExists.status && pair[1] === model.status,
                );

                if (!isValidChangeStatus) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Invalid status change. Current cart item '${item.cart_no}' cannot update status: ${cartExists.status} -> ${model.status}`,
                    );
                }

                // check course exist
                const courseExists = await this.courseSchema
                    .findOne({
                        _id: cartExists.course_id,
                        status: CourseStatusEnum.ACTIVE,
                        is_deleted: false,
                    })
                    .session(session);
                if (!courseExists) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Course with ID ${cartExists.course_id} does not exist or is not active.`,
                    );
                }

                courseName.push(courseExists.name);

                if (model.status === CartStatusEnum.WAITING_PAID) {
                    cartExists.price = courseExists.price;
                    cartExists.discount = courseExists.discount;
                    cartExists.price_paid = courseExists.discount
                        ? courseExists.price - (courseExists.price * courseExists.discount) / 100
                        : courseExists.price;
                }

                // update cart status
                cartExists.status = model.status;
                cartExists.updated_at = new Date();
                const updateCart = await cartExists.save({ session });
                if (!updateCart) {
                    throw new HttpException(HttpStatus.BadRequest, `Cannot update status cart '${item.cart_no}'!`);
                }

                if (model.status === CartStatusEnum.COMPLETED) {
                    // check course with user exits in purchase
                    const purchaseExists = await this.purchaseSchema
                        .findOne({
                            student_id: cartExists.student_id,
                            course_id: cartExists.course_id,
                            is_deleted: false,
                        })
                        .session(session);
                    if (!purchaseExists) {
                        // create purchase info
                        const newPurchase = new CreatePurchaseDto(
                            generateRandomNo(PREFIX_TITLE.PURCHASE),
                            cartExists.id,
                            cartExists.course_id ?? '',
                            cartExists.student_id ?? '',
                            cartExists.instructor_id ?? '',
                            cartExists.price_paid,
                            cartExists.price,
                            cartExists.discount,
                        );
                        const newPurchaseDocument = new this.purchaseSchema(newPurchase);
                        const createdPurchase = await newPurchaseDocument.save({ session });
                        const resultPurchase: IPurchase = createdPurchase.toObject();

                        const amount = cartExists.discount
                            ? cartExists.price - (cartExists.price * cartExists.discount) / 100
                            : cartExists.price;

                        const balance_old = temporaryBalanceTotal;
                        const balance_new = balance_old + amount;

                        const updatedSetting = await this.settingSchema.updateOne(
                            {}, // record only one
                            {
                                $inc: { balance_total: amount },
                                $push: {
                                    transactions: {
                                        type: SettingTransactionTypeEnum.PURCHASE,
                                        amount,
                                        balance_old,
                                        balance_new,
                                        purchase_id: resultPurchase._id,
                                        instructor_id: resultPurchase.instructor_id,
                                        created_at: new Date(),
                                    },
                                },
                                $set: { updated_at: new Date() },
                            },
                            { session },
                        );
                        if (!updatedSetting) {
                            throw new HttpException(HttpStatus.BadRequest, `Update setting failed!`);
                        }

                        // update temporaryBalanceTotal
                        temporaryBalanceTotal = balance_new;
                    } else {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `You have purchased the course '${courseExists.name}'!`,
                        );
                    }
                }
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw new HttpException(HttpStatus.BadRequest, `Update item failed! ${error}`);
        } finally {
            session.endSession();
        }

        if (model.status === CartStatusEnum.COMPLETED) {
            const student = await this.userSchema.findOne({ _id: user.id, is_verified: true, is_deleted: false });
            if (!student) {
                throw new HttpException(HttpStatus.BadRequest, 'User is not found!');
            }

            // send mail to student
            const sendMailResult = await sendMail({
                toMail: student.email,
                subject: `Buy courses success`,
                html: `Hello, ${student.name}! <br> Your buy courses success, please check info in list courses was purchased: ${courseName.toString()}`,
            });
            if (!sendMailResult) {
                throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${student.email}`);
            }
        }

        return true;
    }

    public async deleteItem(id: string): Promise<boolean> {
        const detail = await this.getItemById(id);
        if (!detail || detail.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        if (detail.status !== CartStatusEnum.NEW && detail.status !== CartStatusEnum.CANCEL) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `You only delete cart with status '${CartStatusEnum.NEW}' or '${CartStatusEnum.CANCEL}`,
            );
        }

        const updatedItem = await this.cartSchema.updateOne({ _id: id }, { is_deleted: true, updated_at: new Date() });

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }
}
