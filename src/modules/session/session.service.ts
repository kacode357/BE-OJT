import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkUserMatch, formatPaginationResult, isEmptyObject, itemsQuery } from '../../core/utils';
import { CourseSchema, ICourse } from '../course';
import { ILesson, LessonSchema } from '../lesson';
import CreateSessionDto from './dtos/create.dto';
import SearchSessionDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSessionDto from './dtos/update.dto';
import { ISession } from './session.interface';
import SessionSchema from './session.model';
import { DataStoredInToken } from '../auth';
import { UserRoleEnum } from '../user';

export default class SessionService {
    private sessionSchema: Model<ISession> = SessionSchema;
    private courseSchema: Model<ICourse> = CourseSchema;
    private lessonSchema: Model<ILesson> = LessonSchema;

    public async create(model: CreateSessionDto, userId: string): Promise<ISession> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }


        model.user_id = userId;
        const errorResults: IError[] = [];

        // check valid course
        const course = await this.courseSchema.findOne({ _id: model.course_id, user_id: userId }).lean();
        if (!course) {
            errorResults.push({
                message: 'The course is not created by the currently logged in user!',
                field: 'course_id',
            });
        }

        if (course) {
            // check valid session name not duplicate in course
            const item = await this.sessionSchema.findOne({
                course_id: model.course_id,
                name: { $regex: new RegExp('^' + model.name + '$', 'i') },
                is_deleted: false,
            });
            if (item) {
                errorResults.push({
                    message: `Session with name is '${model.name}' already exists in course '${course.name}'!`,
                    field: 'name',
                });
            }
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const createdItem: ISession = await this.sessionSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        userData: DataStoredInToken,
    ): Promise<SearchPaginationResponseModel<ISession>> {
        const searchCondition = { ...new SearchSessionDto(), ...model.searchCondition };
        const { keyword, course_id, is_position_order, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};
        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query = {
                name: { $regex: keywordValue, $options: 'i' },
            };
        }

        if (course_id) {
            query = {
                ...query,
                course_id: new mongoose.Types.ObjectId(course_id),
            };
        }

        if (userData.role === UserRoleEnum.INSTRUCTOR) {
            query = {
                ...query,
                user_id: new mongoose.Types.ObjectId(userData.id),
            };
        }

        query = itemsQuery(query, { is_deleted });

        const aggregatePipeline: any[] = [
            {
                $match: query,
            },
            {
                $sort: is_position_order ? { position_order: 1 } : { updated_at: -1 },
            },
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
                    name: 1,
                    description: 1,
                    position_order: 1,
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        ];

        const aggregateQuery = this.sessionSchema.aggregate(aggregatePipeline);
        const items = await aggregateQuery.exec();
        const rowCount = await this.sessionSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<ISession>();
        const result = formatPaginationResult<ISession>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async getItemById(id: string): Promise<ISession> {
        const detail = await this.sessionSchema.findOne({ _id: id, is_deleted: false }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }
        return detail;
    }

    public async updateItem(id: string, model: UpdateSessionDto, userId: string): Promise<ISession> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const errorResults: IError[] = [];

        // check item exits
        const item = await this.getItemById(id);
        if (item && item.user_id) {
            // check valid user
            await checkUserMatch(userId, item.user_id.toString(), 'session');
        }

        // check valid course
        const course = await this.courseSchema.findOne({ _id: model.course_id, user_id: userId }).lean();
        if (!course) {
            errorResults.push({
                message: 'The course is not created by the currently logged in user!',
                field: 'course_id',
            });
        }

        if (course) {
            // check valid session name not duplicate in course
            if (item.name.toLowerCase() !== model.name.toLowerCase()) {
                const itemDuplicate = await this.sessionSchema.findOne({
                    course_id: model.course_id,
                    name: { $regex: new RegExp('^' + model.name + '$', 'i') },
                    is_deleted: false,
                });
                if (itemDuplicate) {
                    errorResults.push({
                        message: `Session with name is '${model.name}' already exists in course '${course.name}'!`,
                        field: 'name',
                    });
                }
            }
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const updateData = {
            name: model.name,
            course_id: model.course_id,
            description: model.description || item.description,
            position_order: model.position_order || item.position_order,
            updated_at: new Date(),
        };

        const updatedItem = await this.sessionSchema.updateOne({ _id: id }, updateData);

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

        if (item && item.user_id) {
            // check valid user
            await checkUserMatch(userId, item.user_id.toString(), 'session');
        }

        // check if session is used in any lesson
        const lesson = await this.lessonSchema.findOne({ session_id: id });
        if (lesson) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'The session cannot be deleted because it is being used for another lesson.',
            );
        }

        const updatedItem = await this.sessionSchema.updateOne(
            { _id: id },
            { is_deleted: true, updated_at: new Date() },
        );

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }
}
