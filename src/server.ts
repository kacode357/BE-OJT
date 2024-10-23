import dotenv from 'dotenv';
import App from './app';
import { validateEnv } from './core/utils';
import { AuthRoute } from './modules/auth';
import { BlogRoute } from './modules/blog';
import { CartRoute } from './modules/cart';
import { CategoryRoute } from './modules/category';
import { ClientRoute } from './modules/client';
import { CourseRoute } from './modules/course';
import { CourseLogRoute } from './modules/course/logs';
import { IndexRoute } from './modules/index';
import { LessonRoute } from './modules/lesson';
import { MigrateRoute } from './modules/migrate';
import { PayoutRoute } from './modules/payout';
import { PurchaseRoute } from './modules/purchase';
import { ReviewRoute } from './modules/review';
import { SessionRoute } from './modules/session';
import { SettingRoute } from './modules/setting';
import { SubscriptionRoute } from './modules/subscription';
import { UserRoute } from './modules/user';

dotenv.config();

validateEnv();

const routes = [
    new IndexRoute(),
    new MigrateRoute(),
    new SettingRoute(),
    new AuthRoute(),
    new UserRoute(),
    new SubscriptionRoute(),
    new CategoryRoute(),
    new CourseRoute(),
    new CourseLogRoute(),
    new SessionRoute(),
    new LessonRoute(),
    new ReviewRoute(),
    new CartRoute(),
    new PurchaseRoute(),
    new PayoutRoute(),
    new BlogRoute(),
    new ClientRoute(),
];

const app = new App(routes);

app.listen();
