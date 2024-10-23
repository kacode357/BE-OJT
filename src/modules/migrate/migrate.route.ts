import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import MigrateController from './migrate.controller';

export default class MigrateRoute implements IRoute {
    public path = API_PATH.MIGRATE;
    public router = Router();
    public migrateController = new MigrateController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET domain:/api/migrate/setting -> Migrate setting default
        this.router.get(
            API_PATH.MIGRATE_SETTING,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.migrateController.migrateSettingDefault,
        );

        // GET domain:/api/migrate/users -> Migrate fields for users
        this.router.get(
            API_PATH.MIGRATE_USERS,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.migrateController.migrateFieldsForUsers,
        );
    }
}
