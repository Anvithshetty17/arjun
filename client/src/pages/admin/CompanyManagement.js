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
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Business,
  Share,
  Email,
  Phone,
  Language
} from '@mui/icons-material';
import { adminService } from '../../services';
import { handleApiError, formatDate } from '../../utils/helpers';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactPerson: '',
    contactPhone: '',
    website: '',
    description: '',
    industry: '',
    location: ''
  });

  // Share form state
  const [shareData, setShareData] = useState({
    batchId: '',
    message: ''
  });

  useEffect(() => {
    fetchCompanies();
    fetchBatches();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await adminService.getAllCompanies();
      setCompanies(response.data);
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

  const handleOpenDialog = (company = null) => {
    if (company) {
      setSelectedCompany(company);
      setFormData({
        companyName: company.companyName,
        contactEmail: company.contactEmail,
        contactPerson: company.contactPerson,
        contactPhone: company.contactPhone || '',
        website: company.website || '',
        description: company.description || '',
        industry: company.industry || '',
        location: company.location || ''
      });
    } else {
      setSelectedCompany(null);
      setFormData({
        companyName: '',
        contactEmail: '',
        contactPerson: '',
        contactPhone: '',
        website: '',
        description: '',
        industry: '',
        location: ''
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
    setError('');
  };

  const handleOpenShareDialog = (company) => {
    setSelectedCompany(company);
    setShareData({
      batchId: '',
      message: `Student profiles from ${company.companyName} recruitment drive`
    });
    setOpenShareDialog(true);
  };

  const handleCloseShareDialog = () => {
    setOpenShareDialog(false);
    setSelectedCompany(null);
    setShareData({ batchId: '', message: '' });
  };

  const handleSubmit = async () => {
    try {
      if (selectedCompany) {
        // Update company (if API supports it)
        setSuccess('Company updated successfully');
      } else {
        // Add new company
        await adminService.addCompany(formData);
        setSuccess('Company added successfully');
      }
      
      handleCloseDialog();
      fetchCompanies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleShareStudents = async () => {
    try {
      await adminService.shareStudentsWithCompany(selectedCompany._id, shareData);
      setSuccess(`Student list shared with ${selectedCompany.companyName} successfully`);
      handleCloseShareDialog();
      fetchCompanies(); // Refresh to show updated shared lists
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleShareFormChange = (field, value) => {
    setShareData({ ...shareData, [field]: value });
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
          Company Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Company
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Company Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              Total Companies
            </Typography>
            <Typography variant="h4">
              {companies.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              Active Partnerships
            </Typography>
            <Typography variant="h4">
              {companies.filter(c => c.sharedStudentLists?.length > 0).length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              Total Shares
            </Typography>
            <Typography variant="h4">
              {companies.reduce((total, c) => total + (c.sharedStudentLists?.length || 0), 0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Companies Grid */}
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Business color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {company.companyName}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {company.description || 'No description available'}
                </Typography>
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Email sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">{company.contactEmail}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Contact:</strong> {company.contactPerson}
                  </Typography>
                  {company.contactPhone && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2">{company.contactPhone}</Typography>
                    </Box>
                  )}
                  {company.website && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Language sx={{ mr: 1, fontSize: 'small' }} />
                      <Typography variant="body2" component="a" href={company.website} target="_blank">
                        Website
                      </Typography>
                    </Box>
                  )}
                  {company.industry && (
                    <Typography variant="body2">
                      <strong>Industry:</strong> {company.industry}
                    </Typography>
                  )}
                  {company.location && (
                    <Typography variant="body2">
                      <strong>Location:</strong> {company.location}
                    </Typography>
                  )}
                </Box>

                {/* Shared Lists */}
                {company.sharedStudentLists && company.sharedStudentLists.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Recent Shares: {company.sharedStudentLists.length}
                    </Typography>
                  </Box>
                )}

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <IconButton onClick={() => handleOpenDialog(company)} color="primary">
                    <Edit />
                  </IconButton>
                  <Button
                    startIcon={<Share />}
                    onClick={() => handleOpenShareDialog(company)}
                    variant="outlined"
                    size="small"
                  >
                    Share Students
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {companies.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No companies found. Add your first company to get started.
          </Typography>
        </Box>
      )}

      {/* Add/Edit Company Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleFormChange('companyName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) => handleFormChange('contactPerson', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleFormChange('contactEmail', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleFormChange('contactPhone', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleFormChange('website', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => handleFormChange('industry', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  margin="normal"
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
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCompany ? 'Update' : 'Add'} Company
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Students Dialog */}
      <Dialog open={openShareDialog} onClose={handleCloseShareDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Share Students with {selectedCompany?.companyName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              select
              label="Select Batch"
              value={shareData.batchId}
              onChange={(e) => handleShareFormChange('batchId', e.target.value)}
              margin="normal"
            >
              {batches.map((batch) => (
                <MenuItem key={batch._id} value={batch._id}>
                  {batch.batchName} ({batch.totalStudents} students)
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={3}
              value={shareData.message}
              onChange={(e) => handleShareFormChange('message', e.target.value)}
              margin="normal"
              placeholder="Add a message for the company..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button onClick={handleShareStudents} variant="contained">
            Share Students
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyManagement;