import siteRouter from './site.js';

const routes = (app) => {
    app.use('/', siteRouter);
};

export default routes;
