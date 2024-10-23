import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class UpdateCourseDto {
    constructor(
        name: string,
        category_id: string,
        user_id: string,
        description: string,
        content: string = '',
        video_url: string = '',
        image_url: string = '',
        price: number,
        discount: number,
    ) {
        this.name = name;
        this.category_id = category_id;
        this.user_id = user_id;
        this.description = description;
        this.content = content;
        this.video_url = video_url;
        this.image_url = image_url;
        this.price = price;
        this.discount = discount;
    }

    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsString()
    public category_id: string;

    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsString()
    public content: string;

    @IsString()
    public video_url: string;

    public image_url: string;

    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @IsNumber()
    public discount: number;
}
