import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  PersonAdd
} from '@mui/icons-material';
import { adminService } from '../../services';
import { handleApiError } from '../../utils/helpers';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterAlumni, setFilterAlumni] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    batch: '',
    course: '',
    department: '',
    year: 1,
    phone: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminService.getAllStudents({
        search: searchTerm,
        batch: filterBatch,
        isAlumni: filterAlumni
      });
      setStudents(response.data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await adminService.getAllBatches();
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Apply filters whenever they change
  useEffect(() => {
    if (!loading) {
      fetchStudents();
    }
  }, [searchTerm, filterBatch, filterAlumni]);

  const handleOpenDialog = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        password: '',
        studentId: student.studentId,
        batch: student.batch?._id || '',
        course: student.course,
        department: student.department,
        year: student.year,
        phone: student.phone || ''
      });
    } else {
      setSelectedStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        studentId: '',
        batch: '',
        course: '',
        department: '',
        year: 1,
        phone: ''
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (selectedStudent) {
        // Update student
        await adminService.updateStudent(selectedStudent._id, formData);
        setSuccess('Student updated successfully');
      } else {
        // Add new student
        if (!formData.password) {
          setError('Password is required for new students');
          return;
        }
        await adminService.addStudent(formData);
        setSuccess('Student added successfully');
      }
      
      handleCloseDialog();
      fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await adminService.deleteStudent(studentId);
        setSuccess('Student deleted successfully');
        fetchStudents();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(handleApiError(error));
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Student Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenDialog()}
        >
          Add Student
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Filter by Batch"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              <MenuItem value="">All Batches</MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch._id} value={batch._id}>
                  {batch.batchName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Filter by Status"
              value={filterAlumni}
              onChange={(e) => setFilterAlumni(e.target.value)}
            >
              <MenuItem value="">All Students</MenuItem>
              <MenuItem value="false">Current Students</MenuItem>
              <MenuItem value="true">Alumni</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.batch?.batchName}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>
                  <Chip 
                    label={student.isAlumni ? 'Alumni' : 'Current'}
                    color={student.isAlumni ? 'success' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(student)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(student._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {students.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No students found matching your criteria.
          </Typography>
        </Box>
      )}

      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => handleFormChange('studentId', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={selectedStudent ? 'New Password (leave empty to keep current)' : 'Password'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  margin="normal"
                  required={!selectedStudent}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Batch"
                  value={formData.batch}
                  onChange={(e) => handleFormChange('batch', e.target.value)}
                  margin="normal"
                >
                  {batches.map((batch) => (
                    <MenuItem key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course"
                  value={formData.course}
                  onChange={(e) => handleFormChange('course', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleFormChange('year', parseInt(e.target.value))}
                  margin="normal"
                  inputProps={{ min: 1, max: 5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStudent ? 'Update' : 'Add'} Student
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentManagement;