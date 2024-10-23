import { IsIn, IsNotEmpty } from 'class-validator';
import { CourseStatusList } from '../course.contant';
import { CourseStatus } from '../course.interface';

export default class ChangeStatusDto {
    constructor(course_id: string, new_status: CourseStatus, comment: string) {
        this.course_id = course_id;
        this.new_status = new_status;
        this.comment = comment;
    }

    @IsNotEmpty()
    public course_id: string;

    @IsIn(CourseStatusList)
    public new_status: CourseStatus;

    public comment: string;
}
