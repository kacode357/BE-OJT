import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkUserMatch, checkValidUrl, formatPaginationResult, isEmptyObject, itemsQuery } from '../../core/utils';
import { CourseSchema, ICourse } from '../course';
import { ISession, SessionSchema } from '../session';
import CreateLessonDto from './dtos/create.dto';
import SearchLessonDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateLessonDto from './dtos/update.dto';
import { LessonTypeEnum } from './lesson.enum';
import { ILesson } from './lesson.interface';
import LessonSchema from './lesson.model';
import { UserRoleEnum } from '../user';
import { DataStoredInToken } from '../auth';

export default class LessonService {
    private lessonSchema: Model<ILesson> = LessonSchema;
    private courseSchema: Model<ICourse> = CourseSchema;
    private sessionSchema: Model<ISession> = SessionSchema;

    public async create(model: CreateLessonDto, userId: string): Promise<ILesson> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        model.user_id = userId;
        let errorResults: IError[] = [];

        // check valid course, session
        const { course, errorsWithCourse } = await this.checkCourseAndSessionValid(model);
        errorResults = [...errorResults, ...errorsWithCourse];

        if (course) {
            // check valid lesson name not duplicate in course
            const errorsWithLessonName = await this.checkLessonName(model, course);
            errorResults = [...errorResults, ...errorsWithLessonName];
        }

        // check valid lesson type
        errorResults = [...errorResults, ...this.checkValidLessonType(model)];

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const createdItem: ILesson = await this.lessonSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        userData: DataStoredInToken,
    ): Promise<SearchPaginationResponseModel<ILesson>> {
        const searchCondition = { ...new SearchLessonDto(), ...model.searchCondition };
        const { keyword, course_id, session_id, lesson_type, is_position_order, is_deleted } = searchCondition;
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

        if (session_id) {
            query = {
                ...query,
                session_id: new mongoose.Types.ObjectId(session_id),
            };
        }

        if (userData.role === UserRoleEnum.INSTRUCTOR) {
            query = {
                ...query,
                user_id: new mongoose.Types.ObjectId(userData.id),
            };
        }

        query = itemsQuery(query, { lesson_type, is_deleted });

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
                $lookup: {
                    from: 'sessions',
                    localField: 'session_id',
                    foreignField: '_id',
                    as: 'session',
                },
            },
            { $unwind: '$session' },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    user_name: '$user.name',
                    course_id: 1,
                    course_name: '$course.name',
                    session_id: 1,
                    session_name: '$session.name',
                    name: 1,
                    lesson_type: 1,
                    description: 1,
                    video_url: 1,
                    image_url: 1,
                    full_time: 1,
                    position_order: 1,
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        ];

        const aggregateQuery = this.lessonSchema.aggregate(aggregatePipeline);
        const items = await aggregateQuery.exec();
        const rowCount = await this.lessonSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<ILesson>();
        const result = formatPaginationResult<ILesson>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async getItemById(id: string): Promise<ILesson> {
        const detail = await this.lessonSchema.findOne({ _id: id, is_deleted: false }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }
        return detail;
    }

    public async updateItem(id: string, model: UpdateLessonDto, userId: string): Promise<ILesson> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        let errorResults: IError[] = [];

        // check item exits
        const item = await this.getItemById(id);
        if (item && item.user_id) {
            // check valid user
            await checkUserMatch(userId, item.user_id.toString(), 'lesson');
        }

        // check valid course, session
        const { course, errorsWithCourse } = await this.checkCourseAndSessionValid(model);
        errorResults = [...errorResults, ...errorsWithCourse];

        if (course) {
            // check valid lesson name not duplicate in course
            if (item.name.toLowerCase() !== model.name.toLowerCase()) {
                const errorsWithLessonName = await this.checkLessonName(model, course);
                errorResults = [...errorResults, ...errorsWithLessonName];
            }
        }

        // check valid lesson type
        errorResults = [...errorResults, ...this.checkValidLessonType(model)];

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const updateData = {
            name: model.name,
            course_id: model.course_id,
            session_id: model.session_id,
            lesson_type: model.lesson_type,
            description: model.description,
            video_url: model.video_url,
            image_url: model.image_url,
            full_time: model.full_time,
            position_order: model.position_order,
            updated_at: new Date(),
        };

        const updatedItem = await this.lessonSchema.updateOne({ _id: id }, updateData);

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
            await checkUserMatch(userId, item.user_id.toString(), 'lesson');
        }

        const updatedItem = await this.lessonSchema.updateOne(
            { _id: id },
            { is_deleted: true, updated_at: new Date() },
        );

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }

    private checkCourseAndSessionValid = async (model: CreateLessonDto | UpdateLessonDto) => {
        const errorResults: IError[] = [];

        const course = await this.courseSchema
            .findOne({ _id: model.course_id, user_id: model.user_id, is_deleted: false })
            .lean();
        if (!course) {
            errorResults.push({
                message: 'The selected course cannot be used!',
                field: 'course_id',
            });
        }

        const session = await this.sessionSchema
            .findOne({ _id: model.session_id, course_id: model.course_id, user_id: model.user_id, is_deleted: false })
            .lean();
        if (!session) {
            errorResults.push({
                message: 'The selected session cannot be used!',
                field: 'session_id',
            });
        }
        return {
            course,
            errorsWithCourse: errorResults,
        };
    };

    private checkLessonName = async (model: CreateLessonDto | UpdateLessonDto, course: ICourse) => {
        const errorResults: IError[] = [];

        // check duplicate name in course
        const item = await this.lessonSchema.findOne({
            course_id: model.course_id,
            name: { $regex: new RegExp('^' + model.name + '$', 'i') },
            is_deleted: false,
        });
        if (item) {
            errorResults.push({
                message: `Lesson with name is '${model.name}' already exists in course '${course.name}'!`,
                field: 'name',
            });
        }
        return errorResults;
    };

    private checkValidLessonType = (model: CreateLessonDto | UpdateLessonDto) => {
        const errorResults: IError[] = [];

        switch (model.lesson_type) {
            case LessonTypeEnum.TEXT:
                if (!model.description) {
                    errorResults.push({
                        message: `Please enter description for lesson!`,
                        field: 'description',
                    });
                }
                break;
            case LessonTypeEnum.IMAGE:
                if (!model.image_url) {
                    errorResults.push({
                        message: `Please enter image_url url for lesson!`,
                        field: 'image_url',
                    });
                } else {
                    if (!checkValidUrl(model.image_url)) {
                        throw new HttpException(HttpStatus.BadRequest, `The URL '${model.image_url}' is not valid`);
                    }
                }
                break;
            default:
                if (!model.video_url) {
                    errorResults.push({
                        message: `Please enter video_url url for lesson!`,
                        field: 'video_url',
                    });
                } else {
                    if (!checkValidUrl(model.video_url)) {
                        throw new HttpException(HttpStatus.BadRequest, `The URL '${model.video_url}' is not valid`);
                    }
                }
                break;
        }

        return errorResults;
    };
}
