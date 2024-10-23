import { IsBoolean, IsString } from 'class-validator';

export default class SearchSubscriptionDto {
    constructor(keyword: string = '', is_subscribed: boolean = true, is_deleted: boolean = false) {
        this.keyword = keyword;
        this.is_subscribed = is_subscribed;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsBoolean()
    public is_subscribed: boolean;
    
    @IsBoolean()
    public is_deleted: boolean;
}
