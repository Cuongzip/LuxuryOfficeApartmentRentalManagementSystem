import express from 'express';
import morgan from 'morgan';
import methodOverride from 'method-override';

import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use('/static', express.static('src/resources/public'));

routes(app);

app.use(notFound);
app.use(errorHandler);

export default app;
