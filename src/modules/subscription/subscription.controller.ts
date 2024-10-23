import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSubscriptionDto from './dtos/update.dto';
import { ISubscription } from './subscription.interface';
import SubscriptionService from './subscription.service';
import { API_PATH } from '../../core/constants';

export default class SubscriptionController {
    private subscriptionService = new SubscriptionService();

    public createOrUpdate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateSubscriptionDto = req.body;
            const item: ISubscription = await this.subscriptionService.createOrUpdate(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<ISubscription>(item));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const routerPath = req.route.path;
            const is_instructor = routerPath === API_PATH.SEARCH_SUBSCRIPTION_BY_INSTRUCTOR ? true : false;
            const result: SearchPaginationResponseModel<ISubscription> = await this.subscriptionService.getItems(
                model,
                req.user.id,
                is_instructor,
            );
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISubscription>>(result));
        } catch (error) {
            next(error);
        }
    };
}
