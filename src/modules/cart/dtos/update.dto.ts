import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CartStatusList } from '../cart.constant';
import { CartStatusEnum } from '../cart.enum';
import { CartStatus } from './../cart.interface';

export default class UpdateCartDto {
    constructor(status: CartStatusEnum = CartStatusEnum.WAITING_PAID, items: UpdateCartItemDto[]) {
        this.status = status;
        this.items = items;
    }

    @IsIn(CartStatusList)
    public status: CartStatus;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateCartItemDto)
    @ArrayNotEmpty()
    public items: UpdateCartItemDto[];
}

class UpdateCartItemDto {
    constructor(_id: string, cart_no: string) {
        this._id = _id;
        this.cart_no = cart_no;
    }

    @IsNotEmpty()
    @IsString()
    public _id: string;

    @IsNotEmpty()
    @IsString()
    public cart_no: string;
}
