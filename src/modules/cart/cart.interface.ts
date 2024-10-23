import { Document } from 'mongoose';
import { CartStatusEnum } from './cart.enum';

export type CartStatus =
    | CartStatusEnum.NEW
    | CartStatusEnum.WAITING_PAID
    | CartStatusEnum.COMPLETED
    | CartStatusEnum.CANCEL;

export interface ICart extends Document {
    _id: string;
    cart_no: string; // unique
    status: CartStatus;
    price_paid?: number;
    price: number;
    discount: number;
    course_id: string | null; // required, reference to Course model
    course_name?: string;
    student_id: string | null; // required, reference to User model
    student_name?: string;
    instructor_id: string | null; // required, reference to User model
    instructor_name?: string;
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
