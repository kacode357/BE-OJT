import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import CategoryController from './category.controller';
import CreateCategoryDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateCategoryDto from './dtos/update.dto';

export default class CategoryRoute implements IRoute {
    public path = API_PATH.CATEGORY;
    public router = Router();
    public categoryController = new CategoryController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/category -> create new item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(CreateCategoryDto),
            this.categoryController.create,
        );

        // POST domain:/api/category/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_CATEGORY,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.categoryController.getItems,
        );

        // GET domain:/api/category/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN]), this.categoryController.getItem);

        // PUT domain:/api/category/:id -> Update item
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(UpdateCategoryDto),
            this.categoryController.updateItem,
        );

        // POST domain:/api/category/:id -> Delete item logic
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.categoryController.deleteItem,
        );
    }
}
