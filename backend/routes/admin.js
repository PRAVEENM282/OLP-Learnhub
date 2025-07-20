const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAdminCourses,
  deleteAdminCourse,
  getDashboardStats,
  getEnrollmentRecords
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect, authorizeAdmin);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course management routes
router.get('/courses', getAdminCourses);
router.delete('/courses/:id', deleteAdminCourse);

// Enrollment management routes
router.get('/enrollments', getEnrollmentRecords);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

module.exports = router; 