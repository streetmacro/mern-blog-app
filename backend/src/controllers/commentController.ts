import { Request, Response, NextFunction } from 'express';
import Comment, { IComment } from '../models/Comment';
import Article from '../models/Article';
import mongoose from 'mongoose';

//Расширяем тип Request для включения пользователя из authMiddleware
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

//@desc    Добавление нового комментария к статье
//@route   POST /api/comments
//@access  Приватный
export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { text, articleId } = req.body;

  if (!text || !articleId) {
    return res.status(400).json({ message: 'Please provide text and articleId' });
  }

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    return res.status(400).json({ message: 'Invalid article ID format' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no token or user' });
  }

  try {
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = new Comment({
      text,
      article: articleId,
      author: req.user.id,
    });

    const createdComment = await comment.save();

    //Добавляем комментарий в массив комментариев статьи
    article.comments.push(createdComment._id);
    await article.save();

    // Populate author details for the response
    const populatedComment = await Comment.findById(createdComment._id).populate('author', 'email');

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

//@desc    Обновление комментария
//@route   PUT /api/comments/:id
//@access  Приватный
export const updateComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { text } = req.body;
  const commentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: 'Invalid comment ID format' });
  }

  if (!text) {
    return res.status(400).json({ message: 'Please provide text for the comment' });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!req.user || comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this comment' });
    }

    comment.text = text;
    const updatedComment = await comment.save();
    
    // Populate author details for the response
    const populatedComment = await Comment.findById(updatedComment._id).populate('author', 'email');

    res.json(populatedComment);
  } catch (error) {
    next(error);
  }
};

//@desc    Удаление комментария
//@route   DELETE /api/comments/:id
//@access  Приватный
export const deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const commentId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: 'Invalid comment ID format' });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!req.user || comment.author.toString() !== req.user.id) {
      // Also allow article author to delete comments on their article - optional feature
      // const article = await Article.findById(comment.article);
      // if (!article || article.author.toString() !== req.user.id) {
      //   return res.status(403).json({ message: 'User not authorized to delete this comment' });
      // }
      return res.status(403).json({ message: 'User not authorized to delete this comment' });
    }

    // Remove comment ID from article's comments array
    await Article.findByIdAndUpdate(comment.article, { $pull: { comments: comment._id } });

    await comment.deleteOne(); // Mongoose v6+ uses deleteOne()

    res.json({ message: 'Comment removed successfully' });
  } catch (error) {
    next(error);
  }
};