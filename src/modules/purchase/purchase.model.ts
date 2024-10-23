import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { PurchaseStatusEnum } from './purchase.enum';
import { IPurchase } from './purchase.interface';

const PurchaseSchemaEntity: Schema<IPurchase> = new Schema({
    purchase_no: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: PurchaseStatusEnum,
        default: PurchaseStatusEnum.NEW,
        required: true,
    },
    price_paid: { type: Number },
    price: { type: Number },
    discount: { type: Number },
    cart_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.CART, required: true },
    course_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.COURSE, required: true }, // TODO: remove after
    student_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true }, // TODO: remove after
    instructor_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true }, // TODO: remove after
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const PurchaseSchema = mongoose.model<IPurchase & mongoose.Document>(COLLECTION_NAME.PURCHASE, PurchaseSchemaEntity);
export default PurchaseSchema;
