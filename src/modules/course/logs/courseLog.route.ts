import { Router } from "express";
import { API_PATH } from "../../../core/constants";
import { IRoute } from "../../../core/interfaces";
import { authMiddleWare, validationMiddleware } from "../../../core/middleware";
import { UserRoleEnum } from "../../user";
import CourseLogController from "./courseLog.controller";
import SearchWithPaginationDto from "./dtos/searchWithPagination.dto";


export default class CourseLogRoute implements IRoute {
    public path = API_PATH.COURSE_LOG;
    public router = Router();
    public courseLogController = new CourseLogController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // POST domain:/api/course/log/search -> Get all items
        this.router.post(
            API_PATH.SEARCH_COURSE_LOG,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.INSTRUCTOR]),
            validationMiddleware(SearchWithPaginationDto),
            this.courseLogController.getItems,
        );
    }
}
