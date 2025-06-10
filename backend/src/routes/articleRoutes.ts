import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  updateArticle,
} from '../controllers/articleController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/').get(getArticles).post(protect, createArticle);
router
  .route('/:id')
  .get(getArticleById)
  .put(protect, updateArticle)
  .delete(protect, deleteArticle);

export default router;