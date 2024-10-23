import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class UpdateSessionDto {
    constructor(
        name: string,
        user_id: string,
        course_id: string,
        description: string,
        position_order: number,
    ) {
        this.name = name;
        this.user_id = user_id;
        this.course_id = course_id;
        this.description = description;
        this.position_order = position_order;
    }

    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    public user_id: string;

    @IsString()
    public description: string;

    @IsNumber()
    public position_order: number;
}
