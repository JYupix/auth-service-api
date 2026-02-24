import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import * as controller from './bookmarks.controller.js';

const router = Router();

router.get('/me', authenticateToken, controller.getMyBookmarks);

export default router;