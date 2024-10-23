import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { CartStatusEnum } from './cart.enum';
import { ICart } from './cart.interface';

const CartSchemaEntity: Schema<ICart> = new Schema({
    cart_no: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: CartStatusEnum,
        default: CartStatusEnum.NEW,
        required: true,
    },
    price_paid: { type: Number },
    price: { type: Number },
    discount: { type: Number },
    course_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.COURSE, required: true },
    student_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    instructor_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true }, // TODO: remove after
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const CartSchema = mongoose.model<ICart & mongoose.Document>(COLLECTION_NAME.CART, CartSchemaEntity);
export default CartSchema;
