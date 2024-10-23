import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSubscriptionDto from './dtos/update.dto';
import SubscriptionController from './subscription.controller';

export default class SubscriptionRoute implements IRoute {
    public path = API_PATH.SUBSCRIPTION;
    public router = Router();
    public subscriptionController = new SubscriptionController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/subscription -> create or update item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.INSTRUCTOR, UserRoleEnum.STUDENT]),
            validationMiddleware(UpdateSubscriptionDto),
            this.subscriptionController.createOrUpdate,
        );

        // POST domain:/api/subscriptions/search-for-instructor -> Get all items for instructor
        this.router.post(
            API_PATH.SEARCH_SUBSCRIPTION_BY_INSTRUCTOR,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.subscriptionController.getItems,
        );

        // POST domain:/api/subscriptions/search-for-instructor -> Get all items for subscriber
        this.router.post(
            API_PATH.SEARCH_SUBSCRIPTION_BY_SUBSCRIBER,
            authMiddleWare([UserRoleEnum.INSTRUCTOR, UserRoleEnum.STUDENT]),
            validationMiddleware(SearchWithPaginationDto),
            this.subscriptionController.getItems,
        );
    }
}
