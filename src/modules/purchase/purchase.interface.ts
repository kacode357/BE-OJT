import { Document } from 'mongoose';
import { PurchaseStatusEnum } from './purchase.enum';

export type PurchaseStatus = PurchaseStatusEnum.NEW | PurchaseStatusEnum.REQUEST_PAID | PurchaseStatusEnum.COMPLETED;

export interface IPurchase extends Document {
    _id: string;
    purchase_no: string;
    status: PurchaseStatus;
    cart_id: string | null; // required, reference to Cart model
    cart_no?: string;
    course_id: string | null; // required, reference to Course model
    course_name?: string;
    student_id: string | null; // required, reference to User model
    student_name?: string;
    instructor_id: string | null; // required, reference to User model
    instructor_name?: string | null;
    price_paid: number;
    price: number;
    discount: number;
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
