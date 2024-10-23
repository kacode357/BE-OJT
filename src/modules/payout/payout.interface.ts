import { Document } from 'mongoose';
import { PayoutStatusEnum } from './payout.enum';

export type PayoutStatus =
    | PayoutStatusEnum.NEW
    | PayoutStatusEnum.REQUEST_PAYOUT
    | PayoutStatusEnum.COMPLETED
    | PayoutStatusEnum.REJECTED;

export interface IPayoutTransaction {
    price: number; // default 0,
    discount: number; // default 0,
    price_paid: number; // default 0,
    purchase_id: string; // required, reference to Purchase model
}

export interface IPayout extends Document {
    _id: string;
    payout_no: string;
    status: PayoutStatus;
    transactions: IPayoutTransaction[];
    instructor_id: string | null; // required, reference to User model
    instructor_name?: string | null;
    instructor_ratio?: number; // instructor_ratio when paid for instructor
    balance_origin: number;
    balance_instructor_paid: number;
    balance_instructor_received: number;
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
