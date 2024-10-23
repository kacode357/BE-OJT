import { Document } from 'mongoose';

export interface ISubscription extends Document {
    _id: string;
    subscriber_id: string | null; // required, reference to User model
    instructor_id: string | null; // required, reference to User model
    is_subscribed: boolean;
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic when user is deleted, default is false
}
