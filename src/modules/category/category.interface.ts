import { Document } from 'mongoose';

export interface ICategory extends Document {
    _id: string;
    name: string; // required
    parent_category_id?: string | null; // reference to Category model
    user_id: string | null; // required, reference to User model
    description?: string;
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
