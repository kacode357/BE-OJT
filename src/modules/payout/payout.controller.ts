import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import CreatePayoutDto from './dtos/create.dto';
import { IPayout } from './payout.interface';
import PayoutService from './payout.service';
import UpdateStatusPayoutDto from './dtos/update.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import { SearchPaginationResponseModel } from '../../core/models';

export default class PayoutController {
    private payoutService = new PayoutService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreatePayoutDto = req.body;
            const item: IPayout = await this.payoutService.create(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<IPayout>(item));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<IPayout> = await this.payoutService.getItems(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IPayout>>(result));
        } catch (error) {
            next(error);
        }
    };

    public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateStatusPayoutDto = req.body;
            await this.payoutService.updateStatus(req.params.id, model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
