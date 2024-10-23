import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../../core/enums';
import { SearchPaginationResponseModel } from '../../../core/models';
import { formatResponse } from '../../../core/utils';
import { ICourseLog } from './courseLog.interface';
import CourseLogService from './courseLog.service';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';

export default class CourseLogController {
    private courseLogService = new CourseLogService();

    public getItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchWithPaginationDto = req.body;
            const result: SearchPaginationResponseModel<ICourseLog> = await this.courseLogService.getItems(
                model,
                req.user.role,
            );
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ICourseLog>>(result));
        } catch (error) {
            next(error);
        }
    };
}
