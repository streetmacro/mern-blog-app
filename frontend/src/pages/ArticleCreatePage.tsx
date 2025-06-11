import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ArticleCreatePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string }>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  const validateForm = (): boolean => {
    const errors: { title?: string; content?: string } = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!content.trim()) {
      errors.content = 'Content is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (!user) {
      setError('ERROR: user not found. Please log in.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/articles', { title, content, author: user.id });
      navigate(`/articles/${response.data._id}`); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create article.');
      console.error('Create article error:', err);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Create New Article
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={!!formErrors.title}
            helperText={formErrors.title}
            disabled={isLoading}
          />
          <TextField
            label="Content"
            multiline
            rows={10}
            fullWidth
            margin="normal"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            error={!!formErrors.content}
            helperText={formErrors.content}
            disabled={isLoading}
          />
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isLoading} 
              fullWidth
            >
              {isLoading ? 'Creating...' : 'Create Article'}
            </Button>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ArticleCreatePage;