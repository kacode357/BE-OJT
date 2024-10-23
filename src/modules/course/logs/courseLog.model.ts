import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../../core/constants';
import { CourseStatusEnum } from '../course.enum';
import { ICourseLog } from './courseLog.interface';

const CourseLogSchemaEntity: Schema<ICourseLog> = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.COURSE, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    old_status: {
        type: String,
        enum: CourseStatusEnum,
        default: CourseStatusEnum.NEW,
        required: true,
    },
    new_status: {
        type: String,
        enum: CourseStatusEnum,
        default: CourseStatusEnum.NEW,
        required: true,
    },
    comment: { type: String },
    created_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const CourseLogSchema = mongoose.model<ICourseLog & mongoose.Document>(
    COLLECTION_NAME.COURSE_LOG,
    CourseLogSchemaEntity,
);
export default CourseLogSchema;
