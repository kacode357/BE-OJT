import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ISetting } from './setting.interface';

const SettingSchemaEntity: Schema<ISetting> = new Schema({
    balance: { type: Number, default: 0 },
    balance_total: { type: Number, default: 0 },
    instructor_ratio: { type: Number, default: 70 },
    transactions: [
        {
            type: { type: String, required: true },
            amount: { type: Number, required: true },
            balance_old: { type: Number, required: true },
            balance_new: { type: Number, required: true },
            purchase_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PURCHASE },
            payout_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PAYOUT },
            instructor_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
            instructor_ratio: { type: Number, default: 0 },
            created_at: { type: Date, default: Date.now },
        },
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const SettingSchema = mongoose.model<ISetting & mongoose.Document>(COLLECTION_NAME.SETTING, SettingSchemaEntity);
export default SettingSchema;
