import { IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { LessonTypeList } from '../lesson.contant';
import { LessonTypeEnum } from './../lesson.enum';
import { LessonType } from './../lesson.interface';

export default class CreateLessonDto {
    constructor(
        name: string,
        user_id: string,
        course_id: string,
        session_id: string,
        lesson_type: LessonType = LessonTypeEnum.VIDEO,
        description: string = '',
        video_url: string = '',
        image_url: string = '',
        full_time: number = 0,
        position_order: number = 99,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.name = name;
        this.user_id = user_id;
        this.course_id = course_id;
        this.session_id = session_id;
        this.lesson_type = lesson_type;
        this.description = description;
        this.video_url = video_url;
        this.image_url = image_url;
        this.full_time = full_time;
        this.position_order = position_order;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    @IsNotEmpty()
    @IsString()
    public name: string;

    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    @IsNotEmpty()
    @IsString()
    public session_id: string;

    @IsNotEmpty()
    @IsIn(LessonTypeList)
    public lesson_type: LessonType;

    @IsString()
    public description: string;

    @IsString()
    public video_url: string;

    @IsString()
    public image_url: string;

    @IsNumber()
    public full_time: number;

    @IsNumber()
    public position_order: number;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
