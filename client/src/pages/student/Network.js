import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Message,
  Close,
  People,
  School,
  Work,
  Notifications,
  Check,
  Cancel
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { studentService } from '../../services';
import { handleApiError, getStatusColor, getStatusLabel } from '../../utils/helpers';

const Network = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [batchMates, setBatchMates] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dialog states
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  useEffect(() => {
    fetchNetworkData();
  }, []);

  useEffect(() => {
    fetchFilteredData();
  }, [activeTab, searchTerm, filterCourse, filterBatch, filterStatus]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const [connectionsRes, suggestionsRes, requestsRes, batchMatesRes] = await Promise.all([
        studentService.getConnections(),
        studentService.getConnectionSuggestions(),
        studentService.getConnectionRequests(),
        studentService.getBatchMates()
      ]);
      
      setConnections(connectionsRes.data);
      setSuggestions(suggestionsRes.data);
      setConnectionRequests(requestsRes.data);
      setBatchMates(batchMatesRes.data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    if (!searchTerm && !filterCourse && !filterBatch && !filterStatus) return;
    
    try {
      const params = {
        search: searchTerm,
        course: filterCourse,
        batch: filterBatch,
        status: filterStatus
      };
      
      let response;
      switch (activeTab) {
        case 0:
          response = await studentService.getConnections(params);
          setConnections(response.data);
          break;
        case 1:
          response = await studentService.getConnectionSuggestions(params);
          setSuggestions(response.data);
          break;
        case 2:
          response = await studentService.getBatchMates(params);
          setBatchMates(response.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error filtering data:', error);
    }
  };

  const handleSendConnectionRequest = async (userId, message = '') => {
    try {
      await studentService.sendConnectionRequest({
        recipientId: userId,
        message: message || `Hi, I'd like to connect with you!`
      });
      
      // Update suggestions list
      setSuggestions(prev => prev.filter(user => user._id !== userId));
      setBatchMates(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'pending' }
            : user
        )
      );
      
      setConnectDialogOpen(false);
      setConnectionMessage('');
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleAcceptRequest = async (requestId, senderId) => {
    try {
      await studentService.acceptConnectionRequest(requestId);
      
      // Update requests and connections
      setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
      fetchNetworkData(); // Refresh to update connections
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await studentService.rejectConnectionRequest(requestId);
      setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const openConnectDialog = (userData) => {
    setSelectedUser(userData);
    setConnectionMessage(`Hi ${userData.name}, I'd like to connect with you!`);
    setConnectDialogOpen(true);
  };

  const UserCard = ({ userData, showConnectButton = false, showConnectionStatus = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={userData.profilePicture}
            sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}
          >
            {userData.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" component="div" noWrap>
              {userData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {userData.course} • {userData.batch?.batchName}
            </Typography>
          </Box>
          {showConnectionStatus && (
            <Chip
              label={getStatusLabel(userData.currentStatus)}
              size="small"
              sx={{
                backgroundColor: getStatusColor(userData.currentStatus),
                color: 'white'
              }}
            />
          )}
        </Box>

        {userData.jobRole && userData.company && (
          <Box display="flex" alignItems="center" mb={1}>
            <Work sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
            <Typography variant="body2" noWrap>
              {userData.jobRole} at {userData.company}
            </Typography>
          </Box>
        )}

        {userData.skills && userData.skills.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {userData.skills.slice(0, 2).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              ))}
              {userData.skills.length > 2 && (
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                  +{userData.skills.length - 2}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {showConnectButton && (
          <Box mt={2} display="flex" gap={1}>
            {userData.connectionStatus === 'connected' ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Message />}
                size="small"
              >
                Message
              </Button>
            ) : userData.connectionStatus === 'pending' ? (
              <Button
                fullWidth
                variant="outlined"
                disabled
                size="small"
              >
                Request Sent
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => openConnectDialog(userData)}
                size="small"
              >
                Connect
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const ConnectionRequestCard = ({ request }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar
            src={request.sender.profilePicture}
            sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}
          >
            {request.sender.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">
              {request.sender.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {request.sender.course} • {request.sender.batch?.batchName}
            </Typography>
            {request.message && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{request.message}"
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {new Date(request.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              color="success"
              onClick={() => handleAcceptRequest(request._id, request.sender._id)}
            >
              <Check />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleRejectRequest(request._id)}
            >
              <Cancel />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Network
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Build your professional network with fellow students and alumni
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 1 }} />
                My Connections ({connections.length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <PersonAdd sx={{ mr: 1 }} />
                Suggestions ({suggestions.length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <School sx={{ mr: 1 }} />
                Batch Mates ({batchMates.length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <Badge badgeContent={connectionRequests.length} color="error">
                  <Notifications sx={{ mr: 1 }} />
                </Badge>
                Requests
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Filters */}
      {activeTab < 3 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by name..."
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
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="alumni">Alumni</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCourse('');
                    setFilterBatch('');
                    setFilterStatus('');
                  }}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* My Connections */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {connections.map((connection) => (
                <Grid item xs={12} md={6} lg={4} key={connection._id}>
                  <UserCard userData={connection} showConnectionStatus />
                </Grid>
              ))}
              {connections.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No connections yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start connecting with suggestions and batch mates
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Connection Suggestions */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {suggestions.map((suggestion) => (
                <Grid item xs={12} md={6} lg={4} key={suggestion._id}>
                  <UserCard 
                    userData={suggestion} 
                    showConnectButton 
                    showConnectionStatus 
                  />
                </Grid>
              ))}
              {suggestions.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No suggestions available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check back later for new connection suggestions
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Batch Mates */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {batchMates.map((batchMate) => (
                <Grid item xs={12} md={6} lg={4} key={batchMate._id}>
                  <UserCard 
                    userData={batchMate} 
                    showConnectButton 
                    showConnectionStatus 
                  />
                </Grid>
              ))}
              {batchMates.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No batch mates found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your batch mates will appear here once they join the platform
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Connection Requests */}
          {activeTab === 3 && (
            <Box>
              {connectionRequests.map((request) => (
                <ConnectionRequestCard key={request._id} request={request} />
              ))}
              {connectionRequests.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No connection requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New connection requests will appear here
                  </Typography>
                </Box>
                )}
            </Box>
          )}
        </>
      )}

      {/* Connect Dialog */}
      <Dialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Send Connection Request</Typography>
            <IconButton onClick={() => setConnectDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={selectedUser.profilePicture}
                  sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}
                >
                  {selectedUser.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.course} • {selectedUser.batch?.batchName}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Message (optional)"
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Add a personal message..."
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSendConnectionRequest(selectedUser._id, connectionMessage)}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Network;