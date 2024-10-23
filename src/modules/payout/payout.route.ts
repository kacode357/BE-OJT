import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import SearchPayoutDto from './dtos/search.dto';
import PayoutController from './payout.controller';

export default class PayoutRoute implements IRoute {
    public path = API_PATH.PAYOUT;
    public router = Router();
    public payoutController = new PayoutController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/payout -> create item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            this.payoutController.create,
        );

        // POST domain:/api/payout/search -> get items
        this.router.post(
            API_PATH.SEARCH_PAYOUT,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchPayoutDto),
            this.payoutController.getItems,
        );

        // PUT domain:/api/payout/update-status/:id -> update status item
        this.router.put(
            `${API_PATH.UPDATE_STATUS_PAYOUT}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            this.payoutController.updateStatus,
        );
    }
}
