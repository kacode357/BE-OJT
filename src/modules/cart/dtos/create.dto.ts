import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';
import { CartStatusEnum } from '../cart.enum';
import { CartStatus } from '../cart.interface';

export default class CreateCartDto {
    constructor(
        course_id: string,
        status: CartStatus = CartStatusEnum.NEW,
        price: number = 0,
        discount: number = 0,
        cart_no: string = '',
        student_id: string = '',
        instructor_id: string = '',
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.course_id = course_id;
        this.cart_no = cart_no;
        this.status = status;
        this.price = price;
        this.discount = discount;
        this.student_id = student_id;
        this.instructor_id = instructor_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    @IsNotEmpty()
    @IsString()
    public course_id: string;

    public status: CartStatus;
    public price: number;
    public discount: number;

    @IsString()
    public cart_no: string;

    @IsString()
    public student_id: string;

    @IsString()
    public instructor_id: string;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
