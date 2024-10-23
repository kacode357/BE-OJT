import { Document } from 'mongoose';
import { CourseStatus } from '../course.interface';

export interface ICourseLog extends Document {
    _id: string;
    course_id: string | null;
    course_name?: string;
    user_id: string | null;
    user_name?: string;
    old_status: CourseStatus;
    new_status: CourseStatus;
    comment: string;
    created_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false
}
