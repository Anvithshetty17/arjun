import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import AlumniDirectory from './pages/student/AlumniDirectory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import StudentManagement from './pages/admin/StudentManagement';
import BatchManagement from './pages/admin/BatchManagement';
import CompanyManagement from './pages/admin/CompanyManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Student Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute studentOnly>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/profile" 
        element={
          <ProtectedRoute studentOnly>
            <StudentProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/alumni" 
        element={
          <ProtectedRoute studentOnly>
            <AlumniDirectory />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/profile" 
        element={
          <ProtectedRoute adminOnly>
            <AdminProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/students" 
        element={
          <ProtectedRoute adminOnly>
            <StudentManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/batches" 
        element={
          <ProtectedRoute adminOnly>
            <BatchManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/companies" 
        element={
          <ProtectedRoute adminOnly>
            <CompanyManagement />
          </ProtectedRoute>
        } 
      />

      {/* Default redirect based on role */}
      <Route 
        path="*" 
        element={
          user?.role === 'admin' ? 
            <Navigate to="/admin" replace /> : 
            user?.role === 'student' ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <div className="App">
              <Navbar />
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
