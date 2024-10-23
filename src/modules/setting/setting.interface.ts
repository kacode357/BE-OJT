import { Document } from 'mongoose';
import { SettingTransactionTypeEnum } from './setting.enum';

export type SettingTransactionType = SettingTransactionTypeEnum.PURCHASE | SettingTransactionTypeEnum.PAID;

export interface ISettingTransaction {
    type: SettingTransactionType;
    amount: number; // default 0,
    balance_old: number;
    balance_new: number;
    created_at: Date; // default new Date()
    purchase_id?: string; // required, reference to Purchase model

    payout_id?: string; // required, reference to Payout model
    instructor_id?: string; // required, reference to User model
    instructor_ratio?: number; // instructor_ratio when paid for instructor
}

export interface ISetting extends Document {
    balance: number; // default 0,
    balance_total: number; // total balance get all course history
    instructor_ratio: number; // default 70%
    transactions?: ISettingTransaction[];
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic when user is deleted, default is false
}
