import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class CreateSessionDto {
    constructor(
        name: string,
        user_id: string,
        course_id: string,
        description: string = '',
        position_order: number = 99,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.name = name;
        this.user_id = user_id;
        this.course_id = course_id;
        this.description = description;
        this.position_order = position_order;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
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

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
