import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';

interface AuthFormProps {
  formType: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>; //Сделать onSubmit асинхронным
  errorMessage?: string | null;
  isLoading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit, errorMessage, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formType === 'register' && !confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formType === 'register' && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const data = formType === 'register' ? { email, password, confirmPassword } : { email, password };
      await onSubmit(data);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        {formType === 'login' ? 'Login' : 'Register'}
      </Typography>

      {errorMessage && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{errorMessage}</Alert>}

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!formErrors.email}
        helperText={formErrors.email}
        disabled={isLoading}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!formErrors.password}
        helperText={formErrors.password}
        disabled={isLoading}
      />
      {formType === 'register' && (
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          disabled={isLoading}
        />
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2, mb: 2, position: 'relative' }}
        disabled={isLoading}
      >
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              color: 'white',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
        {formType === 'login' ? 'Login' : 'Register'}
      </Button>
    </Box>
  );
};

export default AuthForm;