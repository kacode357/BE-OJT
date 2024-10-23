import { PayoutStatusEnum } from './payout.enum';

export const PayoutStatusList = ['', PayoutStatusEnum.NEW, PayoutStatusEnum.REQUEST_PAYOUT, PayoutStatusEnum.COMPLETED, PayoutStatusEnum.REJECTED];

export const VALID_STATUS_CHANGE_PAIRS = [
    [PayoutStatusEnum.NEW, PayoutStatusEnum.REQUEST_PAYOUT],
    [PayoutStatusEnum.REJECTED, PayoutStatusEnum.REQUEST_PAYOUT],
    [PayoutStatusEnum.REQUEST_PAYOUT, PayoutStatusEnum.COMPLETED],
    [PayoutStatusEnum.REQUEST_PAYOUT, PayoutStatusEnum.REJECTED],
]