import { NextFunction, Request, Response } from 'express';
import { API_PATH } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import { IPurchase } from './purchase.interface';
import PurchaseService from './purchase.service';

export default class PurchaseController {
    private purchaseService = new PurchaseService();

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const routerPath = req.route.path;
            const is_instructor = routerPath === API_PATH.SEARCH_PURCHASE_BY_INSTRUCTOR ? true : false;
            const result: SearchPaginationResponseModel<IPurchase> = await this.purchaseService.getItems(
                model,
                req.user,
                is_instructor,
            );
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IPurchase>>(result));
        } catch (error) {
            next(error);
        }
    };
}
