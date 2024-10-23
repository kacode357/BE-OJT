import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import CreateSessionDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSessionDto from './dtos/update.dto';
import SessionController from './session.controller';

export default class SessionRoute implements IRoute {
    public path = API_PATH.SESSION;
    public router = Router();
    public sessionController = new SessionController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/session -> create new item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(CreateSessionDto),
            this.sessionController.create,
        );

        // POST domain:/api/session/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_SESSION,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.sessionController.getItems,
        );

        // GET domain:/api/session/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.INSTRUCTOR]), this.sessionController.getItem);

        // PUT domain:/api/session/:id -> Update item
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(UpdateSessionDto),
            this.sessionController.updateItem,
        );

        // POST domain:/api/session/:id -> Delete item logic
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            this.sessionController.deleteItem,
        );
    }
}
