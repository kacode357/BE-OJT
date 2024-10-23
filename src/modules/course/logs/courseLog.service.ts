import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '../../../core/enums';
import { HttpException } from '../../../core/exceptions';
import { SearchPaginationResponseModel } from '../../../core/models';
import { formatPaginationResult, itemsQuery } from '../../../core/utils';
import { UserRoleEnum } from '../../user';
import { ICourse } from '../course.interface';
import CourseSchema from '../course.model';
import { ICourseLog } from './courseLog.interface';
import CourseLogSchema from './courseLog.model';
import SearchCourseLogDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';

export default class CourseLogService {
    private courseSchema: Model<ICourse> = CourseSchema;
    private courseLogSchema: Model<ICourseLog> = CourseLogSchema;

    public async getItems(
        model: SearchWithPaginationDto,
        userRole: string,
    ): Promise<SearchPaginationResponseModel<ICourseLog>> {
        const searchCondition = {
            ...new SearchCourseLogDto(model.searchCondition.course_id),
            ...model.searchCondition,
        };
        const { course_id, keyword, old_status, new_status, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        // check user permissions
        if (userRole !== UserRoleEnum.ADMIN && userRole !== UserRoleEnum.INSTRUCTOR) {
            throw new HttpException(HttpStatus.BadRequest, 'You does not have permission view course logs.');
        }

        // check course exist
        const course = await this.courseSchema.findById(course_id);
        if (!course) {
            throw new HttpException(HttpStatus.BadRequest, 'Course is not exist.');
        }

        let query = {};
        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query = {
                comment: { $regex: keywordValue, $options: 'i' },
            };
        }

        query = itemsQuery(query, { old_status, new_status, is_deleted });

        query = {
            ...query,
            course_id: new mongoose.Types.ObjectId(course_id),
        };

        const aggregateQuery = this.courseLogSchema.aggregate([
            {
                $match: query,
            },
            { $sort: { created_at: -1 } },
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
                    user_id: 1,
                    user_name: '$user.name',
                    course_id: 1,
                    course_name: '$course.name',
                    comment: 1,
                    old_status: 1,
                    new_status: 1,
                    created_at: 1,
                    is_deleted: 1,
                },
            },
        ]);

        const items = await aggregateQuery.exec();
        const rowCount = await this.courseLogSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<ICourseLog>();
        const result = formatPaginationResult<ICourseLog>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }
}
