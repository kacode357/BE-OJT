import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';
import { PurchaseStatusEnum } from '../purchase.enum';
import { PurchaseStatus } from '../purchase.interface';

export default class CreatePurchaseDto {
    constructor(
        purchase_no: string,
        cart_id: string,
        course_id: string,
        student_id: string,
        instructor_id: string,
        price_paid: number = 0,
        price: number = 0,
        discount: number = 0,
        status: PurchaseStatus = PurchaseStatusEnum.NEW,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.purchase_no = purchase_no;
        this.cart_id = cart_id;
        this.course_id = course_id;
        this.student_id = student_id;
        this.instructor_id = instructor_id;
        this.price_paid = price_paid;
        this.price = price;
        this.discount = discount;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    @IsNotEmpty()
    @IsString()
    public purchase_no: string;

    @IsNotEmpty()
    @IsString()
    public cart_id: string;

    public course_id: string;
    public student_id: string;
    public instructor_id: string;
    public price_paid: number;
    public price: number;
    public discount: number;
    public status: PurchaseStatus;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
