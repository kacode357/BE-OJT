import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       properties:
 *         google_id:
 *           type: string
 *           description: The Google ID of the user (optional).
 *           example: "1234567890"
 *         email:
 *           type: string
 *           description: The email address of the user.
 *           example: "user@example.com"
 *           minLength: 1
 *           format: email
 *         password:
 *           type: string
 *           description: The password for the user account (minimum 6 characters).
 *           example: "password123"
 *           minLength: 6
 *       required:
 *         - email
 *         - password
 */
export default class LoginDto {
    constructor(google_id: string, email: string, password: string) {
        this.email = email;
        this.google_id = google_id || '';
        this.password = password;
    }

    public google_id: string;

    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;
}
