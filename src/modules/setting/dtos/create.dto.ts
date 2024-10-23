import { IsBoolean, IsDate } from 'class-validator';
import { ISettingTransaction } from '../setting.interface';

export default class CreateSettingDto {
    constructor(
        balance: number = 0,
        balance_total: number = 0,
        instructor_ratio: number = 70,
        transactions: ISettingTransaction[] = [],
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.balance = balance;
        this.balance_total = balance_total;
        this.instructor_ratio = instructor_ratio;
        this.transactions = transactions;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    public balance: number;
    public balance_total: number;
    public instructor_ratio: number;
    public transactions: ISettingTransaction[];

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
