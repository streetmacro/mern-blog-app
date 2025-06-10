import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, secret, { expiresIn: '1h' });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, confirmPassword } = req.body;

  //Базовая валидация (можно использовать express-validator для более надежной валидации)
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please provide email, password, and confirm password' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id.toString());
      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id.toString());
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};