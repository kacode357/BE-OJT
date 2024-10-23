import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user';
import AuthController from './auth.controller';
import LoginDto from './auth.dto';

export default class AuthRoute implements IRoute {
    public path = API_PATH.AUTH;
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/auth -> Login normal
        /**
         * @swagger
         * /auth:
         *   post:
         *     tags:
         *       - auth
         *     summary: Login API and get token
         *     description: Input email and password
         *     operationId: login
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/LoginDto'
         *     responses:
         *       '200':
         *         description: Token retrieved successfully
         *       '400':
         *         description: Invalid input
         */
        this.router.post(this.path, validationMiddleware(LoginDto), this.authController.login);

        // POST domain:/api/auth/google -> Login via google
        this.router.post(API_PATH.AUTH_GOOGLE, this.authController.login);

        // POST domain:/api/auth/verify-token -> Verify token
        this.router.post(API_PATH.AUTH_VERIFY_TOKEN, this.authController.verifiedToken);

        // POST domain:/api/auth/resend-token -> Resend token via email
        this.router.post(API_PATH.AUTH_RESEND_TOKEN, this.authController.resendToken);

        // GET domain:/api/auth -> Require Login
        this.router.get(this.path, authMiddleWare(), this.authController.getCurrentLoginUser);

        // PUT domain:/api/auth/forgot-password -> Forgot password
        this.router.put(API_PATH.AUTH_FORGOT_PASSWORD, this.authController.forgotPassword);

        // GET domain:/api/auth/logout -> Logout user
        this.router.get(API_PATH.AUTH_LOGOUT, authMiddleWare(), this.authController.logout);
    }
}
