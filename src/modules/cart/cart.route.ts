import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import CatController from './cart.controller';
import CreateCartDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import { UserRoleEnum } from '../user';
import UpdateCartDto from './dtos/update.dto';

export default class CartRoute implements IRoute {
    public path = API_PATH.CART;
    public router = Router();
    public catController = new CatController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/cart -> create new item
        this.router.post(this.path, authMiddleWare(), validationMiddleware(CreateCartDto), this.catController.create);

        // POST domain:/api/cart/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_CART,
            authMiddleWare(),
            validationMiddleware(SearchWithPaginationDto),
            this.catController.getItems,
        );

        // GET domain:/api/cart/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare(), this.catController.getItem);

        // POST domain:/api/cart/update-status -> update status item
        this.router.put(
            API_PATH.UPDATE_STATUS_CART,
            authMiddleWare(),
            validationMiddleware(UpdateCartDto),
            this.catController.updateStatus,
        );

        // POST domain:/api/course/:id -> Delete item logic
        this.router.delete(`${this.path}/:id`, authMiddleWare(), this.catController.deleteItem);
    }
}
