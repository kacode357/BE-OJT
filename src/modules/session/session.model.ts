import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ISession } from './session.interface';

const SessionSchemaEntity: Schema<ISession> = new Schema({
    name: { type: String, index: true, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    course_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.COURSE, required: true },
    description: { type: String },
    position_order: { type: Number, index: true, max: 99, min: 1 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const SessionSchema = mongoose.model<ISession & mongoose.Document>(COLLECTION_NAME.SESSION, SessionSchemaEntity);
export default SessionSchema;
