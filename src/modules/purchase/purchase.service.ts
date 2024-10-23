import mongoose from 'mongoose';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatPaginationResult, itemsQuery } from '../../core/utils';
import { PurchaseSchema } from '../purchase';
import SearchPurchaseDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import { IPurchase } from './purchase.interface';
import { DataStoredInToken } from '../auth';
import { UserRoleEnum } from '../user';

export default class PurchaseService {
    public purchaseSchema = PurchaseSchema;

    public async getItems(
        model: SearchWithPaginationDto,
        user: DataStoredInToken,
        is_instructor: boolean = true,
    ): Promise<SearchPaginationResponseModel<IPurchase>> {
        const userId = user.id;
        const searchCondition = { ...new SearchPurchaseDto(), ...model.searchCondition };
        const { purchase_no, cart_no, course_id, status, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};

        if (purchase_no) {
            const keywordValue = purchase_no.toLowerCase().trim();
            query = {
                ...query,
                purchase_no: { $regex: keywordValue, $options: 'i' },
            };
        }

        if (cart_no) {
            const keywordValue = cart_no.toLowerCase().trim();
            query = {
                ...query,
                cart_no: { $regex: keywordValue, $options: 'i' },
            };
        }

        if (course_id) {
            query = {
                ...query,
                course_id: new mongoose.Types.ObjectId(course_id),
            };
        }

        if (user.role !== UserRoleEnum.ADMIN) {
            const userIdObj = new mongoose.Types.ObjectId(user.id);

            if (is_instructor) {
                query = {
                    ...query,
                    instructor_id: userIdObj, // search instructor_id by userId
                };
            } else {
                query = {
                    ...query,
                    student_id: userIdObj, // search subscriber_id by userId
                };
            }
        }

        query = itemsQuery(query, { status, is_deleted });

        const aggregateQuery = this.purchaseSchema.aggregate([
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
                $lookup: {
                    from: 'carts',
                    localField: 'cart_id',
                    foreignField: '_id',
                    as: 'cart',
                },
            },
            { $unwind: '$cart' },
            {
                $project: {
                    _id: 1,
                    purchase_no: 1,
                    status: 1,
                    price_paid: 1,
                    price: 1,
                    discount: 1,
                    cart_no: '$cart.cart_no',
                    cart_id: 1,
                    course_id: 1,
                    course_name: '$course.name',
                    student_id: 1,
                    student_name: '$student.name',
                    instructor_id: 1,
                    instructor_name: '$instructor.name',
                    created_at: 1,
                    is_deleted: 1,
                },
            },
        ]);

        const items = await aggregateQuery.exec();
        const rowCount = await this.purchaseSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<IPurchase>();
        const result = formatPaginationResult<IPurchase>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }
}
