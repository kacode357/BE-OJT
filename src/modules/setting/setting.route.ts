import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import SettingController from './setting.controller';

export default class SettingRoute implements IRoute {
    public path = API_PATH.SETTING;
    public router = Router();
    public settingController = new SettingController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET domain:/api/setting -> Get user by id
        this.router.get(
            API_PATH.SETTING_DEFAULT,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.settingController.getSettingDefault,
        );
    }
}
