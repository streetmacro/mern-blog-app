import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/Auth/AuthForm';
import api from '../services/api';
import { Typography, Box, Link } from '@mui/material';

const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    //Перенаправляем после входа на предыдущую страницу или на главную
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (error: any) {      
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
      console.error('Login error:', error);
    }
    setIsLoading(false);
  };

  return (
    <Box>
      <AuthForm 
        formType="login" 
        onSubmit={handleLogin} 
        errorMessage={errorMessage} 
        isLoading={isLoading} 
      />
      <Typography textAlign="center" sx={{ mt: 2 }}>
        Don't have an account? <Link component={RouterLink} to="/register">Register here</Link>
      </Typography>
    </Box>
  );
};

export default LoginPage;