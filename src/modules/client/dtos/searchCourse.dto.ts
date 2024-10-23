import { IsBoolean, IsString } from 'class-validator';

export default class SearchCourseDto {
    constructor(
        keyword: string = '',
        category_id: string = '',
        is_deleted: boolean = false,
    ) {
        this.keyword = keyword;
        this.category_id = category_id;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsString()
    public category_id: string;

    @IsBoolean()
    public is_deleted: boolean;
}
