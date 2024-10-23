import { IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CourseStatusEnum } from '../course.enum';
import { CourseStatus } from '../course.interface';
import { CourseStatusList } from '../course.contant';

export default class CreateCourseDto {
    constructor(
        name: string,
        category_id: string,
        user_id: string,
        description: string,
        content: string = '',
        status: CourseStatus = CourseStatusEnum.NEW,
        video_url: string,
        image_url: string,
        price: number,
        discount: number = 0,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.name = name;
        this.category_id = category_id;
        this.user_id = user_id;
        this.description = description;
        this.content = content;
        this.status = status;
        this.video_url = video_url;
        this.image_url = image_url;
        this.price = price;
        this.discount = discount;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
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

    @IsNotEmpty()
    @IsIn(CourseStatusList)
    public status: CourseStatus;

    @IsString()
    public video_url: string;

    public image_url: string;

    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @IsNumber()
    public discount: number;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
