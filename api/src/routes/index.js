import siteRouter from './site.js';
import authRouter from './auth.js';
import buildingRouter from './building.js';

const routes = (app) => {
    app.use('/', siteRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/buildings', buildingRouter);
};

export default routes;
