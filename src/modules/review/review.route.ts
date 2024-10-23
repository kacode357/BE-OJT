import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import CreateReviewDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateReviewDto from './dtos/update.dto';
import ReviewController from './review.controller';

export default class ReviewRoute implements IRoute {
    public path = API_PATH.REVIEW;
    public router = Router();
    public reviewController = new ReviewController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/review -> create new item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(CreateReviewDto),
            this.reviewController.create,
        );

        // POST domain:/api/review/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_REVIEW,
            authMiddleWare([], true),
            validationMiddleware(SearchWithPaginationDto),
            this.reviewController.getItems,
        );

        // GET domain:/api/review/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.INSTRUCTOR]), this.reviewController.getItem);

        // PUT domain:/api/review/:id -> Update item
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(UpdateReviewDto),
            this.reviewController.updateItem,
        );

        // POST domain:/api/review/:id -> Delete item logic
        this.router.delete(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN]), this.reviewController.deleteItem);
    }
}
