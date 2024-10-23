## Requirements
- node --version: v20.2.0
- npm --version: v9.6.6
- yarn --version: 1.22.19
- install node, npm or yarn
- create file .env with 3 fields:
    - NODE_ENV: development
    - JWT_TOKEN_SECRET: set the secret token as you like
    - MONGODB_URI: get the mongoDB uri of the link to your account
    - EMAIL_USER: set email for admin
    - EMAIL_PASSWORD: set email_password for admin
    - DOMAIN_FE: domain default send mail

## Running the project
- yarn or npm install: install node_modules
- yarn dev or npm run dev: run src
- src run API in localhost: http://localhost:3000

## References
- https://expressjs.com/en/resources/middleware/morgan.html
- https://www.typescriptlang.org/tsconfig/
- https://github.com/winstonjs/winston
- Test 2