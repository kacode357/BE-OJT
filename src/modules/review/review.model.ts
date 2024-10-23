import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IReview } from './review.interface';

const ReviewSchemaEntity: Schema<IReview> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    course_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.COURSE, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const ReviewSchema = mongoose.model<IReview & mongoose.Document>(COLLECTION_NAME.REVIEW, ReviewSchemaEntity);
export default ReviewSchema;
