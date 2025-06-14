import { Router } from 'express';
import {
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', addComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;