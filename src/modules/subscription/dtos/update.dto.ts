import { IsBoolean, IsDate, IsString } from 'class-validator';

export default class UpdateSubscriptionDto {
    constructor(
        subscriber_id: string = '',
        instructor_id: string = '',
        is_subscribed: boolean = false,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.subscriber_id = subscriber_id;
        this.instructor_id = instructor_id;
        this.is_subscribed = is_subscribed;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public subscriber_id: string;

    @IsString()
    public instructor_id: string;

    @IsBoolean()
    public is_subscribed: boolean;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
