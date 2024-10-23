import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import CreateSessionDto from './dtos/create.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateSessionDto from './dtos/update.dto';
import { ISession } from './session.interface';
import SessionService from './session.service';

export default class SessionController {
    private sessionService = new SessionService();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateSessionDto = req.body;
            const newItem: ISession = await this.sessionService.create(model, req.user.id);
            res.status(HttpStatus.Created).json(formatResponse<ISession>(newItem));
        } catch (error) {
            next(error);
        }
    };

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ISession> = await this.sessionService.getItems(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISession>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ISession = await this.sessionService.getItemById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<ISession>(item));
        } catch (error) {
            next(error);
        }
    };

    public updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateSessionDto = req.body;
            const item: ISession = await this.sessionService.updateItem(req.params.id, model, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<ISession>(item));
        } catch (error) {
            next(error);
        }
    };

    public deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.sessionService.deleteItem(req.params.id, req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
