import siteRouter from './site.js';
import authRouter from './auth.js';

const routes = (app) => {
    app.use('/', siteRouter);
    app.use('/api/auth', authRouter);
};

export default routes;
