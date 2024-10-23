import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import CreateLessonDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSessionDto from './dtos/update.dto';
import { IReview } from './review.interface';
import ReviewService from './review.service';

export default class ReviewController {
    private reviewService = new ReviewService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateLessonDto = req.body;
            const newItem: IReview = await this.reviewService.create(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<IReview>(newItem));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<IReview> = await this.reviewService.getItems(
                model,
                req.user.id,
            );
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IReview>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: IReview = await this.reviewService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<IReview>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateSessionDto = req.body;
            const item: IReview = await this.reviewService.updateItem(req.params.id, model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<IReview>(item));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.reviewService.deleteItem(req.params.id, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
