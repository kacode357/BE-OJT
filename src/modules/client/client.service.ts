import mongoose from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatPaginationResult, itemsQuery } from '../../core/utils';
import { DataStoredInToken } from '../auth';
import { CartSchema } from '../cart';
import { CourseSchema, CourseStatusEnum, ICourse } from '../course';
import { ILesson } from '../lesson';
import { PurchaseSchema } from '../purchase';
import { ReviewSchema } from '../review';
import { ISession, SessionSchema } from '../session';
import SearchCourseDto from './dtos/searchCourse.dto';
import SearchCourseWithPaginationDto from './dtos/searchCourseWithPagination.dto';

export default class ClientService {
    public courseSchema = CourseSchema;
    public sessionSchema = SessionSchema;
    public cartSchema = CartSchema;
    public purchaseSchema = PurchaseSchema;
    public reviewSchema = ReviewSchema;

    public async getCourses(
        model: SearchCourseWithPaginationDto,
        user: DataStoredInToken,
    ): Promise<SearchPaginationResponseModel<ICourse>> {
        const userId = user.id;
        const searchCondition = { ...new SearchCourseDto(), ...model.searchCondition };
        const { keyword, category_id, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};
        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query = {
                name: { $regex: keywordValue, $options: 'i' },
            };
        }

        if (category_id) {
            query = {
                ...query,
                category_id: new mongoose.Types.ObjectId(category_id),
            };
        }

        query = {
            ...query,
            status: CourseStatusEnum.ACTIVE,
        };

        query = itemsQuery(query, { is_deleted });

        const aggregateQuery = this.courseSchema.aggregate([
            {
                $match: query,
            },
            { $sort: { updated_at: -1 } },
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
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
                    from: 'sessions',
                    let: { courseId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$course_id', '$$courseId'] } } },
                        {
                            $lookup: {
                                from: 'lessons',
                                localField: '_id',
                                foreignField: 'session_id',
                                as: 'lessons',
                            },
                        },
                        {
                            $addFields: {
                                sessionFullTime: { $sum: '$lessons.full_time' }, // count full_time each lesson
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalSessions: { $sum: 1 }, // count total session
                                totalLessons: { $sum: { $size: '$lessons' } }, // count total_lesson in session
                                totalFullTime: { $sum: '$sessionFullTime' }, // count full_time each sessionÏ
                            },
                        },
                    ],
                    as: 'sessions',
                },
            },
            {
                $addFields: {
                    price_paid: {
                        $subtract: [
                            '$price',
                            {
                                $multiply: [
                                    '$price',
                                    {
                                        $cond: {
                                            if: { $lte: ['$discount', 100] },
                                            then: { $divide: ['$discount', 100] },
                                            else: 1,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    full_time: { $ifNull: [{ $arrayElemAt: ['$sessions.totalFullTime', 0] }, 0] },
                },
            },
            {
                $project: {
                    _id: 1,
                    instructor_id: '$user._id',
                    instructor_name: '$user.name',
                    category_id: 1,
                    category_name: '$category.name',
                    name: 1,
                    description: 1,
                    status: 1,
                    image_url: 1,
                    video_url: 1,
                    price_paid: 1,
                    price: 1,
                    discount: 1,
                    created_at: 1,
                    updated_at: 1,
                    session_count: { $ifNull: [{ $arrayElemAt: ['$sessions.totalSessions', 0] }, 0] },
                    lesson_count: { $ifNull: [{ $arrayElemAt: ['$sessions.totalLessons', 0] }, 0] },
                    is_in_cart: { $ifNull: ['$is_in_cart', false] },
                    is_purchased: { $ifNull: ['$is_purchased', false] },
                    full_time: 1,
                },
            },
        ]);

        // execute the aggregate query
        const items = await aggregateQuery.exec();

        // check logic course in cart or purchase
        if (userId) {
            // check user add course in cart
            for (let course of items) {
                const isInCart = await this.cartSchema
                    .findOne({
                        course_id: course._id,
                        student_id: userId,
                        is_deleted: false,
                    })
                    .limit(1)
                    .exec();

                // Add is_in_cart flag to each course
                course.is_in_cart = !!isInCart;
            }

            // check user is purchase
            for (let course of items) {
                const isPurchased = await this.purchaseSchema
                    .findOne({
                        course_id: course._id,
                        student_id: userId,
                        is_deleted: false,
                    })
                    .limit(1)
                    .exec();

                // Add is_purchased flag to each course
                course.is_purchased = !!isPurchased;
            }
        }

        // check logic get review_total
        const aggregateReviewQuery = [
            {
                $match: { is_deleted: false }, // Filter reviews that are not deleted
            },
            {
                $group: {
                    _id: '$course_id', // Group by course_id
                    averageRating: { $avg: '$rating' }, // Calculate average rating
                    count: { $sum: 1 }, // Count number of reviews per course
                },
            },
        ];
        const averageRatings = await this.reviewSchema.aggregate(aggregateReviewQuery).exec();
        // Assuming `items` is an array of courses
        for (let course of items) {
            // Find average rating for the course from `averageRatings`
            const averageRatingObj = averageRatings.find((r) => r._id.toString() === course._id.toString());
            if (averageRatingObj) {
                course.average_rating = averageRatingObj.averageRating;
                course.review_count = averageRatingObj.count; // Optionally store review count
            } else {
                course.average_rating = 0; // Set default if no reviews found
                course.review_count = 0; // Set default review count
            }
        }

        const rowCount = await this.courseSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<ICourse>();
        const result = formatPaginationResult<ICourse>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async getCourseDetail(id: string, user: DataStoredInToken): Promise<ICourse> {
        const userId = user.id;

        // Check detail exists and retrieve course details
        const detail = await this.courseSchema.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id), is_deleted: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $addFields: {
                    instructor_id: { $arrayElemAt: ['$user._id', 0] },
                    instructor_name: { $arrayElemAt: ['$user.name', 0] },
                    category_name: { $arrayElemAt: ['$category.name', 0] },
                    price_paid: {
                        $subtract: [
                            '$price',
                            {
                                $multiply: [
                                    '$price',
                                    {
                                        $cond: {
                                            if: { $lte: ['$discount', 100] },
                                            then: { $divide: ['$discount', 100] },
                                            else: 1,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    instructor_id: 1,
                    instructor_name: 1,
                    category_id: 1,
                    category_name: 1,
                    name: 1,
                    description: 1,
                    content: 1,
                    status: 1,
                    image_url: 1,
                    video_url: 1,
                    price_paid: 1,
                    price: 1,
                    discount: 1,
                    created_at: 1,
                    updated_at: 1,
                },
            },
            { $limit: 1 }, // Assuming only one course detail is needed
        ]);

        if (detail.length > 0) {
            // Initialize flags and session list
            let isInCartItem = false;
            let isPurchasedItem = false;
            let sessionListWithLessons = await this.sessionSchema
                .aggregate([
                    { $match: { course_id: new mongoose.Types.ObjectId(id), is_deleted: false } },
                    { $sort: { position_order: 1 } },
                    {
                        $lookup: {
                            from: 'lessons',
                            let: { sessionId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$session_id', '$$sessionId'] },
                                                { $eq: ['$is_deleted', false] },
                                            ],
                                        },
                                    },
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                        lesson_type: 1,
                                        full_time: 1,
                                        position_order: 1,
                                    },
                                },
                                { $sort: { position_order: 1 } },
                            ],
                            as: 'lesson_list',
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            position_order: 1,
                            full_time: { $sum: '$lesson_list.full_time' },
                            lesson_list: 1,
                        },
                    },
                ])
                .exec();

            // Check if userId is provided
            if (userId) {
                // Check if course is in cart
                const isInCart = await this.cartSchema
                    .findOne({
                        course_id: id,
                        student_id: userId,
                        is_deleted: false,
                    })
                    .limit(1)
                    .exec();

                // Set is_in_cart flag
                isInCartItem = !!isInCart;

                // Check if course is purchased
                const isPurchased = await this.purchaseSchema
                    .findOne({
                        course_id: id,
                        student_id: userId,
                        is_deleted: false,
                    })
                    .limit(1)
                    .exec();

                // Set is_purchased flag
                isPurchasedItem = !!isPurchased;
            }

            // Modify detail based on conditions
            if (!userId) {
                // Remove unnecessary fields if userId is absent or course is not purchased
                sessionListWithLessons = sessionListWithLessons.map((session: ISession) => ({
                    name: session.name,
                    full_time: session.full_time,
                    lesson_list: session.lesson_list.map((lesson: ILesson) => ({
                        name: lesson.name,
                        full_time: lesson.full_time,
                    })),
                }));
            }

            // Calculate total full_time from all sessions
            const totalFullTime = sessionListWithLessons.reduce((acc, curr) => acc + curr.full_time, 0);

            // Assign calculated values and flags to detail
            detail[0].full_time = totalFullTime;
            detail[0].session_list = sessionListWithLessons;
            detail[0].is_in_cart = isInCartItem;
            detail[0].is_purchased = isPurchasedItem;

            // check logic get review_total
            const aggregateReviewQuery = [
                {
                    $match: { is_deleted: false }, // Filter reviews that are not deleted
                },
                {
                    $group: {
                        _id: '$course_id', // Group by course_id
                        averageRating: { $avg: '$rating' }, // Calculate average rating
                        count: { $sum: 1 }, // Count number of reviews per course
                    },
                },
            ];
            const averageRatings = await this.reviewSchema.aggregate(aggregateReviewQuery).exec();
            if (averageRatings) {
                // Find average rating for the course from `averageRatings`
                const averageRatingObj = averageRatings.find((r) => r._id.toString() === id.toString());
                if (averageRatingObj) {
                    detail[0].average_rating = averageRatingObj.averageRating;
                    detail[0].review_count = averageRatingObj.count; // Optionally store review count
                } else {
                    detail[0].average_rating = 0; // Set default if no reviews found
                    detail[0].review_count = 0; // Set default review count
                }
            }
        }

        return detail[0] || null; // Return course detail or null if not found
    }
}
