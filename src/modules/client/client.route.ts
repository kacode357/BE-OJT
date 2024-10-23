import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { BlogController } from '../blog';
import SearchBlogWithPaginationDto from '../blog/dtos/searchWithPagination.dto';
import CategoryController from '../category/category.controller';
import SearchCategoryWithPaginationDto from '../category/dtos/searchWithPagination.dto';
import ClientController from './client.controller';
import SearchCourseWithPaginationDto from './dtos/searchCourseWithPagination.dto';

export default class ClientRoute implements IRoute {
    public path = API_PATH.CLIENT;
    public router = Router();
    public clientController = new ClientController();
    public categoryController = new CategoryController();
    public blogController = new BlogController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/client/course/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_COURSE_IN_CLIENT,
            authMiddleWare([], true),
            validationMiddleware(SearchCourseWithPaginationDto),
            this.clientController.getCourses,
        );

        // GET domain:/api/client/course/:id -> Get course detail by id
        this.router.get(
            `${API_PATH.COURSE_IN_CLIENT}/:id`,
            authMiddleWare([], true),
            this.clientController.getCourseDetail,
        );

        // POST domain:/api/client/category/search -> Get all category
        this.router.post(
            API_PATH.SEARCH_CATEGORY_IN_CLIENT,
            authMiddleWare([], true),
            validationMiddleware(SearchCategoryWithPaginationDto),
            this.categoryController.getItems,
        );

        // POST domain:/api/client/blog/search -> Get all blogs
        this.router.post(
            API_PATH.SEARCH_BLOG_IN_CLIENT,
            authMiddleWare([], true),
            validationMiddleware(SearchBlogWithPaginationDto),
            this.blogController.getItems,
        );

        // GET domain:/api/client/blog/:id -> Get blog detail
        this.router.get(
            `${API_PATH.BLOG_IN_CLIENT}/:id`,
            authMiddleWare([], true),
            this.blogController.getItem,
        );
    }
}
