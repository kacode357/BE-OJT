import { IsBoolean, IsDate, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { CourseStatusList } from '../../course.contant';
import { CourseStatus } from '../../course.interface';

export default class CreateCourseLogDto {
    constructor(
        user_id: string,
        course_id: string,
        old_status: CourseStatus,
        new_status: CourseStatus,
        comment: string,
        created_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.user_id = user_id;
        this.course_id = course_id;
        this.old_status = old_status;
        this.new_status = new_status;
        this.comment = comment;
        this.created_at = created_at;
        this.is_deleted = is_deleted;
    }

    @IsNotEmpty()
    @IsString()
    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    @IsIn(CourseStatusList)
    public old_status: CourseStatus;

    @IsIn(CourseStatusList)
    public new_status: CourseStatus;

    public comment: string;

    @IsDate()
    public created_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
