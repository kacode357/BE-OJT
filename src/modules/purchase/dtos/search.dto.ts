import { IsBoolean, IsIn, IsString } from 'class-validator';
import { PurchaseStatusList } from '../purchase.constant';
import { PurchaseStatus } from '../purchase.interface';

export default class SearchPurchaseDto {
    constructor(
        purchase_no: string = '',
        cart_no: string = '',
        course_id: string = '',
        status: PurchaseStatus | string = '',
        is_deleted: boolean = false,
    ) {
        this.purchase_no = purchase_no;
        this.cart_no = cart_no;
        this.course_id = course_id;
        this.status = status;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public purchase_no: string;

    @IsString()
    public cart_no: string;

    @IsString()
    public course_id: string;

    @IsIn(PurchaseStatusList)
    public status: PurchaseStatus | string;

    @IsBoolean()
    public is_deleted: boolean;
}
