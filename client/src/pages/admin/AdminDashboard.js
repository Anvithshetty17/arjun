import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  School,
  People,
  Business,
  TrendingUp,
  PersonAdd,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes, batchesRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllStudents({ limit: 5 }),
        adminService.getAllBatches()
      ]);
      
      setStats(statsRes.data);
      setRecentStudents(studentsRes.data);
      setRecentBatches(batchesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const StatCard = ({ icon, title, value, color = 'primary.main' }) => (
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
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Button
            startIcon={<PersonAdd />}
            variant="outlined"
            fullWidth
            onClick={() => navigate('/admin/students')}
          >
            Add New Student
          </Button>
          <Button
            startIcon={<Add />}
            variant="outlined"
            fullWidth
            onClick={() => navigate('/admin/batches')}
          >
            Create New Batch
          </Button>
          <Button
            startIcon={<Business />}
            variant="outlined"
            fullWidth
            onClick={() => navigate('/admin/companies')}
          >
            Manage Companies
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<People fontSize="large" />}
            title="Total Students"
            value={stats?.totalStudents || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp fontSize="large" />}
            title="Current Students"
            value={stats?.currentStudents || 0}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<School fontSize="large" />}
            title="Alumni"
            value={stats?.totalAlumni || 0}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Business fontSize="large" />}
            title="Active Batches"
            value={stats?.activeBatches || 0}
            color="error.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Recent Students" />
              <Tab label="Recent Batches" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recently Added Students
                </Typography>
                {recentStudents.length > 0 ? (
                  <List>
                    {recentStudents.map((student, index) => (
                      <React.Fragment key={student._id}>
                        <ListItem>
                          <ListItemText
                            primary={student.name}
                            secondary={`${student.studentId} • ${student.batch?.batchName} • ${student.course}`}
                          />
                        </ListItem>
                        {index < recentStudents.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">No recent students</Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/admin/students')}>
                    View All Students
                  </Button>
                </Box>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Batches
                </Typography>
                {recentBatches.length > 0 ? (
                  <List>
                    {recentBatches.map((batch, index) => (
                      <React.Fragment key={batch._id}>
                        <ListItem>
                          <ListItemText
                            primary={batch.batchName}
                            secondary={`${batch.course} • ${batch.department} • ${batch.year} • ${batch.totalStudents} students`}
                          />
                        </ListItem>
                        {index < recentBatches.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">No recent batches</Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/admin/batches')}>
                    View All Batches
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <QuickActions />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;