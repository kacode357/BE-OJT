import { IsBoolean, IsIn, IsString } from 'class-validator';
import { CartStatusList } from '../cart.constant';
import { CartStatus } from '../cart.interface';
import { CartStatusEnum } from '../cart.enum';

export default class SearchCartDto {
    constructor(course_id: string = '', status: CartStatus = CartStatusEnum.NEW, is_deleted: boolean = false) {
        this.course_id = course_id;
        this.status = status;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public course_id: string;

    @IsIn(CartStatusList)
    public status: CartStatus;

    @IsBoolean()
    public is_deleted: boolean;
}
