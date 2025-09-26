import api from './api';

// Auth services
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me')
};

// Admin services
export const adminService = {
  // Batch management
  createBatch: (batchData) => api.post('/api/admin/batches', batchData),
  getAllBatches: () => api.get('/api/admin/batches'),
  completeBatch: (batchId) => api.put(`/api/admin/batches/${batchId}/complete`),
  
  // Student management
  addStudent: (studentData) => api.post('/api/admin/students', studentData),
  getAllStudents: (params) => api.get('/api/admin/students', { params }),
  getStudent: (studentId) => api.get(`/api/admin/students/${studentId}`),
  updateStudent: (studentId, data) => api.put(`/api/admin/students/${studentId}`, data),
  deleteStudent: (studentId) => api.delete(`/api/admin/students/${studentId}`),
  
  // Company management
  addCompany: (companyData) => api.post('/api/admin/companies', companyData),
  getAllCompanies: () => api.get('/api/admin/companies'),
  shareStudentsWithCompany: (companyId, data) => api.post(`/api/admin/companies/${companyId}/share-students`, data),
  
  // Dashboard
  getDashboardStats: () => api.get('/api/admin/dashboard/stats')
};

// Student services
export const studentService = {
  getProfile: () => api.get('/api/students/profile'),
  updateProfile: (profileData) => api.put('/api/students/profile', profileData),
  getAllAlumni: (params) => api.get('/api/students/alumni', { params }),
  getAlumni: (alumniId) => api.get(`/api/students/alumni/${alumniId}`),
  getBatches: () => api.get('/api/students/batches'),
  getCompanies: () => api.get('/api/students/companies'),
  getStats: () => api.get('/api/students/stats'),
  getMyBatch: () => api.get('/api/students/my-batch'),
  
  // Networking
  getConnections: (params) => api.get('/api/students/connections', { params }),
  getConnectionSuggestions: (params) => api.get('/api/students/connection-suggestions', { params }),
  getConnectionRequests: () => api.get('/api/students/connection-requests'),
  getBatchMates: (params) => api.get('/api/students/batch-mates', { params }),
  sendConnectionRequest: (data) => api.post('/api/students/connection-request', data),
  acceptConnectionRequest: (requestId) => api.put(`/api/students/connection-request/${requestId}/accept`),
  rejectConnectionRequest: (requestId) => api.put(`/api/students/connection-request/${requestId}/reject`)
};

// File upload services
export const uploadService = {
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/api/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/api/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProfilePicture: () => api.delete('/api/upload/profile-picture'),
  deleteResume: () => api.delete('/api/upload/resume')
};