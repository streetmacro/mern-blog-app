import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true); //Начинаем с состояния загрузки

  const checkAuth = async () => {
    setIsLoading(true);
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      try {
        //Можно создать отдельный эндпоинт, например /auth/me, для проверки токена и получения данных пользователя
        //Сейчас предполагаем, что если токен существует и не истек (обрабатывается API), то пользователь валиден
        //Или можно декодировать токен для получения информации о пользователе, если он самодостаточен и не содержит чувствительных данных
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setToken(currentToken);
        } else {
          //Если пользователя нет в локальном хранилище, но токен существует, попробуем загрузить данные пользователя
          //Эта часть зависит от настройки вашего бэкенда, например, эндпоинта /api/users/me
          //Для простоты выйдем из системы, если данные пользователя отсутствуют при наличии токена.
          console.warn('Token found but no user data in local storage. Logging out.');
          logout(); // Or try to fetch user data from backend
        }
      } catch (error) {
        console.error('Auth check failed, logging out:', error);
        logout();
      }
    } else {
      // No token, ensure user is null and auth header is clear
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsLoading(false); // Ensure loading is false after logout
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        isAuthenticated: !!token && !!user, 
        isLoading, 
        login, 
        logout,
        checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};