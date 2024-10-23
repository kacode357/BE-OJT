import { IsBoolean, IsString } from 'class-validator';

export default class SearchSessionDto {
    constructor(
        keyword: string = '',
        course_id: string = '',
        is_position_order: boolean = false,
        is_deleted: boolean = false,
    ) {
        this.keyword = keyword;
        this.course_id = course_id;
        this.is_position_order = is_position_order;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsString()
    public course_id: string;

    @IsBoolean()
    public is_position_order: boolean;

    @IsBoolean()
    public is_deleted: boolean;
}
