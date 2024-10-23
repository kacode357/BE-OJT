import { Document } from 'mongoose';

export interface IReview extends Document {
    _id: string;
    user_id: string | null; // required, reference to User model
    user_name: string;
    course_id: string | null; // required, reference to Course model
    course_name: string;
    comment: string; // required
    rating: number; // 1-5
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
