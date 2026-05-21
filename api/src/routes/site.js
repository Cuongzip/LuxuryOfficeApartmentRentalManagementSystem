import express from 'express';

import siteController from '../controllers/site.js';

const router = express.Router();

router.get('/', siteController.home);

export default router;
