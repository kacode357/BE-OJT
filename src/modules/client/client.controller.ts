import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import { ICourse } from '../course';
import ClientService from './client.service';
import SearchCourseWithPaginationDto from './dtos/searchCourseWithPagination.dto';

export default class ClientController {
    private clientService = new ClientService();

    public getCourses = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchCourseWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ICourse> = await this.clientService.getCourses(model, req.user);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ICourse>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getCourseDetail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ICourse = await this.clientService.getCourseDetail(req.params.id, req.user);
            res.status(HttpStatus.Success).json(formatResponse<ICourse>(item));
        } catch (error) {
            next(error);
        }
    };
}
