import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkUserMatch, formatPaginationResult, isEmptyObject, itemsQuery } from '../../core/utils';
import { DataStoredInToken } from '../auth';
import { CourseSchema, ICourse } from '../course';
import { IPurchase, PurchaseSchema } from '../purchase';
import { UserRoleEnum } from '../user';
import CreateReviewDto from './dtos/create.dto';
import SearchReviewDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateReviewDto from './dtos/update.dto';
import { IReview } from './review.interface';
import ReviewSchema from './review.model';

export default class ReviewService {
    private reviewSchema: Model<IReview> = ReviewSchema;
    private courseSchema: Model<ICourse> = CourseSchema;
    private purchaseSchema: Model<IPurchase> = PurchaseSchema;

    public async create(model: CreateReviewDto, userId: string): Promise<IReview> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        model.user_id = userId;

        // check valid course
        const course = await this.checkCourseValid(model);

        // check that instructors cannot review self-created courses
        if (course && course.user_id?.toString() === userId) {
            throw new HttpException(HttpStatus.BadRequest, 'You cannot review your own course!');
        }

        // check only user purchase course must can review
        const isPurchased = await this.purchaseSchema
            .findOne({
                course_id: course._id,
                student_id: userId,
            })
            .limit(1)
            .exec();
        if (!isPurchased) {
            throw new HttpException(HttpStatus.BadRequest, 'You must purchase this course before review!');
        }

        // check user can only be reviewed once
        const countReviewByUser = await this.reviewSchema.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(userId),
                    course_id: new mongoose.Types.ObjectId(model.course_id),
                },
            },
            {
                $group: {
                    _id: { user_id: '$user_id', course_id: '$course_id' },
                    count: { $sum: 1 },
                },
            },
            {
                $match: {
                    count: { $gte: 1 },
                },
            },
        ]);
        if (countReviewByUser.length > 0) {
            throw new HttpException(HttpStatus.BadRequest, 'You have already reviewed this course!');
        }

        const createdItem: IReview = await this.reviewSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        userId: string,
    ): Promise<SearchPaginationResponseModel<IReview>> {
        const searchCondition = { ...new SearchReviewDto(), ...model.searchCondition };
        const { course_id, rating, is_instructor, is_rating_order, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};

        if (course_id) {
            query = {
                ...query,
                course_id: new mongoose.Types.ObjectId(course_id),
            };
        }

        query = itemsQuery(query, { rating, is_deleted });

        const aggregatePipeline: any[] = [{ $match: query }];

        if (is_instructor) {
            aggregatePipeline.push(
                {
                    $lookup: {
                        from: 'courses',
                        let: { course_id: '$course_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$course_id'] },
                                            { $eq: ['$user_id', new mongoose.Types.ObjectId(userId)] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'course_details',
                    },
                },
                { $unwind: '$course_details' },
                { $match: { 'course_details._id': { $exists: true } } },
            );
        }

        aggregatePipeline.push(
            { $sort: is_rating_order ? { rating: 1 } : { created_at: -1 } },
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
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
                    reviewer_id: '$user_id',
                    reviewer_name: '$user.name',
                    course_id: 1,
                    course_name: '$course.name',
                    comment: 1,
                    rating: 1,
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        );
        const aggregateQuery = this.reviewSchema.aggregate(aggregatePipeline);
        const items = await aggregateQuery.exec();

        const countQuery = is_instructor
            ? {
                  ...query,
                  course_id: {
                      $in: (
                          await this.courseSchema
                              .find({ user_id: new mongoose.Types.ObjectId(userId) })
                              .select('_id')
                              .exec()
                      ).map((course) => course._id),
                  },
              }
            : query;
        const rowCount = await this.reviewSchema.find(countQuery).countDocuments().exec();
        const data = new SearchPaginationResponseModel<IReview>();
        const result = formatPaginationResult<IReview>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async getItemById(id: string): Promise<IReview> {
        const detail = await this.reviewSchema.findOne({ _id: id, is_deleted: false }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }
        return detail;
    }

    public async updateItem(id: string, model: UpdateReviewDto, user: DataStoredInToken): Promise<IReview> {
        const userId = user.id;
        const userRole = user.role;

        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        model.user_id = userId;
        let errorResults: IError[] = [];

        // check item exits
        const item = await this.getItemById(id);
        if (item && item.user_id) {
            if (userRole !== UserRoleEnum.ADMIN) {
                // check valid user
                await checkUserMatch(userId, item.user_id.toString(), 'review');
            }
        }

        // check valid course
        await this.checkCourseValid(model);

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const updateData = {
            rating: model.rating,
            comment: model.comment,
            updated_at: new Date(),
        };

        const updatedItem = await this.reviewSchema.updateOne({ _id: id }, updateData);

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Update item info failed!');
        }

        const result = await this.getItemById(id);
        return result;
    }

    public async deleteItem(id: string, userId: string): Promise<boolean> {
        const item = await this.getItemById(id);
        if (!item || item.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        const updatedItem = await this.reviewSchema.updateOne(
            { _id: id },
            { is_deleted: true, updated_at: new Date() },
        );

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }

    private checkCourseValid = async (model: CreateReviewDto | UpdateReviewDto) => {
        const course = await this.courseSchema.findOne({ _id: model.course_id, is_deleted: false }).lean();
        if (!course) {
            throw new HttpException(HttpStatus.BadRequest, 'You cannot comment on this course!');
        }

        return course;
    };
}
