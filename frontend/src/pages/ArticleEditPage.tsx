import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress, Paper, Skeleton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ArticleData {
  title: string;
  content: string;
  author: string; //ID автора
}

const ArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string }>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await api.get<ArticleData>(`/articles/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        //Проверка прав
        if (user?.id !== response.data.author) {
          setError('You are not authorized to edit this article.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch article data.');
        console.error('Fetch article error:', err);
      }
      setIsFetching(false);
    };

    if (id) {
      fetchArticle();
    }
  }, [id, user, navigate]);

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
    setIsLoading(true);
    setError(null);
    try {
      await api.put(`/articles/${id}`, { title, content });
      navigate(`/articles/${id}`); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update article.');
      console.error('Update article error:', err);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
            <Skeleton width="60%" />
          </Typography>
          <Skeleton variant="rectangular" height={40} sx={{ my: 2 }} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Edit Article
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
            error={Boolean(formErrors.title)}
            helperText={formErrors.title || ''}
            disabled={Boolean(isLoading || isFetching || (error && error.includes('not authorized')))}
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
            error={Boolean(formErrors.content)}
            helperText={formErrors.content || ''}
            disabled={isLoading || isFetching || Boolean(error && error.includes('not authorized'))}
          />
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={Boolean(isLoading || isFetching || (error && error.includes('not authorized')))}
              fullWidth
            >
              {isLoading ? 'Updating...' : 'Update Article'}
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

export default ArticleEditPage;