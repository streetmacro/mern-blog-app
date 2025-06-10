import { Request, Response, NextFunction } from 'express';
import Article, { IArticle } from '../models/Article';
import User from '../models/User'; //Для получения информации об авторе
import Comment from '../models/Comment'; //Для получения комментариев
import mongoose from 'mongoose';

//Расширяем тип Request для включения пользователя из authMiddleware
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

//@desc    Получение всех статей с пагинацией
//@route   GET /api/articles
//@access  Публичный
export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
  const pageSize = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  try {
    const count = await Article.countDocuments();
    const articles = await Article.find()
      .populate('author', 'email') //Получаем email автора
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 }); //Сортировка по убыванию даты

    res.json({
      articles,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalArticles: count,
    });
  } catch (error) {
    next(error);
  }
};

//@desc    Получение статьи по ID
//@route   GET /api/articles/:id
//@access  Публичный
export const getArticleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid article ID format' });
    }
    const article = await Article.findById(req.params.id)
      .populate('author', 'email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'email' }, //Получаем автора комментариев
        options: { sort: { createdAt: -1 } } // Sort comments by newest
      });

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    next(error);
  }
};

//@desc    Создание новой статьи
//@route   POST /api/articles
//@access  Приватный
export const createArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Please provide title and content' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no token or user' });
  }

  try {
    const article = new Article({
      title,
      content,
      author: req.user.id,
    });

    const createdArticle = await article.save();

    // Add article to user's articles array
    await User.findByIdAndUpdate(req.user.id, { $push: { articles: createdArticle._id } });

    res.status(201).json(createdArticle);
  } catch (error) {
    next(error);
  }
};

//@desc    Обновление статьи
//@route   PUT /api/articles/:id
//@access  Приватный
export const updateArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid article ID format' });
  }

  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (!req.user || article.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this article' });
    }

    article.title = title || article.title;
    article.content = content || article.content;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    next(error);
  }
};

//@desc    Удаление статьи
//@route   DELETE /api/articles/:id
//@access  Приватный
export const deleteArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid article ID format' });
    }

  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (!req.user || article.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this article' });
    }

    // Remove comments associated with the article first
    await Comment.deleteMany({ article: article._id });

    // Remove article from user's articles array
    await User.findByIdAndUpdate(article.author, { $pull: { articles: article._id } });

    await article.deleteOne(); // Mongoose v6+ uses deleteOne()

    res.json({ message: 'Article removed successfully' });
  } catch (error) {
    next(error);
  }
};