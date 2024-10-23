import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import CourseController from './course.controller';
import CreateCourseDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateCourseDto from './dtos/update.dto';

export default class CourseRoute implements IRoute {
    public path = API_PATH.COURSE;
    public router = Router();
    public courseController = new CourseController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/course -> create new item
        this.router.post(
            this.path,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(CreateCourseDto),
            this.courseController.create,
        );

        // POST domain:/api/course/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_COURSE,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.courseController.getItems,
        );

        // GET domain:/api/course/:id -> Get item by id
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.INSTRUCTOR]), this.courseController.getItem);

        // POST domain:/api/course/change-status -> Change status item
        this.router.put(
            API_PATH.CHANGE_STATUS_COURSE,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            this.courseController.changeStatus,
        );

        // PUT domain:/api/course/:id -> Update item
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(UpdateCourseDto),
            this.courseController.updateItem,
        );

        // POST domain:/api/course/:id -> Delete item logic
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.INSTRUCTOR]),
            this.courseController.deleteItem,
        );
    }
}
