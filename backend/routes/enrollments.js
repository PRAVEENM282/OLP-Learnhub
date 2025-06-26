const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyCourses,
  getCourseProgress,
  completeSection,
  getCertificate,
  unenrollFromCourse
} = require('../controllers/enrollmentController');
const { protect, authorizeStudent, authorizeTeacherOrAdmin } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Enrollment routes (students only)
router.post('/:courseId', authorizeStudent, enrollInCourse);
router.delete('/:courseId', authorizeStudent, unenrollFromCourse);

// Course progress routes (students only)
router.get('/progress/:courseId', authorizeStudent, getCourseProgress);
router.post('/progress/:courseId/section/:sectionId/complete', authorizeStudent, completeSection);

// Certificate routes (students only)
router.get('/certificate/:courseId', authorizeStudent, getCertificate);

// My courses route (accessible by both students and teachers)
router.get('/mycourses', getMyCourses);

module.exports = router; 