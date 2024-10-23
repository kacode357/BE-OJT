import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import CreateLessonDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateLessonDto from './dtos/update.dto';
import LessonController from './lesson.controller';

export default class LessonRoute implements IRoute {
    public path = API_PATH.LESSON;
    public router = Router();
    public lessonController = new LessonController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/lesson -> create new item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(CreateLessonDto),
            this.lessonController.create,
        );

        // POST domain:/api/lesson/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_LESSON,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.lessonController.getItems,
        );

        // GET domain:/api/lesson/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare(), this.lessonController.getItem);

        // PUT domain:/api/lesson/:id -> Update item
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(UpdateLessonDto),
            this.lessonController.updateItem,
        );

        // POST domain:/api/lesson/:id -> Delete item logic
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            this.lessonController.deleteItem,
        );
    }
}
