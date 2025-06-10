import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import articleRoutes from './routes/articleRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();

const app: Application = express();

//Подключение к базе данных
connectDB();

//Промежуточное ПО
app.use(cors());
app.use(express.json());

//Маршруты
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);

//Промежуточное ПО для обработки ошибок (базовый пример)
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));