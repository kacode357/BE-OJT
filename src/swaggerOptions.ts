import { SwaggerOptions } from 'swagger-ui-express';

// swaggerOptions.js
const swaggerOptions: SwaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Course Online Management API',
            version: '1.0.0',
            description: 'Tamoki Course Online Management API docs',
            contact: {
                email: 'loinguyenlamthanh@gmail.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `/api`, // URL máy chủ của bạn
            },
        ],
    },
    apis: ['./src/modules/**/*.ts'],
};

export default swaggerOptions;
