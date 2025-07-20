const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/database');

// Route files
const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
const admin = require('./routes/admin');
const upload = require('./routes/upload');
const certificates = require('./routes/certificates');

// Error handling middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// favicon error handling
app.get('/favicon.ico', (req, res) => res.status(204));

// Mount routers
app.use('/api', auth);
app.use('/api/courses', courses);
app.use('/api/enroll', enrollments);
app.use('/api/admin', admin);
app.use('/api/upload', upload);
app.use('/api/certificates', certificates);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    
    let dbStatus = 'unknown';
    switch (dbState) {
      case 0: dbStatus = 'disconnected'; break;
      case 1: dbStatus = 'connected'; break;
      case 2: dbStatus = 'connecting'; break;
      case 3: dbStatus = 'disconnecting'; break;
    }

    // Test basic database operations
    const User = require('./models/User');
    const Course = require('./models/Course');
    const Enrollment = require('./models/Enrollment');

    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();

    res.json({
      success: true,
      message: 'OLP Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        state: dbState,
        collections: {
          users: userCount,
          courses: courseCount,
          enrollments: enrollmentCount
        }
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Backend health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'OLP Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/register': 'Register a new user',
        'POST /api/login': 'Login user',
        'GET /api/me': 'Get current user profile',
        'PUT /api/me': 'Update user profile'
      },
      courses: {
        'GET /api/courses': 'Get all published courses',
        'GET /api/courses/:id': 'Get single course',
        'POST /api/courses/teacher/course': 'Create new course (Teacher)',
        'PUT /api/courses/teacher/course/:id': 'Update course (Teacher)',
        'DELETE /api/courses/teacher/course/:id': 'Delete course (Teacher)',
        'POST /api/courses/teacher/course/:id/section': 'Add section to course (Teacher)',
        'GET /api/courses/teacher/courses': 'Get teacher courses (Teacher)',
        'GET /api/courses/teacher/course/:id/students': 'Get course students (Teacher)'
      },
      enrollments: {
        'POST /api/enroll/:courseId': 'Enroll in course (Student)',
        'DELETE /api/enroll/:courseId': 'Unenroll from course (Student)',
        'GET /api/enroll/mycourses': 'Get enrolled courses (Student)',
        'GET /api/enroll/progress/:courseId': 'Get course progress (Student)',
        'POST /api/enroll/progress/:courseId/section/:sectionId/complete': 'Complete section (Student)',
        'GET /api/enroll/certificate/:courseId': 'Get course certificate (Student)'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (Admin)',
        'GET /api/admin/users/:id': 'Get single user (Admin)',
        'PUT /api/admin/users/:id': 'Update user (Admin)',
        'DELETE /api/admin/users/:id': 'Delete user (Admin)',
        'GET /api/admin/courses': 'Get all courses (Admin)',
        'DELETE /api/admin/courses/:id': 'Delete course (Admin)',
        'GET /api/admin/dashboard': 'Get dashboard stats (Admin)'
      },
      certificates: {
        'GET /api/certificates/:id/download': 'Download certificate PDF (Private)',
        'GET /api/certificates/verify/:code': 'Verify certificate (Public)'
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 OLP Backend running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📚 Online Learning Platform API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app; 