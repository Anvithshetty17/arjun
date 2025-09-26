import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Search,
  FilterList,
  Work,
  LocationOn,
  School,
  LinkedIn,
  GitHub,
  Language,
  Close,
  Email,
  Phone
} from '@mui/icons-material';
import { studentService } from '../../services';
import { handleApiError, formatSalary, getStatusColor, getStatusLabel } from '../../utils/helpers';

const AlumniDirectory = () => {
  const [alumni, setAlumni] = useState([]);
  const [batches, setBatches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Dialog
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAlumni();
  }, [searchTerm, filterBatch, filterCompany, filterCourse, sortBy, sortOrder]);

  const fetchInitialData = async () => {
    try {
      const [batchesRes, companiesRes] = await Promise.all([
        studentService.getBatches(),
        studentService.getCompanies()
      ]);
      setBatches(batchesRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        batch: filterBatch,
        company: filterCompany,
        course: filterCourse,
        sortBy,
        sortOrder
      };
      
      const response = await studentService.getAllAlumni(params);
      setAlumni(response.data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAlumniClick = async (alumniId) => {
    try {
      const response = await studentService.getAlumni(alumniId);
      setSelectedAlumni(response.data);
      setDialogOpen(true);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBatch('');
    setFilterCompany('');
    setFilterCourse('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const AlumniCard = ({ alumniData }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
      onClick={() => handleAlumniClick(alumniData._id)}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={alumniData.profilePicture}
            sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
          >
            {alumniData.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" component="div">
              {alumniData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {alumniData.batch?.batchName} • {alumniData.course}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(alumniData.currentStatus)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(alumniData.currentStatus),
              color: 'white'
            }}
          />
        </Box>

        {alumniData.jobRole && alumniData.company && (
          <Box display="flex" alignItems="center" mb={1}>
            <Work sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
            <Typography variant="body2">
              {alumniData.jobRole} at {alumniData.company}
            </Typography>
          </Box>
        )}

        {alumniData.workLocation && (
          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {alumniData.workLocation}
            </Typography>
          </Box>
        )}

        {alumniData.salary > 0 && (
          <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
            {formatSalary(alumniData.salary)}
          </Typography>
        )}

        {alumniData.skills && alumniData.skills.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {alumniData.skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: '24px' }}
                />
              ))}
              {alumniData.skills.length > 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                  +{alumniData.skills.length - 3} more
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Alumni Directory
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Connect with alumni from your college and explore career opportunities
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters & Search</Typography>
            <Button onClick={clearFilters} sx={{ ml: 'auto' }} size="small">
              Clear All
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search alumni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Batch"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Batches</MenuItem>
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.batchName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Company"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company, index) => (
                  <MenuItem key={index} value={company}>
                    {company}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Course"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Courses</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Information Technology">Information Technology</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Mechanical">Mechanical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField
                fullWidth
                select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="company">Company</MenuItem>
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="createdAt">Join Date</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField
                fullWidth
                select
                label="Order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                size="small"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {loading ? 'Loading...' : `${alumni.length} alumni found`}
      </Typography>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Alumni Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {alumni.map((alumniData) => (
            <Grid item xs={12} md={6} lg={4} key={alumniData._id}>
              <AlumniCard alumniData={alumniData} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results */}
      {!loading && alumni.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No alumni found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters
          </Typography>
        </Box>
      )}

      {/* Alumni Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Alumni Profile</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAlumni && (
            <Box>
              {/* Header */}
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={selectedAlumni.profilePicture}
                  sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
                >
                  {selectedAlumni.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5">
                    {selectedAlumni.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedAlumni.batch?.batchName} • {selectedAlumni.course}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={getStatusLabel(selectedAlumni.currentStatus)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(selectedAlumni.currentStatus),
                        color: 'white'
                      }}
                    />
                    <Chip label="Alumni" color="success" size="small" />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Professional Information */}
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedAlumni.jobRole && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <Work sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Job Role</Typography>
                        <Typography variant="body1">{selectedAlumni.jobRole}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {selectedAlumni.company && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Company</Typography>
                      <Typography variant="body1">{selectedAlumni.company}</Typography>
                    </Box>
                  </Grid>
                )}
                {selectedAlumni.workLocation && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Work Location</Typography>
                        <Typography variant="body1">{selectedAlumni.workLocation}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {selectedAlumni.salary > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Salary</Typography>
                      <Typography variant="body1" color="success.main">
                        {formatSalary(selectedAlumni.salary)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Experience */}
              {selectedAlumni.experience && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Experience</Typography>
                  <Typography variant="body2">
                    {selectedAlumni.experience}
                  </Typography>
                </Box>
              )}

              {/* Skills */}
              {selectedAlumni.skills && selectedAlumni.skills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Skills</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedAlumni.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Achievements */}
              {selectedAlumni.achievements && selectedAlumni.achievements.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Achievements</Typography>
                  <List dense>
                    {selectedAlumni.achievements.map((achievement, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={achievement.title}
                          secondary={achievement.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Social Links */}
              <Box>
                <Typography variant="h6" gutterBottom>Connect</Typography>
                <Box display="flex" gap={2}>
                  {selectedAlumni.linkedinProfile && (
                    <Button
                      startIcon={<LinkedIn />}
                      variant="outlined"
                      href={selectedAlumni.linkedinProfile}
                      target="_blank"
                      size="small"
                    >
                      LinkedIn
                    </Button>
                  )}
                  {selectedAlumni.githubProfile && (
                    <Button
                      startIcon={<GitHub />}
                      variant="outlined"
                      href={selectedAlumni.githubProfile}
                      target="_blank"
                      size="small"
                    >
                      GitHub
                    </Button>
                  )}
                  {selectedAlumni.portfolioWebsite && (
                    <Button
                      startIcon={<Language />}
                      variant="outlined"
                      href={selectedAlumni.portfolioWebsite}
                      target="_blank"
                      size="small"
                    >
                      Portfolio
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AlumniDirectory;