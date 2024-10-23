import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import CreateLessonDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSessionDto from './dtos/update.dto';
import { ILesson } from './lesson.interface';
import LessonService from './lesson.service';

export default class LessonController {
    private lessonService = new LessonService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateLessonDto = req.body;
            const newItem: ILesson = await this.lessonService.create(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<ILesson>(newItem));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ILesson> = await this.lessonService.getItems(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ILesson>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ILesson = await this.lessonService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<ILesson>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateSessionDto = req.body;
            const item: ILesson = await this.lessonService.updateItem(req.params.id, model, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<ILesson>(item));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.lessonService.deleteItem(req.params.id, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
