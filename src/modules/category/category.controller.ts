import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import { ICategory } from './category.interface';
import CategoryService from './category.service';
import CreateCategoryDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';

export default class CategoryController {
    private categoryService = new CategoryService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateCategoryDto = req.body;
            const category: ICategory = await this.categoryService.create(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<ICategory>(category));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ICategory> = await this.categoryService.getItems(model);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ICategory>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ICategory = await this.categoryService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<ICategory>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateCategoryDto = req.body;
            const item: ICategory = await this.categoryService.updateItem(req.params.id, model);
            res.status(HttpStatus.Success).json(formatResponse<ICategory>(item));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.categoryService.deleteItem(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
