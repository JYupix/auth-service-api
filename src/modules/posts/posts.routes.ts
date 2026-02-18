import { Router } from 'express';
import * as controller from './posts.controller.js';
import * as commentsController from '../comments/comments.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', controller.getPosts);
router.get('/me', authenticateToken, controller.getMyPosts);
router.get('/:slug', controller.getPostBySlug);
router.post('/', authenticateToken, controller.createPost);
router.patch('/:id', authenticateToken, controller.updatePost);
router.delete('/:id', authenticateToken, controller.deletePost);
router.get('/:id/comments', commentsController.getCommentsByPost);
router.post('/:id/comments', authenticateToken, commentsController.addCommentToPost);

export default router;