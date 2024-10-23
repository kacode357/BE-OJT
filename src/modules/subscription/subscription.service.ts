import mongoose from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatPaginationResult, isEmptyObject, itemsQuery } from '../../core/utils';
import { UserRoleEnum, UserSchema } from '../user';
import SearchSubscriptionDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSubscriptionDto from './dtos/update.dto';
import { ISubscription } from './subscription.interface';
import SubscriptionSchema from './subscription.model';

export default class SubscriptionService {
    public subscriptionSchema = SubscriptionSchema;
    public userSchema = UserSchema;

    public async createOrUpdate(model: UpdateSubscriptionDto, userId: string): Promise<ISubscription> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        model.subscriber_id = userId;

        // check instructor exist
        const instructor = await this.userSchema.findOne({
            _id: model.instructor_id,
            role: UserRoleEnum.INSTRUCTOR,
            status: true,
            is_verified: true,
            is_deleted: false,
        });
        if (!instructor) {
            throw new HttpException(HttpStatus.BadRequest, 'Instructor is not exist!');
        }

        if (model.subscriber_id === model.instructor_id) {
            throw new HttpException(HttpStatus.BadRequest, 'You can not subscribe yourself!');
        }

        // check subscription exists with userId and instructor_id
        const subscription = await this.subscriptionSchema.findOne({
            subscriber_id: userId,
            instructor_id: model.instructor_id,
            is_deleted: false,
        });
        if (!subscription) {
            model.is_subscribed = true;
            const createItem: ISubscription = await this.subscriptionSchema.create(model);
            return createItem;
        }

        subscription.is_subscribed = !subscription.is_subscribed;
        subscription.updated_at = new Date();
        const updateSubscription = await subscription.save();

        if (!updateSubscription) {
            throw new HttpException(HttpStatus.BadRequest, 'Item can not update!');
        }

        return subscription;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        userId: string,
        is_instructor: boolean = true,
    ): Promise<SearchPaginationResponseModel<ISubscription>> {
        const searchCondition = { ...new SearchSubscriptionDto(), ...model.searchCondition };
        const { keyword, is_subscribed, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};
        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query = {
                name: { $regex: keywordValue, $options: 'i' },
            };
        }

        const userIdObj = new mongoose.Types.ObjectId(userId);

        if (is_instructor) {
            query = {
                ...query,
                instructor_id: userIdObj, // search instructor_id by userId
            };
        } else {
            query = {
                ...query,
                subscriber_id: userIdObj, // search subscriber_id by userId
            };
        }

        query = itemsQuery(query, { is_deleted, is_subscribed });

        const aggregateQuery = this.subscriptionSchema.aggregate([
            {
                $match: query,
            },
            { $sort: { updated_at: -1 } },
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'users',
                    localField: 'subscriber_id',
                    foreignField: '_id',
                    as: 'subscriber',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'instructor_id',
                    foreignField: '_id',
                    as: 'instructor',
                },
            },
            { $unwind: '$subscriber' },
            { $unwind: '$instructor' },
            {
                $project: {
                    _id: 1,
                    subscriber_id: 1,
                    subscriber_name: '$subscriber.name',
                    instructor_id: 1,
                    instructor_name: '$instructor.name',
                    is_subscribed: 1,
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        ]);

        const items = await aggregateQuery.exec();
        const rowCount = await this.subscriptionSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<ISubscription>();
        const result = formatPaginationResult<ISubscription>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }
}
