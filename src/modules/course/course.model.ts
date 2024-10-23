import mongoose, { Schema } from 'mongoose';
import { CourseStatusEnum } from '.';
import { COLLECTION_NAME } from '../../core/constants';
import { ICourse } from './course.interface';

const CourseSchemaEntity: Schema<ICourse> = new Schema({
    name: { type: String, unique: true, index: true, required: true },
    category_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.CATEGORY, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    description: { type: String, required: true },
    content: { type: String },
    status: {
        type: String,
        enum: CourseStatusEnum,
        default: CourseStatusEnum.NEW,
        required: true,
    },
    video_url: {
        type: String,
        required: [
            function () {
                return !this.image_url;
            },
            'Please enter video_url url for course!',
        ],
    },
    image_url: {
        type: String,
        required: [
            function () {
                return !this.video_url;
            },
            'Please enter image_url url for course!',
        ],
    },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0, max: 100, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const CourseSchema = mongoose.model<ICourse & mongoose.Document>(COLLECTION_NAME.COURSE, CourseSchemaEntity);
export default CourseSchema;
