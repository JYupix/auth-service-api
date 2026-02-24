import { Router } from 'express';
import * as controller from './posts.controller.js';
import * as commentsController from '../comments/comments.controller.js';
import * as likesController from '../likes/likes.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import * as bookmarksController from '../bookmarks/bookmarks.controller.js';

const router = Router();

// Posts routes
router.get('/', controller.getPosts);
router.get('/me', authenticateToken, controller.getMyPosts);
router.get('/feed', authenticateToken, controller.getFeed);
router.get('/:slug', controller.getPostBySlug);
router.post('/', authenticateToken, controller.createPost);
router.patch('/:id', authenticateToken, controller.updatePost);
router.delete('/:id', authenticateToken, controller.deletePost);

// Comments routes for posts
router.get('/:id/comments', commentsController.getCommentsByPost);
router.post('/:id/comments', authenticateToken, commentsController.addCommentToPost);

// Likes routes for posts
router.post('/:id/like', authenticateToken, likesController.likePost);
router.get('/:id/likes', likesController.getLikesForPost);

// Bookmarks routes for posts
router.post('/:id/bookmark', authenticateToken, bookmarksController.toogleBookmark);

export default router;