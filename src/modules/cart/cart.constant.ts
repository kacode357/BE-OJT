import { CartStatusEnum } from "./cart.enum";

export const CartStatusList = [
    '',
    CartStatusEnum.NEW,
    CartStatusEnum.WAITING_PAID,
    CartStatusEnum.COMPLETED,
    CartStatusEnum.CANCEL,
];

export const VALID_STATUS_CHANGE_PAIRS = [
    [CartStatusEnum.NEW, CartStatusEnum.WAITING_PAID],
    [CartStatusEnum.CANCEL, CartStatusEnum.WAITING_PAID],
    [CartStatusEnum.WAITING_PAID, CartStatusEnum.COMPLETED],
    [CartStatusEnum.WAITING_PAID, CartStatusEnum.CANCEL],
]