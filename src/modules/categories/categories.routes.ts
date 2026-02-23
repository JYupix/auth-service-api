import { Router } from 'express';
import * as controller from './categories.controller.js';
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";

const router = Router();

router.get('/', controller.getCategories);
router.get('/:slug/posts', controller.getPostsByCategory);

router.post('/', authenticateToken, isAdmin, controller.createCategory);
router.patch('/:slug', authenticateToken, isAdmin, controller.updateCategory);
router.delete('/:slug', authenticateToken, isAdmin, controller.deleteCategory);

export default router;