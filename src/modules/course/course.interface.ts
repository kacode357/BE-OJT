import { Document } from 'mongoose';
import { ISession } from '../session';
import { CourseStatusEnum } from './course.enum';

export type CourseStatus =
    | CourseStatusEnum.NEW
    | CourseStatusEnum.WAITING_APPROVE
    | CourseStatusEnum.APPROVE
    | CourseStatusEnum.REJECT
    | CourseStatusEnum.ACTIVE
    | CourseStatusEnum.INACTIVE;

export interface ICourse extends Document {
    _id: string;
    name: string; // required
    user_id: string | null; // required, reference to User model
    user_name: string;
    category_id: string | null; // required, reference to Category model
    category_name: string;
    description: string; // required
    content?: string; // html
    status: CourseStatus;
    image_url: string; // required
    video_url: string; // required
    price: number; // required
    discount: number;
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false

    // option full info
    full_time?: number;
    session_list?: ISession[];
    price_paid?: number;
    instructor_id?: string;
    instructor_name?: string;
    average_rating?: number;
    review_count?: number;
    is_in_cart?: boolean; // flag
    is_purchased?: boolean; // flag
}
