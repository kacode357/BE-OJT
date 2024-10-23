import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { PayoutStatusEnum } from './payout.enum';
import { IPayout } from './payout.interface';

const PayoutSchemaEntity: Schema<IPayout> = new Schema({
    payout_no: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: PayoutStatusEnum,
        default: PayoutStatusEnum.NEW,
        required: true,
    },
    transactions: [
        {
            price: { type: Number, required: true },
            discount: { type: Number, required: true },
            price_paid: { type: Number, required: true },
            purchase_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PURCHASE, required: true },
            created_at: { type: Date, default: Date.now },
        },
    ],
    instructor_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    instructor_ratio: { type: Number, required: true },
    balance_origin: { type: Number, required: true },
    balance_instructor_paid: { type: Number, required: true },
    balance_instructor_received: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const PayoutSchema = mongoose.model<IPayout & mongoose.Document>(COLLECTION_NAME.PAYOUT, PayoutSchemaEntity);
export default PayoutSchema;
