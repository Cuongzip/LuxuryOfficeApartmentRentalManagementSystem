import { Router } from 'express';

import * as siteController from '../controllers/siteController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(siteController.home));

export default router;
