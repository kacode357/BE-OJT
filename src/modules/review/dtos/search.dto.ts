import { IsBoolean, IsNumber, IsString } from 'class-validator';

export default class SearchReviewDto {
    constructor(
        course_id: string = '',
        rating: number = 0,
        is_instructor: boolean = true,
        is_rating_order: boolean = false,
        is_deleted: boolean = false,
    ) {
        this.course_id = course_id;
        this.rating = rating;
        this.is_instructor = is_instructor;
        this.is_rating_order = is_rating_order;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public course_id: string;

    @IsNumber()
    public rating: number;

    @IsBoolean()
    public is_instructor: boolean;

    @IsBoolean()
    public is_rating_order: boolean;

    @IsBoolean()
    public is_deleted: boolean;
}
