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
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  School,
  CheckCircle,
  Group
} from '@mui/icons-material';
import { adminService } from '../../services';
import { handleApiError, formatDate } from '../../utils/helpers';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    batchName: '',
    year: new Date().getFullYear(),
    course: '',
    department: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await adminService.getAllBatches();
      setBatches(response.data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (batch = null) => {
    if (batch) {
      setSelectedBatch(batch);
      setFormData({
        batchName: batch.batchName,
        year: batch.year,
        course: batch.course,
        department: batch.department,
        startDate: batch.startDate.split('T')[0],
        endDate: batch.endDate.split('T')[0],
        description: batch.description || ''
      });
    } else {
      setSelectedBatch(null);
      setFormData({
        batchName: '',
        year: new Date().getFullYear(),
        course: '',
        department: '',
        startDate: '',
        endDate: '',
        description: ''
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (selectedBatch) {
        // Update batch (if needed)
        setSuccess('Batch updated successfully');
      } else {
        // Add new batch
        await adminService.createBatch(formData);
        setSuccess('Batch created successfully');
      }
      
      handleCloseDialog();
      fetchBatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleCompleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to mark this batch as completed? This will convert all students to alumni status.')) {
      try {
        await adminService.completeBatch(batchId);
        setSuccess('Batch completed successfully! All students have been converted to alumni.');
        fetchBatches();
        setTimeout(() => setSuccess(''), 5000);
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
          Batch Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Batch
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Batch Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              Total Batches
            </Typography>
            <Typography variant="h4">
              {batches.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              Active Batches
            </Typography>
            <Typography variant="h4">
              {batches.filter(b => !b.isCompleted).length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              Completed Batches
            </Typography>
            <Typography variant="h4">
              {batches.filter(b => b.isCompleted).length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Batches Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Batch Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch._id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <School sx={{ mr: 1, color: 'primary.main' }} />
                    {batch.batchName}
                  </Box>
                </TableCell>
                <TableCell>{batch.course}</TableCell>
                <TableCell>{batch.department}</TableCell>
                <TableCell>{batch.year}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Group sx={{ mr: 1, fontSize: 'small' }} />
                    {batch.totalStudents}
                  </Box>
                </TableCell>
                <TableCell>
                  {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={batch.isCompleted ? 'Completed' : 'Active'}
                    color={batch.isCompleted ? 'success' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(batch)} color="primary">
                    <Edit />
                  </IconButton>
                  {!batch.isCompleted && (
                    <IconButton 
                      onClick={() => handleCompleteBatch(batch._id)} 
                      color="success"
                      title="Mark as Completed"
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {batches.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No batches found. Create your first batch to get started.
          </Typography>
        </Box>
      )}

      {/* Add/Edit Batch Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBatch ? 'Edit Batch' : 'Create New Batch'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch Name"
                  value={formData.batchName}
                  onChange={(e) => handleFormChange('batchName', e.target.value)}
                  margin="normal"
                  placeholder="e.g., CS-2024"
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course"
                  value={formData.course}
                  onChange={(e) => handleFormChange('course', e.target.value)}
                  margin="normal"
                  placeholder="e.g., Computer Science"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  margin="normal"
                  placeholder="e.g., Engineering"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  margin="normal"
                  placeholder="Brief description of the batch..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBatch ? 'Update' : 'Create'} Batch
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BatchManagement;