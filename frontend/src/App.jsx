import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CourseList from './pages/public/CourseList';
import CourseDetails from './pages/public/CourseDetails';
import Profile from './pages/public/Profile';
import Settings from './pages/public/Settings';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CoursePlayer from './pages/student/CoursePlayer';
import Certificate from './pages/student/Certificate';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import EditCourse from './pages/teacher/EditCourse';
import AddSections from './pages/teacher/AddSections';
import StudentList from './pages/teacher/StudentList';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import EnrollmentRecords from './pages/admin/EnrollmentRecords';

const App = () => {
  const { loading, isAuthenticated, userType } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading application..." />;
  }

  return (
    <div className="App">
      <MainNavbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        } />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetails />} />

        {/* Profile & Settings Routes */}
        <Route path="/profile" element={
          isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
        } />
        <Route path="/settings" element={
          isAuthenticated ? <Settings /> : <Navigate to="/login" replace />
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Navigate to="/student/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/mycourses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyCourses />
          </ProtectedRoute>
        } />
        <Route path="/student/course/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <CoursePlayer />
          </ProtectedRoute>
        } />
        <Route path="/student/certificate/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Certificate />
          </ProtectedRoute>
        } />

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Navigate to="/teacher/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MyCourses />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/create" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateCourse />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/:id/edit" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <EditCourse />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/:id/sections" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <AddSections />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/:id/students" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <StudentList />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CourseManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/enrollments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EnrollmentRecords />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App; 