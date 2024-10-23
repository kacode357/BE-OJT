import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class CreateReviewDto {
    constructor(
        user_id: string,
        course_id: string,
        comment: string,
        rating: number = 1,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.user_id = user_id;
        this.course_id = course_id;
        this.comment = comment;
        this.rating = rating;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    @IsString()
    public comment: string;

    @IsNumber()
    public rating: number;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
