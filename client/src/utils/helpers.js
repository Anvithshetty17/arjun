// Format date utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateStudentId = (studentId) => {
  return studentId && studentId.trim().length > 0;
};

// File utilities
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload only image files (JPEG, PNG, GIF)' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
};

export const validateResumeFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload only PDF or DOC files' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Resume size must be less than 10MB' };
  }
  
  return { valid: true };
};

// Format utilities
export const formatSalary = (salary) => {
  if (!salary || salary === 0) return 'Not specified';
  return `₹${salary.toLocaleString('en-IN')}`;
};

export const formatCompanyName = (company) => {
  if (!company) return 'Not specified';
  return company.charAt(0).toUpperCase() + company.slice(1);
};

// Search and filter utilities
export const filterData = (data, searchTerm, searchFields) => {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item => 
    searchFields.some(field => {
      const value = getNestedValue(item, field);
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

export const sortData = (data, sortBy, sortOrder = 'asc') => {
  if (!sortBy) return data;
  
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, sortBy);
    const bVal = getNestedValue(b, sortBy);
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    else if (aVal < bVal) comparison = -1;
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Status utilities
export const getStatusColor = (status) => {
  const colors = {
    'studying': '#2196f3',
    'job_searching': '#ff9800',
    'employed': '#4caf50',
    'entrepreneur': '#9c27b0',
    'higher_studies': '#673ab7'
  };
  return colors[status] || '#757575';
};

export const getStatusLabel = (status) => {
  const labels = {
    'studying': 'Currently Studying',
    'job_searching': 'Job Searching',
    'employed': 'Employed',
    'entrepreneur': 'Entrepreneur',
    'higher_studies': 'Higher Studies'
  };
  return labels[status] || status;
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.msg).join(', ');
  }
  return error.message || 'Something went wrong';
};

// Local storage utilities
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

export const setToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
  }
};