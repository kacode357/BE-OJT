import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import BlogController from './blog.controller';
import CreateBlogDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateBlogDto from './dtos/update.dto';

export default class BlogRoute implements IRoute {
    public path = API_PATH.BLOG;
    public router = Router();
    public blogController = new BlogController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/blog -> Create new item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(CreateBlogDto),
            this.blogController.create,
        );

        // POST domain:/api/blog/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_BLOG,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(SearchWithPaginationDto),
            this.blogController.getItems,
        );

        // GET domain:/api/blog/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN]), this.blogController.getItem);

        // PUT domain:/api/blog/:id -> Update item
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(UpdateBlogDto),
            this.blogController.updateItem,
        );

        // POST domain:/api/blog/:id -> Delete item logic
        this.router.delete(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN]), this.blogController.deleteItem);
    }
}
