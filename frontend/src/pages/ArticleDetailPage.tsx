import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Skeleton,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CommentAuthor {
  _id: string;
  email: string;
}

interface Comment {
  _id: string;
  text: string;
  author: CommentAuthor;
  createdAt: string;
  isEditing?: boolean;
  editText?: string;
}

interface ArticleAuthor {
  _id: string;
  email: string;
}

interface Article {
  _id: string;
  title: string;
  content: string;
  author: ArticleAuthor;
  comments: Comment[];
  createdAt: string;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchArticle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Article>(`/articles/${id}`);
      setArticle(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch article.');
      console.error('Fetch article error:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    setIsSubmittingComment(true);
    setCommentError(null);
    try {
      const response = await api.post<Comment>('/comments', {
        text: newComment,
        articleId: id,
      });
      setArticle((prevArticle) =>
        prevArticle
          ? { ...prevArticle, comments: [response.data, ...prevArticle.comments] }
          : null
      );
      setNewComment('');
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
      console.error('Submit comment error:', err);
    }
    setIsSubmittingComment(false);
  };

  const handleDeleteArticle = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/articles/${id}`);
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete article.');
      }
    }
  };

  const toggleEditComment = (commentId: string) => {
    setArticle(prev => prev ? {
        ...prev,
        comments: prev.comments.map(c => 
            c._id === commentId ? { ...c, isEditing: !c.isEditing, editText: c.text } : c
        )
    } : null);
  };

  const handleCommentEditChange = (commentId: string, text: string) => {
    setArticle(prev => prev ? {
        ...prev,
        comments: prev.comments.map(c => 
            c._id === commentId ? { ...c, editText: text } : c
        )
    } : null);
  };

  const handleUpdateComment = async (commentId: string) => {
    const commentToUpdate = article?.comments.find(c => c._id === commentId);
    if (!commentToUpdate || !commentToUpdate.editText?.trim()) {
        setCommentError('Comment text cannot be empty for update.');
        return;
    }
    setIsSubmittingComment(true); 
    try {
        const response = await api.put<Comment>(`/comments/${commentId}`, { text: commentToUpdate.editText });
        setArticle(prev => prev ? {
            ...prev,
            comments: prev.comments.map(c => 
                c._id === commentId ? { ...response.data, isEditing: false } : c
            )
        } : null);
    } catch (err: any) {
        setCommentError(err.response?.data?.message || 'Failed to update comment.');
    }
    setIsSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
        setIsSubmittingComment(true); 
        try {
            await api.delete(`/comments/${commentId}`);
            setArticle(prev => prev ? {
                ...prev,
                comments: prev.comments.filter(c => c._id !== commentId)
            } : null);
        } catch (err: any) {
            setCommentError(err.response?.data?.message || 'Failed to delete comment.');
        }
        setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '2.5rem', mb:1 }} width="70%" />
          <Skeleton variant="text" sx={{ fontSize: '1rem', mb:2 }} width="30%" />
          <Skeleton variant="rectangular" height={200} sx={{ mb:3 }}/>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom><Skeleton width="40%" /></Typography>
          <Skeleton variant="rectangular" height={100} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!article) {
    return <Typography sx={{ textAlign: 'center', mt: 5 }}>Article not found.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {article.title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
            By: {article.author?.email || 'Unknown Author'} on {new Date(article.createdAt).toLocaleDateString()}
            </Typography>
            {user && user.id === article.author?._id && (
            <Box>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    component={RouterLink} 
                    to={`/articles/${article._id}/edit`} 
                    sx={{ mr: 1 }}
                    startIcon={<EditIcon />}
                >
                    Edit
                </Button>
                <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleDeleteArticle}
                    startIcon={<DeleteIcon />}
                >
                    Delete
                </Button>
            </Box>
            )}
        </Box>
        
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '1.1rem', my:3 }}>
          {article.content}
        </Typography>

        <Divider sx={{ my: 4 }} />

        {/* Comments Section */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Comments ({article.comments.length})
        </Typography>

        {isAuthenticated ? (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
            <TextField
              label="Write a comment..."
              multiline
              fullWidth
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              margin="normal"
              variant="outlined"
              disabled={isSubmittingComment}
            />
            {commentError && <Alert severity="error" sx={{ mb: 1 }}>{commentError}</Alert>}
            <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={isSubmittingComment}
                sx={{mt:1}}
            >
              {isSubmittingComment ? <CircularProgress size={24} color="inherit" /> : 'Post Comment'}
            </Button>
          </Box>
        ) : (
          <Typography sx={{mb:3}}> 
            <RouterLink to="/login" state={{ from: `/articles/${id}` }}>Log in</RouterLink> to post a comment.
          </Typography>
        )}
        
        {/* CommentList */}
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {article.comments.length === 0 && !isLoading ? (
            <Typography>No comments yet.</Typography>
          ) : (
            article.comments.map((comment) => (
              <React.Fragment key={comment._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{comment.author?.email?.[0].toUpperCase() || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                    primary={comment.author?.email || 'Anonymous'}
                    secondary={
                      <React.Fragment>
                        {comment.isEditing ? (
                          <Box component="div" sx={{width: '100%'}}>
                            <TextField 
                              fullWidth 
                              multiline 
                              variant="standard" 
                              value={comment.editText} 
                              onChange={(e) => handleCommentEditChange(comment._id, e.target.value)}
                              sx={{mb:1}}
                            />
                            <Button size="small" onClick={() => handleUpdateComment(comment._id)} disabled={isSubmittingComment}>Save</Button>
                            <Button size="small" onClick={() => toggleEditComment(comment._id)} disabled={isSubmittingComment}>Cancel</Button>
                          </Box>
                        ) : (
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {comment.text}
                          </Typography>
                        )}
                        <Typography component="span" variant="caption" color="text.secondary" display="block" sx={{mt: 0.5}}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {user && user.id === comment.author?._id && !comment.isEditing && (
                    <Box sx={{ml: 'auto'}}>
                        <IconButton size="small" onClick={() => toggleEditComment(comment._id)} disabled={isSubmittingComment}>
                            <EditIcon fontSize="small"/>
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteComment(comment._id)} disabled={isSubmittingComment}>
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                  )}
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default ArticleDetailPage;