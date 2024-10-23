import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkUserMatch, checkValidUrl, formatPaginationResult, isEmptyObject, itemsQuery } from '../../core/utils';
import { sendMail } from '../../core/utils/sendMail';
import { DataStoredInToken } from '../auth';
import { CategorySchema, ICategory } from '../category';
import { ILesson, LessonSchema } from '../lesson';
import { ISession, SessionSchema } from '../session';
import { IUser, UserRoleEnum, UserSchema } from '../user';
import { VALID_STATUS_CHANGE_PAIRS } from './course.contant';
import { CourseStatusEnum } from './course.enum';
import { ICourse } from './course.interface';
import CourseSchema from './course.model';
import ChangeStatusDto from './dtos/changeStatus.dto';
import CreateCourseDto from './dtos/create.dto';
import SearchCourseDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateCourseDto from './dtos/update.dto';
import { ICourseLog } from './logs/courseLog.interface';
import CourseLogSchema from './logs/courseLog.model';
import CreateCourseLogDto from './logs/dtos/create.dto';

export default class CourseService {
    private userSchema: Model<IUser> = UserSchema;
    private categorySchema: Model<ICategory> = CategorySchema;
    private courseSchema: Model<ICourse> = CourseSchema;
    private sessionSchema: Model<ISession> = SessionSchema;
    private lessonSchema: Model<ILesson> = LessonSchema;
    private courseLogSchema: Model<ICourseLog> = CourseLogSchema;

    public async create(model: CreateCourseDto, userId: string): Promise<ICourse> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        model.user_id = userId;
        const errorResults: IError[] = [];

        // check category valid
        const category = await this.categorySchema.findOne({ _id: model.category_id, is_deleted: false });
        if (!category) {
            errorResults.push({
                message: `Category is not exists.`,
                field: 'category_id',
            });
        }

        // check name duplicates
        const item = await this.courseSchema.findOne({
            name: { $regex: new RegExp('^' + model.name + '$', 'i') },
            is_deleted: false,
        });
        if (item) {
            errorResults.push({
                message: `Course with name is '${model.name}' already exists!`,
                field: 'name',
            });
        }

        if (!model.image_url && !model.video_url) {
            errorResults.push({
                message: `Please provide image_url url or video_url url!`,
                field: 'video_url',
            });
        }

        if (model.image_url && !checkValidUrl(model.image_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.image_url}' is not valid`);
        }

        if (model.video_url && !checkValidUrl(model.video_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.video_url}' is not valid`);
        }

        if (model.discount < 0 || model.discount > 100) {
            errorResults.push({
                message: `Please enter discount in range 0-100!`,
                field: 'video_url',
            });
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const createdItem: ICourse = await this.courseSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(
        model: SearchWithPaginationDto,
        user: DataStoredInToken,
    ): Promise<SearchPaginationResponseModel<ICourse>> {
        const userId = user.id;
        const userRole = user.role;
        const searchCondition = { ...new SearchCourseDto(), ...model.searchCondition };
        const { keyword, category_id, status, is_deleted } = searchCondition;
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

        if (userRole === UserRoleEnum.INSTRUCTOR) {
            query = {
                ...query,
                user_id: new mongoose.Types.ObjectId(userId),
            };
        }

        query = itemsQuery(query, { status, is_deleted });

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
                            $group: {
                                _id: '$_id',
                                sessionCount: { $sum: 1 },
                                lessonCount: { $sum: { $size: '$lessons' } },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalSessions: { $sum: '$sessionCount' },
                                totalLessons: { $sum: '$lessonCount' },
                            },
                        },
                    ],
                    as: 'sessions',
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    user_name: '$user.name',
                    category_id: 1,
                    category_name: '$category.name',
                    name: 1,
                    status: 1,
                    image_url: 1,
                    video_url: 1,
                    price: 1,
                    discount: 1,
                    session_count: { $ifNull: [{ $arrayElemAt: ['$sessions.totalSessions', 0] }, 0] },
                    lesson_count: { $ifNull: [{ $arrayElemAt: ['$sessions.totalLessons', 0] }, 0] },
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        ]);

        const items = await aggregateQuery.exec();
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

    public async getItemById(id: string): Promise<ICourse> {
        const detail = await this.courseSchema.findOne({ _id: id, is_deleted: false }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Course is not exists.`);
        }
        return detail;
    }

    public async changeStatus(model: ChangeStatusDto, user: DataStoredInToken): Promise<ICourse> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const userId = user.id;
        const userRole = user.role;
        const { course_id, new_status, comment } = model;
        // check item exits
        const item = await this.getItemById(course_id);
        if (item && item.user_id && userRole !== UserRoleEnum.ADMIN) {
            // check valid user
            await checkUserMatch(userId, item.user_id.toString(), 'course');
        }

        const old_status = item.status;

        if (new_status === old_status) {
            throw new HttpException(HttpStatus.BadRequest, `This course has already with status is ${old_status}`);
        }

        const isValidChangeStatus = VALID_STATUS_CHANGE_PAIRS.some(
            (pair) => pair[0] === old_status && pair[1] === new_status,
        );

        if (!isValidChangeStatus) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Invalid status change. Current status: ${old_status} -> ${new_status}`,
            );
        }

        // check course valid by lesson
        const lesson = await this.lessonSchema.find({ course_id });
        if (!lesson.length) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'This course is not eligible to change status, please add sessions and lessons to the course.',
            );
        }

        if (
            userRole !== UserRoleEnum.ADMIN &&
            (String(new_status) === CourseStatusEnum.REJECT || String(new_status) === CourseStatusEnum.APPROVE)
        ) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `You do not have permission change status to ${CourseStatusEnum.APPROVE} or ${CourseStatusEnum.REJECT}!`,
            );
        }

        if (String(new_status) === CourseStatusEnum.REJECT) {
            if (!comment) {
                throw new HttpException(HttpStatus.BadRequest, `Please add comment for reason reject this course!`);
            }

            const instructor = await this.userSchema
                .findOne({ _id: item.user_id, is_deleted: false, is_verified: true })
                .lean();
            if (!instructor) {
                throw new HttpException(HttpStatus.BadRequest, `Instructor create this course is not exists.`);
            }

            // send mail for instructor reason reject course
            const sendMailResult = await sendMail({
                toMail: instructor.email,
                subject: `Reason reject course ${item.name}`,
                html: `Hello, ${instructor.name}.<br>The course <strong>${item.name}</strong> was rejected because the reason is:<br>${comment}`,
            });
            if (!sendMailResult) {
                throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${instructor.email}`);
            }
        }

        const updatedItem = await this.courseSchema.updateOne(
            { _id: course_id },
            { status: new_status, updated_at: new Date() },
        );

        const newLogs = await this.createCourseLog({
            user_id: userId,
            course_id,
            old_status,
            new_status,
            comment,
            created_at: new Date(),
            is_deleted: false,
        });

        if (!newLogs) {
            throw new HttpException(HttpStatus.BadRequest, `Update item log info failed!`);
        }

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Update item info failed!');
        }

        const result = await this.getItemById(course_id);
        return result;
    }

    public async updateItem(id: string, model: UpdateCourseDto, userId: string): Promise<ICourse> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const errorResults: IError[] = [];

        // check item exits
        const item = await this.getItemById(id);
        if (item && item.user_id) {
            // check valid user
            await checkUserMatch(userId, item.user_id.toString(), 'course');
        } else {
            throw new HttpException(HttpStatus.BadRequest, `Course is not exists.`);
        }

        // check category valid
        const category = await this.categorySchema.findOne({ _id: model.category_id, is_deleted: false });
        if (!category) {
            errorResults.push({
                message: `Category is not exists.`,
                field: 'category_id',
            });
        }

        // check name duplicates
        if (item.name.toLowerCase() !== model.name.toLowerCase()) {
            const itemDuplicate = await this.courseSchema.findOne({ name: model.name, is_deleted: false });
            if (itemDuplicate) {
                errorResults.push({ message: `Course with name is '${model.name}' already exists!`, field: 'name' });
            }
        }

        if (!model.image_url && !model.video_url) {
            errorResults.push({
                message: `Please provide image_url url or video_url url!`,
                field: 'video_url',
            });
        }

        if (model.discount < 0 || model.discount > 100) {
            errorResults.push({
                message: `Please enter discount in range 0-100!`,
                field: 'video_url',
            });
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const updateData = {
            name: model.name,
            category_id: model.category_id,
            description: model.description,
            content: model.content,
            video_url: model.video_url,
            image_url: model.image_url,
            price: model.price,
            discount: model.discount,
            updated_at: new Date(),
        };

        const updatedItem = await this.courseSchema.updateOne({ _id: id }, updateData);

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
            await checkUserMatch(userId, item.user_id.toString(), 'course');
        }

        // check if course is used in any session
        const lesson = await this.sessionSchema.findOne({ course_id: id });
        if (lesson) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'The course cannot be deleted because it is being used for another session.',
            );
        }

        const updatedItem = await this.courseSchema.updateOne(
            { _id: id },
            { is_deleted: true, updated_at: new Date() },
        );

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }

    public async getItemByIdWithUserId(id: string, userId: string, fieldError: string = ''): Promise<ICourse> {
        const detail = await this.courseSchema.findOne({ _id: id, user_id: userId }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, '', [
                { message: 'The course is not created by the currently logged in user!', field: fieldError },
            ]);
        }
        return detail;
    }

    private async createCourseLog(newLogs: CreateCourseLogDto): Promise<ICourseLog> {
        return this.courseLogSchema.create(newLogs);
    }
}
