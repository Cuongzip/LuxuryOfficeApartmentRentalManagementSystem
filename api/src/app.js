import express from 'express';
import morgan from 'morgan';
import methodOverride from 'method-override';

import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/index.js';

const app = express();

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use('/static', express.static('src/resources/public'));

// Enable CORS for frontend client
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins in dev, or specify 'http://localhost:3001'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

routes(app);

app.use(notFound);
app.use(errorHandler);

export default app;
