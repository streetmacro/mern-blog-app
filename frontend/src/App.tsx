import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleCreatePage from './pages/ArticleCreatePage';
import ArticleEditPage from './pages/ArticleEditPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

//Основная тема Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#dc004e', // Pink
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
//Здесь можно вернуть глобальный спиннер загрузки при необходимости
    return <div>Loading application...</div>;
  }

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public routes */}
          <Route path="/" element={<ArticleListPage />} />
          <Route path="/articles" element={<Navigate replace to="/" />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />

          {/* Protected Routes */}
          <Route 
            path="/create-article" 
            element={<ProtectedRoute element={<ArticleCreatePage />} />} 
          />
          <Route 
            path="/articles/:id/edit" 
            element={<ProtectedRoute element={<ArticleEditPage />} />} 
          />
          
          {/* Redirect to home if no route matches and user is authenticated, else to login */}
          <Route 
            path="*" 
            element={isAuthenticated ? <Navigate replace to="/" /> : <Navigate replace to="/login" />} 
          />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;