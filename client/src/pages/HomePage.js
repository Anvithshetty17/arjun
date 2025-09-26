import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { School, People, Business, TrendingUp } from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <School fontSize="large" color="primary" />,
      title: 'Student Management',
      description: 'Admins can add students, manage batches, and promote batches to alumni status.'
    },
    {
      icon: <People fontSize="large" color="primary" />,
      title: 'Alumni Network',
      description: 'Students can browse alumni profiles, filter by batch, company, and connect with alumni.'
    },
    {
      icon: <Business fontSize="large" color="primary" />,
      title: 'Company Integration',
      description: 'Share student profiles with companies for recruitment and placement opportunities.'
    },
    {
      icon: <TrendingUp fontSize="large" color="primary" />,
      title: 'Profile Management',
      description: 'Alumni can update their work details, while students can manage their resumes.'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        {/* Hero Section */}
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Campus Connect
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Connecting Students, Alumni, and Opportunities
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          A comprehensive platform for managing student lifecycle from enrollment to alumni status. 
          Enable seamless networking, profile management, and recruitment opportunities.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleGetStarted}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', p: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ready to Connect?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Join Campus Connect and start building meaningful connections within your academic community.
        </Typography>
        {!isAuthenticated && (
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Login Now
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;