import React, { useState, useEffect } from 'react';
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
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  Work,
  LocationOn,
  AttachMoney,
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  LinkedIn,
  GitHub,
  Language,
  Upload,
  Description
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, uploadService } from '../../services';
import { handleApiError, validateImageFile, formatSalary, getStatusColor, getStatusLabel } from '../../utils/helpers';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Achievement dialog
  const [achievementDialog, setAchievementDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: ''
  });

  const [formData, setFormData] = useState({
    phone: '',
    jobRole: '',
    company: '',
    workLocation: '',
    salary: '',
    experience: '',
    skills: [],
    linkedinProfile: '',
    githubProfile: '',
    portfolioWebsite: '',
    currentStatus: 'studying'
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await studentService.getProfile();
      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        jobRole: response.data.jobRole || '',
        company: response.data.company || '',
        workLocation: response.data.workLocation || '',
        salary: response.data.salary || '',
        experience: response.data.experience || '',
        skills: response.data.skills || [],
        linkedinProfile: response.data.linkedinProfile || '',
        githubProfile: response.data.githubProfile || '',
        portfolioWebsite: response.data.portfolioWebsite || '',
        currentStatus: response.data.currentStatus || 'studying'
      });
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await studentService.updateProfile(formData);
      setProfile(response.data);
      updateUser(response.data);
      setSuccess('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setUploadingPhoto(true);
      const response = await uploadService.uploadProfilePicture(file);
      setProfile({ ...profile, profilePicture: response.data.profilePicture });
      updateUser({ ...user, profilePicture: response.data.profilePicture });
      setSuccess('Profile picture updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const response = await uploadService.uploadResume(file);
      setProfile({ ...profile, resume: response.data.resume });
      updateUser({ ...user, resume: response.data.resume });
      setSuccess('Resume updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleAddAchievement = async () => {
    if (!newAchievement.title || !newAchievement.description) return;

    try {
      const updatedAchievements = [
        ...(profile.achievements || []),
        { ...newAchievement, date: new Date(newAchievement.date) }
      ];
      
      const response = await studentService.updateProfile({ 
        achievements: updatedAchievements 
      });
      setProfile(response.data);
      setAchievementDialog(false);
      setNewAchievement({ title: '', description: '', date: '' });
      setSuccess('Achievement added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEditToggle = () => {
    if (editing) {
      // Reset form when canceling
      fetchProfile();
    }
    setEditing(!editing);
    setError('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" textAlign="center">Loading profile...</Typography>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Failed to load profile</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!profile.isAlumni && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Limited Access:</strong> As a current student, you can only edit basic information and upload your resume. 
            Work-related fields will be available once you become an alumni.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile.profilePicture}
                sx={{ 
                  width: 150, 
                  height: 150, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '4rem'
                }}
              >
                {profile.name?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profile.name}
              </Typography>
              
              <Box display="flex" justifyContent="center" gap={1} mb={2}>
                <Chip
                  label={profile.isAlumni ? 'Alumni' : 'Student'}
                  color={profile.isAlumni ? 'success' : 'primary'}
                />
                {profile.currentStatus && (
                  <Chip
                    label={getStatusLabel(profile.currentStatus)}
                    sx={{ 
                      backgroundColor: getStatusColor(profile.currentStatus), 
                      color: 'white' 
                    }}
                  />
                )}
              </Box>
              
              <Button
                variant="outlined"
                component="label"
                size="small"
                disabled={uploadingPhoto}
                sx={{ mb: 2 }}
              >
                {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload}
                />
              </Button>

              <Divider sx={{ my: 2 }} />

              {/* Basic Info */}
              <Box textAlign="left">
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Email sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">{profile.studentId}</Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <School sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    {profile.batch?.batchName} • {profile.course}
                  </Typography>
                </Box>
                
                {profile.phone && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Phone sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">{profile.phone}</Typography>
                  </Box>
                )}
              </Box>

              {/* Resume Section */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Resume</Typography>
              
              {profile.resume ? (
                <Box>
                  <Typography variant="body2" color="success.main" gutterBottom>
                    ✓ Resume uploaded
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      href={profile.resume}
                      target="_blank"
                      startIcon={<Description />}
                    >
                      View
                    </Button>
                    <Button
                      component="label"
                      size="small"
                      variant="outlined"
                      disabled={uploadingResume}
                    >
                      Update
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        hidden
                        onChange={handleResumeUpload}
                      />
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<Upload />}
                  disabled={uploadingResume}
                  color="warning"
                >
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleResumeUpload}
                  />
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Detailed Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  {profile.isAlumni ? 'Professional Information' : 'Profile Details'}
                </Typography>
                <Button
                  startIcon={editing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                  color={editing ? "error" : "primary"}
                  disabled={saving}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {/* Always editable fields */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editing ? formData.phone : profile.phone || 'Not provided'}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile"
                    value={editing ? formData.linkedinProfile : profile.linkedinProfile || 'Not provided'}
                    onChange={(e) => handleFormChange('linkedinProfile', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <LinkedIn sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GitHub Profile"
                    value={editing ? formData.githubProfile : profile.githubProfile || 'Not provided'}
                    onChange={(e) => handleFormChange('githubProfile', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <GitHub sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Portfolio Website"
                    value={editing ? formData.portfolioWebsite : profile.portfolioWebsite || 'Not provided'}
                    onChange={(e) => handleFormChange('portfolioWebsite', e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                {/* Alumni-only fields */}
                {profile.isAlumni && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Job Role"
                        value={editing ? formData.jobRole : profile.jobRole || 'Not specified'}
                        onChange={(e) => handleFormChange('jobRole', e.target.value)}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={editing ? formData.company : profile.company || 'Not specified'}
                        onChange={(e) => handleFormChange('company', e.target.value)}
                        disabled={!editing}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Work Location"
                        value={editing ? formData.workLocation : profile.workLocation || 'Not specified'}
                        onChange={(e) => handleFormChange('workLocation', e.target.value)}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Salary"
                        type="number"
                        value={editing ? formData.salary : (profile.salary ? formatSalary(profile.salary) : 'Not specified')}
                        onChange={(e) => handleFormChange('salary', e.target.value)}
                        disabled={!editing}
                        InputProps={{
                          startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Experience"
                        multiline
                        rows={3}
                        value={editing ? formData.experience : profile.experience || 'Not specified'}
                        onChange={(e) => handleFormChange('experience', e.target.value)}
                        disabled={!editing}
                        placeholder="Describe your work experience..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Current Status"
                        value={editing ? formData.currentStatus : profile.currentStatus}
                        onChange={(e) => handleFormChange('currentStatus', e.target.value)}
                        disabled={!editing}
                        SelectProps={{ native: true }}
                      >
                        <option value="studying">Currently Studying</option>
                        <option value="job_searching">Job Searching</option>
                        <option value="employed">Employed</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="higher_studies">Higher Studies</option>
                      </TextField>
                    </Grid>
                  </>
                )}

                {/* Skills Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Skills</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {(editing ? formData.skills : profile.skills || []).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={editing ? () => handleRemoveSkill(skill) : undefined}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {((editing ? formData.skills : profile.skills) || []).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No skills added yet
                      </Typography>
                    )}
                  </Box>
                  
                  {editing && (
                    <Box display="flex" gap={1}>
                      <TextField
                        size="small"
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
                        Add
                      </Button>
                    </Box>
                  )}
                </Grid>

                {editing && (
                  <Grid item xs={12}>
                    <Box display="flex" gap={2} mt={2}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleEditToggle}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Achievements Section (Alumni only) */}
          {profile.isAlumni && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Achievements</Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={() => setAchievementDialog(true)}
                    size="small"
                  >
                    Add Achievement
                  </Button>
                </Box>

                {profile.achievements && profile.achievements.length > 0 ? (
                  <List>
                    {profile.achievements.map((achievement, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemText
                          primary={achievement.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {achievement.description}
                              </Typography>
                              {achievement.date && (
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(achievement.date).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No achievements added yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Achievement Dialog */}
      <Dialog open={achievementDialog} onClose={() => setAchievementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Achievement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newAchievement.title}
            onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newAchievement.description}
            onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newAchievement.date}
            onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAchievementDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAchievement} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentProfile;