import { Document } from 'mongoose';

export interface IBlog extends Document {
    _id: string;
    name: string; // required
    user_id: string | null; // required, reference to User model
    user_name: string;
    category_id: string | null; // required, reference to Category model
    category_name: string;
    description: string; // required, html
    image_url: string; // required
    content: string; // required
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
