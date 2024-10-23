import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import { ISetting } from '../setting';
import { IUser } from '../user';
import MigrateService from './migrate.service';

export default class MigrateController {
    private migrateService = new MigrateService();

    public migrateSettingDefault = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result: ISetting = await this.migrateService.migrateSettingDefault();
            res.status(HttpStatus.Created).json(formatResponse<ISetting>(result));
        } catch (error) {
            next(error);
        }
    };

    public migrateFieldsForUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results: IUser[] = await this.migrateService.migrateFieldsForUsers();
            res.status(HttpStatus.Created).json(formatResponse<IUser[]>(results));
        } catch (error) {
            next(error);
        }
    };
}
