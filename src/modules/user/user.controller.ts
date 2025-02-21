import { NextFunction, Request, Response } from 'express';
import { API_PATH } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import ChangePasswordDto from './dtos/changePassword.dto';
import ChangeRoleDto from './dtos/changeRole.dto';
import ChangeStatusDto from './dtos/changeStatus.dto';
import RegisterDto from './dtos/register.dto';
import SearchPaginationUserDto from './dtos/searchPaginationUser.dto';
import UpdateUserDto from './dtos/updateUser.dto';
import { UserRoleEnum } from './user.enum';
import { IUser } from './user.interface';
import UserService from './user.service';
import ReviewProfileInstructorDto from './dtos/reviewProfileInstructorDto';

export default class UserController {
    private userService = new UserService();

    public generateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model = new RegisterDto(
                '',
                'admin',
                'admin@gmail.com',
                '123456',
                UserRoleEnum.ADMIN,
                true,
                '',
                '',
                '',
                '',
                'TPBank',
                '0938947221',
                'Tamoki',
                new Date(),
                true,
                '',
                new Date(),
                0,
                new Date(),
                new Date(),
                false,
            );
            const user: IUser = await this.userService.createUser(model, false, false);
            res.status(HttpStatus.Created).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const routerPath = req.route.path;
            const user: IUser = await this.userService.createUser(
                model,
                routerPath === API_PATH.USERS_GOOGLE,
                !(routerPath === API_PATH.CREATE_USERS),
            );
            res.status(HttpStatus.Created).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchPaginationUserDto = req.body;
            const result: SearchPaginationResponseModel<IUser> = await this.userService.getUsers(model);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IUser>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: IUser = await this.userService.getUserById(req.params.id, true, req.user);
            res.status(HttpStatus.Success).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangePasswordDto = req.body;
            await this.userService.changePassword(model);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public changeStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangeStatusDto = req.body;
            await this.userService.changeStatus(model);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public changeRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangeRoleDto = req.body;
            await this.userService.changeRole(model);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public reviewProfileInstructor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ReviewProfileInstructorDto = req.body;
            await this.userService.reviewProfileInstructor(model);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateUserDto = req.body;
            const user: IUser = await this.userService.updateUser(req.params.id, model);
            res.status(HttpStatus.Success).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.deleteUser(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
