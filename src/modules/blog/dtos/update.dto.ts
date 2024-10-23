import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateBlogDto {
    constructor(
        user_id: string,
        name: string,
        category_id: string,
        image_url: string,
        description: string,
        content: string,
    ) {
        this.user_id = user_id;
        this.name = name;
        this.category_id = category_id;
        this.image_url = image_url;
        this.description = description;
        this.content = content;
    }

    @IsNotEmpty()
    @IsString()
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
}
