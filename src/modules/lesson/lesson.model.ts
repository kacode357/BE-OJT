import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { LessonTypeEnum } from './lesson.enum';
import { ILesson } from './lesson.interface';

const LessonSchemaEntity: Schema<ILesson> = new Schema({
    name: { type: String, index: true, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    course_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.COURSE, required: true },
    session_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SESSION, required: true },
    lesson_type: {
        type: String,
        enum: LessonTypeEnum,
        default: LessonTypeEnum.VIDEO,
        required: true,
    },
    description: { type: String },
    video_url: { type: String },
    image_url: { type: String },
    full_time: { type: Number, required: true },
    position_order: { type: Number, index: true, max: 99, min: 1 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const LessonSchema = mongoose.model<ILesson & mongoose.Document>(COLLECTION_NAME.LESSON, LessonSchemaEntity);
export default LessonSchema;
