import { IsBoolean, IsString } from 'class-validator';

export default class SearchCategoryDto {
    constructor(
        keyword: string = '',
        is_parent: boolean = false,
        is_deleted: boolean = false,
    ) {
        this.keyword = keyword;
        this.is_parent = is_parent;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsBoolean()
    public is_parent: boolean;

    @IsBoolean()
    public is_deleted: boolean;
}
