import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CoursePlayer from './pages/student/CoursePlayer';
import Certificate from './pages/student/Certificate';
import Certificates from './pages/student/Certificates';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CreateCourse from './pages/teacher/CreateCourse';
import EditCourse from './pages/teacher/EditCourse';
import AddSections from './pages/teacher/AddSections';
import StudentList from './pages/teacher/StudentList';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import EnrollmentRecords from './pages/admin/EnrollmentRecords';

// Global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container-fluid p-0">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              
              {/* Protected routes for all authenticated users */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              
              {/* Student routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/courses" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MyCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/course/:courseId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CoursePlayer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/certificate/:courseId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Certificate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/certificates" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Certificates />
                  </ProtectedRoute>
                } 
              />
              
              {/* Teacher routes */}
              <Route 
                path="/teacher/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/courses" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherCourses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/course/create" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <CreateCourse />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/course/:courseId/edit" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <EditCourse />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/course/:courseId/sections" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <AddSections />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/course/:courseId/students" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <StudentList />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/courses" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CourseManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/enrollments" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EnrollmentRecords />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 