import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ISubscription } from './subscription.interface';

const SubscriptionSchemaEntity: Schema<ISubscription> = new Schema({
    subscriber_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    instructor_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    is_subscribed: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const SubscriptionSchema = mongoose.model<ISubscription & mongoose.Document>(
    COLLECTION_NAME.SUBSCRIPTION,
    SubscriptionSchemaEntity,
);
export default SubscriptionSchema;
