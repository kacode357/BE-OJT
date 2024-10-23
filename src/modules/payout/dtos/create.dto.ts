import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsDate,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
} from 'class-validator';
import { PayoutStatusList } from '../payout.contant';
import { PayoutStatusEnum } from '../payout.enum';
import { IPayoutTransaction, PayoutStatus } from '../payout.interface';

export default class CreatePayoutDto {
    constructor(
        transactions: IPayoutTransaction[],
        payout_no: string = '',
        status: PayoutStatus = PayoutStatusEnum.NEW,
        instructor_id: string = '',
        instructor_ratio: number = 0,
        balance_origin: number = 0,
        balance_instructor_paid: number = 0,
        balance_instructor_received: number = 0,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.transactions = transactions;
        this.payout_no = payout_no;
        this.status = status;
        this.instructor_id = instructor_id;
        this.instructor_ratio = instructor_ratio;
        this.balance_origin = balance_origin;
        this.balance_instructor_paid = balance_instructor_paid;
        this.balance_instructor_received = balance_instructor_received;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public payout_no: string;

    @IsIn(PayoutStatusList)
    public status: PayoutStatus;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransactionItemDto)
    @ArrayNotEmpty()
    public transactions: TransactionItemDto[];

    @IsString()
    public instructor_id: string;

    @IsNumber()
    public instructor_ratio: number;

    @IsNumber()
    public balance_origin: number;

    @IsNumber()
    public balance_instructor_paid: number;

    @IsNumber()
    public balance_instructor_received: number;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}

class TransactionItemDto {
    constructor(purchase_id: string, price_paid: number = 0, price: number = 0, discount: number = 0) {
        this.purchase_id = purchase_id;
        this.price_paid = price_paid;
        this.price = price;
        this.discount = discount;
    }

    @IsNotEmpty()
    @IsString()
    public purchase_id: string;

    public price_paid: number;
    public price: number;
    public discount: number;
}
