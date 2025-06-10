import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/Auth/AuthForm';
import api from '../services/api';
import { Typography, Box, Link } from '@mui/material';

const RegisterPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/auth/register', data);
      login(response.data.token, response.data.user);
      navigate('/'); //Перенаправляем на главную после успешной регистрации
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    }
    setIsLoading(false);
  };

  return (
    <Box>
      <AuthForm 
        formType="register" 
        onSubmit={handleRegister} 
        errorMessage={errorMessage} 
        isLoading={isLoading} 
      />
      <Typography textAlign="center" sx={{ mt: 2 }}>
        Already have an account? <Link component={RouterLink} to="/login">Login here</Link>
      </Typography>
    </Box>
  );
};

export default RegisterPage;