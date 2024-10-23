import { IsBoolean, IsString } from 'class-validator';
import { LessonType } from '../lesson.interface';

export default class SearchLessonDto {
    constructor(
        keyword: string = '',
        course_id: string = '',
        session_id: string = '',
        lesson_type: LessonType | string = '',
        is_position_order: boolean = false,
        is_deleted: boolean = false,
    ) {
        this.keyword = keyword;
        this.course_id = course_id;
        this.session_id = session_id;
        this.lesson_type = lesson_type;
        this.is_position_order = is_position_order;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsString()
    public course_id: string;

    @IsString()
    public session_id: string;

    @IsString()
    public lesson_type: LessonType | string;

    @IsBoolean()
    public is_position_order: boolean;

    @IsBoolean()
    public is_deleted: boolean;
}
