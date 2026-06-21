import siteRouter from './site.js';
import authRouter from './auth.js';
import buildingRouter from './building.js';
import roomRouter from './room.js';
import contractRouter from './contract.js';
import locationRouter from './location.js';
import requestRouter from './request.js';
import customerRouter from './customer.js';
import invoiceRouter from './invoice.js';
import statisticsRouter from './statistics.js';
import occupantRouter from './occupant.js';

const routes = (app) => {
    app.use('/', siteRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/buildings', buildingRouter);
    app.use('/api/rooms', roomRouter);
    app.use('/api/contracts', contractRouter);
    app.use('/api/invoices', invoiceRouter);
    app.use('/api', locationRouter);
    app.use('/api/requests', requestRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/statistics', statisticsRouter);
    app.use('/api/occupants', occupantRouter);
};


export default routes;
