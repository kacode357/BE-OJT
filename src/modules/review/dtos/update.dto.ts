import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class UpdateReviewDto {
    constructor(user_id: string, course_id: string, comment: string, rating: number) {
        this.user_id = user_id;
        this.course_id = course_id;
        this.comment = comment;
        this.rating = rating;
    }

    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    @IsString()
    public comment: string;

    @IsNumber()
    public rating: number;
}
