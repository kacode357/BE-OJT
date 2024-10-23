import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import PurchaseController from './purchase.controller';

export default class PurchaseRoute implements IRoute {
    public path = API_PATH.PURCHASE;
    public router = Router();
    public purchaseController = new PurchaseController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/purchase/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_PURCHASE,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(SearchWithPaginationDto),
            this.purchaseController.getItems,
        );

        // POST domain:/api/purchase/search-for-instructor -> Get all items for instructor
        this.router.post(
            API_PATH.SEARCH_PURCHASE_BY_INSTRUCTOR,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.purchaseController.getItems,
        );

        // POST domain:/api/purchase/search-for-instructor -> Get all items for subscriber
        this.router.post(
            API_PATH.SEARCH_PURCHASE_BY_STUDENT,
            authMiddleWare([UserRoleEnum.INSTRUCTOR, UserRoleEnum.STUDENT]),
            validationMiddleware(SearchWithPaginationDto),
            this.purchaseController.getItems,
        );
    }
}
