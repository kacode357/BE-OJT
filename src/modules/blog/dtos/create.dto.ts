import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export default class CreateBlogDto {
    constructor(
        user_id: string = '',
        name: string,
        category_id: string,
        image_url: string,
        description: string,
        content: string,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.user_id = user_id;
        this.name = name;
        this.category_id = category_id;
        this.image_url = image_url;
        this.description = description;
        this.content = content;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsString()
    public category_id: string;

    @IsNotEmpty()
    @IsString()
    public image_url: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsNotEmpty()
    @IsString()
    public content: string;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
