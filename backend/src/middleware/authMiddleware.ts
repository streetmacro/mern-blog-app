import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';


export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
//Проверка
      token = req.headers.authorization.split(' ')[1];

//Проверка
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Server error: JWT_SECRET not configured' });
      }
      const decoded = jwt.verify(token, secret) as JwtPayload;

//Получаем пользователя из токена
      //наличие 'id' в декодированных данных, который генерится
      if (decoded && typeof decoded.id === 'string') {
        const user = await User.findById(decoded.id).select('-password').lean().exec();
        if (!user || !user.email) {
            return res.status(401).json({ message: 'Not authorized, user not found or invalid' });
        }
        req.user = user as IUser;
        next();
      } else {
        res.status(401).json({ message: 'Not authorized, token failed (invalid payload)' });
      }

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed!!!!' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token!!!' });
  }
};