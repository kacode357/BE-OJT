import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import { ICart } from './cart.interface';
import CatService from './cart.service';
import CreateCartDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateCartDto from './dtos/update.dto';

export default class CatController {
    private catService = new CatService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateCartDto = req.body;
            const item: ICart = await this.catService.create(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<ICart>(item));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ICart> = await this.catService.getItems(model, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ICart>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ICart = await this.catService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<ICart>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateCartDto = req.body;
            await this.catService.updateStatusItem(model, req.user);
            res.status(HttpStatus.Created).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.catService.deleteItem(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
