import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import { ISetting } from './setting.interface';
import SettingService from './setting.service';

export default class SettingController {
    private settingService = new SettingService();

    public getSettingDefault = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item: ISetting = await this.settingService.getSettingDefault();
            res.status(HttpStatus.Success).json(formatResponse<ISetting>(item));
        } catch (error) {
            next(error);
        }
    };
}
