const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  getTeacherCourses,
  getCourseStudents
} = require('../controllers/courseController');
const {
  protect,
  authorizeTeacher,
  authorizeTeacherOrAdmin
} = require('../middleware/authMiddleware');
const { uploadThumbnail, uploadVideo, handleUploadError } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Teacher routes
router.use(protect, authorizeTeacher);

router.get('/teacher/courses', getTeacherCourses);
router.post('/teacher/course', uploadThumbnail, handleUploadError, createCourse);
router.put('/teacher/course/:id', uploadThumbnail, handleUploadError, updateCourse);
router.delete('/teacher/course/:id', deleteCourse);
router.post('/teacher/course/:id/section', uploadVideo, handleUploadError, addSection);
router.get('/teacher/course/:id/students', getCourseStudents);

module.exports = router; 