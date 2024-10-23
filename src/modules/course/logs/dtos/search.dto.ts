import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { CourseStatus } from '../../course.interface';

export default class SearchCourseLogDto {
    constructor(
        course_id: string,
        keyword: string = '',
        old_status: CourseStatus | string = '',
        new_status: CourseStatus | string = '',
        is_deleted: boolean = false,
    ) {
        this.course_id = course_id;
        this.keyword = keyword;
        this.old_status = old_status;
        this.new_status = new_status;
        this.is_deleted = is_deleted;
    }

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    @IsString()
    public keyword: string;

    @IsString()
    public old_status: CourseStatus | string;

    @IsString()
    public new_status: CourseStatus | string;

    @IsBoolean()
    public is_deleted: boolean;
}
