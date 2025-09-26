import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  School,
  People,
  Business,
  Person,
  Upload,
  Visibility,
  WorkOutline,
  LocationOn,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, uploadService } from '../../services';
import { handleApiError, formatSalary, getStatusColor, getStatusLabel } from '../../utils/helpers';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAlumni, setRecentAlumni] = useState([]);
  const [batchMates, setBatchMates] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, alumniRes, batchMatesRes] = await Promise.all([
        studentService.getStats(),
        studentService.getAllAlumni({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        studentService.getMyBatch()
      ]);
      
      setStats(statsRes.data);
      setRecentAlumni(alumniRes.data.slice(0, 5));
      setBatchMates(batchMatesRes.data.slice(0, 5));
      setTopCompanies(statsRes.data.topCompanies || []);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      await uploadService.uploadResume(file);
      // Refresh user data or show success message
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setUploadingResume(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'primary.main', action }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        {action && (
          <Box sx={{ mt: 2 }}>
            {action}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.isAlumni ? 'Alumni' : 'Student'} • {user?.batch?.batchName} • {user?.course}
          </Typography>
        </Box>
        <Avatar
          src={user?.profilePicture}
          sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<People fontSize="large" />}
            title="Batch Mates"
            value={stats?.batchMates || 0}
            subtitle={`${stats?.batchAlumni || 0} are alumni`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<School fontSize="large" />}
            title="Total Alumni"
            value={stats?.totalAlumni || 0}
            subtitle="In the network"
            color="success.main"
            action={
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => navigate('/dashboard/alumni')}
              >
                Browse Alumni
              </Button>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Upload fontSize="large" />}
            title="Resume"
            value={user?.resume ? "Uploaded" : "Missing"}
            subtitle={user?.resume ? "Last updated recently" : "Upload your resume"}
            color={user?.resume ? "success.main" : "warning.main"}
            action={
              <Button
                component="label"
                size="small"
                variant={user?.resume ? "outlined" : "contained"}
                disabled={uploadingResume}
              >
                {uploadingResume ? 'Uploading...' : (user?.resume ? 'Update' : 'Upload')}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleResumeUpload}
                />
              </Button>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Person fontSize="large" />}
            title="Profile"
            value={user?.isAlumni ? "Alumni" : "Student"}
            subtitle={user?.isAlumni ? "Edit your work details" : "Limited editing"}
            color={user?.isAlumni ? "primary.main" : "text.secondary"}
            action={
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => navigate('/dashboard/profile')}
              >
                View Profile
              </Button>
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Alumni Status Card */}
          {!user?.isAlumni && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Student Status:</strong> You will be able to edit your professional details once your batch is marked as completed by the admin.
              </Typography>
            </Alert>
          )}

          {user?.isAlumni && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  🎓 Congratulations! You're now an Alumni
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You can now update your professional information, job details, and help current students by sharing your experience.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/dashboard/profile')}
                  sx={{ mr: 1 }}
                >
                  Update Work Details
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/dashboard/alumni')}
                >
                  Connect with Alumni
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Alumni */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Alumni Updates
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/dashboard/alumni')}
              >
                View All
              </Button>
            </Box>
            {recentAlumni.length > 0 ? (
              <List>
                {recentAlumni.map((alumni, index) => (
                  <React.Fragment key={alumni._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={alumni.profilePicture} sx={{ bgcolor: 'primary.main' }}>
                          {alumni.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {alumni.name}
                            </Typography>
                            <Chip
                              label={getStatusLabel(alumni.currentStatus)}
                              size="small"
                              sx={{ backgroundColor: getStatusColor(alumni.currentStatus), color: 'white' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {alumni.jobRole && alumni.company ? (
                                <>
                                  <WorkOutline sx={{ fontSize: 'small', mr: 0.5 }} />
                                  {alumni.jobRole} at {alumni.company}
                                </>
                              ) : (
                                `${alumni.batch?.batchName} • ${alumni.course}`
                              )}
                            </Typography>
                            {alumni.workLocation && (
                              <Typography variant="body2" color="text.secondary">
                                <LocationOn sx={{ fontSize: 'small', mr: 0.5 }} />
                                {alumni.workLocation}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentAlumni.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No recent alumni updates</Typography>
            )}
          </Paper>

          {/* Batch Mates */}
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Your Batch Mates
              </Typography>
              <Chip 
                label={user?.batch?.batchName} 
                color="primary" 
                variant="outlined"
              />
            </Box>
            {batchMates.length > 0 ? (
              <List>
                {batchMates.map((mate, index) => (
                  <React.Fragment key={mate._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={mate.profilePicture} sx={{ bgcolor: 'secondary.main' }}>
                          {mate.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {mate.name}
                            </Typography>
                            <Chip
                              label={mate.isAlumni ? 'Alumni' : 'Student'}
                              size="small"
                              color={mate.isAlumni ? 'success' : 'primary'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {mate.isAlumni && mate.jobRole && mate.company ? (
                                <>
                                  <WorkOutline sx={{ fontSize: 'small', mr: 0.5 }} />
                                  {mate.jobRole} at {mate.company}
                                </>
                              ) : (
                                `Year ${mate.year} • ${mate.course}`
                              )}
                            </Typography>
                            {mate.skills && mate.skills.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                {mate.skills.slice(0, 3).map((skill, idx) => (
                                  <Chip
                                    key={idx}
                                    label={skill}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, fontSize: '0.7rem', height: '20px' }}
                                  />
                                ))}
                                {mate.skills.length > 3 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{mate.skills.length - 3} more
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < batchMates.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No batch mates found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  startIcon={<Visibility />}
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/dashboard/profile')}
                >
                  View My Profile
                </Button>
                <Button
                  startIcon={<People />}
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/dashboard/alumni')}
                >
                  Browse Alumni
                </Button>
                <Button
                  component="label"
                  startIcon={<Upload />}
                  variant="outlined"
                  fullWidth
                  disabled={uploadingResume}
                >
                  {user?.resume ? 'Update Resume' : 'Upload Resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleResumeUpload}
                  />
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Top Companies */}
          {topCompanies.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Top Alumni Companies
                </Typography>
                <List dense>
                  {topCompanies.map((company, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {company.company}
                            </Typography>
                            <Chip 
                              label={`${company.count} alumni`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;