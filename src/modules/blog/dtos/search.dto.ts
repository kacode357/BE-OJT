import { IsBoolean, IsString } from 'class-validator';

export default class SearchBlogDto {
    constructor(
        category_id: string = '',
        is_deleted: boolean = false,
    ) {
        this.category_id = category_id;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public category_id: string;

    @IsBoolean()
    public is_deleted: boolean;
}
