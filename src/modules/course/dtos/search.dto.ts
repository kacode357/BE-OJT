import { IsBoolean, IsIn, IsString } from 'class-validator';
import { CourseStatusList } from '../course.contant';
import { CourseStatus } from '../course.interface';

export default class SearchCourseDto {
    constructor(
        keyword: string = '',
        category_id: string = '',
        status: CourseStatus | string = '',
        is_deleted: boolean = false,
    ) {
        this.keyword = keyword;
        this.category_id = category_id;
        this.status = status;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsString()
    public category_id: string;

    @IsIn(CourseStatusList)
    public status: CourseStatus | string;

    @IsBoolean()
    public is_deleted: boolean;
}
