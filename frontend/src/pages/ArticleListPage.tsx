import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Box,
  Skeleton,
  Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface ArticleAuthor {
  _id: string;
  email: string;
}

interface Article {
  _id: string;
  title: string;
  content: string;
  author: ArticleAuthor;
  createdAt: string;
  comments: string[]; 
}

interface ArticlesApiResponse {
  articles: Article[];
  currentPage: number;
  totalPages: number;
  totalArticles: number;
}

const ArticleListPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const articlesPerPage = 6; 

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ArticlesApiResponse>(
          `/articles?page=${page}&limit=${articlesPerPage}`
        );
        setArticles(response.data.articles);
        setTotalPages(response.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch articles.');
        console.error('Fetch articles error:', err);
      }
      setIsLoading(false);
    };

    fetchArticles();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const renderSkeletons = () => {
    return Array.from(new Array(articlesPerPage)).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} width="80%" />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="40%" />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 1, mb: 1 }} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="60%" />
          </CardContent>
          <CardActions>
            <Skeleton variant="rounded" width={80} height={36} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb:4 }}>
        Articles
      </Typography>
      {isLoading ? (
        <Grid container spacing={3}>
          {renderSkeletons()}
        </Grid>
      ) : articles.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 5 }}>No articles found.</Typography>
      ) : (
        <Grid container spacing={4}>
          {articles.map((article) => (
            <Grid item key={article._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{fontWeight: 'medium'}}>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    By: {article.author?.email || 'Unknown Author'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(article.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3, // Show 3 lines
                      WebkitBoxOrient: 'vertical',
                      minHeight: '60px' // Approx 3 lines height
                    }}>
                    {article.content}
                  </Typography>
                  <Chip label={`${article.comments.length} comments`} size="small" />
                </CardContent>
                <CardActions sx={{mt: 'auto'}}>
                  <Button 
                    size="small" 
                    color="primary" 
                    component={RouterLink} 
                    to={`/articles/${article._id}`}
                  >
                    Read More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {totalPages > 1 && !isLoading && articles.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default ArticleListPage;