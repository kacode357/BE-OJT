import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import { ICourse } from './course.interface';
import CourseService from './course.service';
import ChangeStatusDto from './dtos/changeStatus.dto';
import CreateCourseDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';

export default class CourseController {
    private courseService = new CourseService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateCourseDto = req.body;
            const newItem: ICourse = await this.courseService.create(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<ICourse>(newItem));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ICourse> = await this.courseService.getItems(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ICourse>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ICourse = await this.courseService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<ICourse>(item));
        } catch (error) {
            next(error);
        }
    };

    public changeStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangeStatusDto = req.body;
            const item: ICourse = await this.courseService.changeStatus(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<ICourse>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateCourseDto = req.body;
            const item: ICourse = await this.courseService.updateItem(req.params.id, model, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<ICourse>(item));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.courseService.deleteItem(req.params.id, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
