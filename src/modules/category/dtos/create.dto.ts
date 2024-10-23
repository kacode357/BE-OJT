import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export default class CreateCategoryDto {
    constructor(
        name: string,
        description: string = '',
        parent_category_id: string | null = null,
        user_id: string | null = null,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.name = name;
        this.parent_category_id = parent_category_id;
        this.user_id = user_id;
        this.description = description;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    @IsNotEmpty()
    public name: string;

    public parent_category_id: string | null;
    public user_id: string | null;
    public description: string;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
