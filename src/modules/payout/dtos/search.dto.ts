import { IsBoolean, IsIn, IsString } from 'class-validator';
import { PayoutStatusList } from '../payout.contant';
import { PayoutStatus } from '../payout.interface';

export default class SearchPayoutDto {
    constructor(
        payout_no: string = '',
        instructor_id: string = '',
        status: PayoutStatus | string = '',
        is_deleted: boolean = false,
    ) {
        this.payout_no = payout_no;
        this.instructor_id = instructor_id;
        this.status = status;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public payout_no: string;

    @IsString()
    public instructor_id: string;

    @IsIn(PayoutStatusList)
    public status: PayoutStatus | string;

    @IsBoolean()
    public is_deleted: boolean;
}
