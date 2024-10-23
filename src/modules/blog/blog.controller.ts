import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import { IBlog } from './blog.interface';
import BlogService from './blog.service';
import CreateBlogDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateBlogDto from './dtos/update.dto';

export default class BlogController {
    private blogService = new BlogService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateBlogDto = req.body;
            const item: IBlog = await this.blogService.create(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<IBlog>(item));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<IBlog> = await this.blogService.getItems(model);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IBlog>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: IBlog = await this.blogService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<IBlog>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateBlogDto = req.body;
            const item: IBlog = await this.blogService.updateItem(req.params.id, model);
            res.status(HttpStatus.Success).json(formatResponse<IBlog>(item));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.blogService.deleteItem(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
