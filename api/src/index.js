import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import methodOverride from 'method-override';

import routes from './routes/index.js';
import connectDB from './config/connectDB.js';

const app = express();

const port = process.env.PORT || 3000;

// connectDB();

app.use(methodOverride('_method'));

app.use(express.json());

app.use(express.urlencoded());

app.use(morgan('combined'));

app.use('/static', express.static('src/resources/public'));

// app.set('view engine', 'pug');

// app.set('views', 'src/resources/views');

routes(app);

app.listen(port, () => {
    console.log(`Project listening on port ${port}`);
});
