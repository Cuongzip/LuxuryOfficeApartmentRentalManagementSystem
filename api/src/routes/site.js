import { Router } from 'express';

import { siteController } from '../controllers/index.js';
import { asyncHandler } from '../utils/index.js';

const router = Router();

router.get('/', asyncHandler(siteController.home));

export default router;
