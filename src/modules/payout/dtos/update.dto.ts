import { IsIn, IsString } from 'class-validator';
import { PayoutStatusList } from '../payout.contant';
import { PayoutStatus } from '../payout.interface';

export default class UpdateStatusPayoutDto {
    constructor(status: PayoutStatus, comment: string = '') {
        this.status = status;
        this.comment = comment;
    }

    @IsIn(PayoutStatusList)
    public status: PayoutStatus;

    @IsString()
    public comment: string;
}
