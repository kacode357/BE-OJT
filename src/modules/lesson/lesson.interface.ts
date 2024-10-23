import { Document } from 'mongoose';

export type LessonType = 'video' | 'image' | 'text';

export interface ILesson extends Document {
    _id: string;
    name: string; // required
    user_id: string | null; // required, reference to User model
    user_name: string;
    course_id: string | null; // required, reference to Course model
    course_name: string;
    session_id: string | null; // required, reference to Category model
    session_name: string;
    lesson_type: LessonType;
    description: string; // required, html
    video_url: string; // required
    image_url: string; // required
    full_time: number; // second
    position_order: number; // sort by position
    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic, default is false

    // option full info
    // TODO: assignment
    // assignmentList:
    is_show: boolean;
}
