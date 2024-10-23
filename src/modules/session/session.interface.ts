import { Document } from 'mongoose';
import { ILesson } from '../lesson';

export interface ISession extends Document {
    _id: string;
    name: string; // required
    user_id: string | null; // required, reference to User model
    user_name: string;
    course_id: string | null; // required, reference to User model
    course_name: string;
    description: string;
    position_order: number; // sort by position
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false

    // optional full info
    full_time: number;
    is_show: boolean;
    lesson_list: ILesson[];
}
