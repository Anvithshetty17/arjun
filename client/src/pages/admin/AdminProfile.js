import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Person, Email, Phone, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { uploadService } from '../../services';
import { handleApiError, validateImageFile } from '../../utils/helpers';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleEditToggle = () => {
    if (editing) {
      // Reset form data when canceling
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    }
    setEditing(!editing);
    setError('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would call an API to update admin profile
      // For now, we'll just update the local state
      updateUser({
        ...user,
        ...formData
      });
      setSuccess('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setLoading(true);
      const response = await uploadService.uploadProfilePicture(file);
      updateUser({
        ...user,
        profilePicture: response.data.profilePicture
      });
      setSuccess('Profile picture updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Profile
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Profile Picture Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={user?.profilePicture}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Administrator
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                disabled={loading}
              >
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Account Type:</Typography>
                <Typography variant="body2" fontWeight="bold">Administrator</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Member Since:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {new Date(user?.createdAt || Date.now()).getFullYear()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Status:</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  Active
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Profile Information
                </Typography>
                <Button
                  startIcon={editing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                  color={editing ? "error" : "primary"}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editing ? formData.name : user?.name || ''}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={editing ? formData.email : user?.email || ''}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editing ? formData.phone : user?.phone || 'Not provided'}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter phone number"
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    value="Administrator"
                    disabled
                  />
                </Grid>

                {editing && (
                  <Grid item xs={12}>
                    <Box display="flex" gap={2} mt={2}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleEditToggle}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {user?.id || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Permissions
                  </Typography>
                  <Typography variant="body1">
                    Full administrative access to all system features
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminProfile;