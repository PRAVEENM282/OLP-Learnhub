# Online Learning Platform (OLP) Backend

A comprehensive backend API for an online learning platform built with Node.js, Express.js, and MongoDB. Supports role-based authentication for students, teachers, and administrators.

## 🚀 Features

- **Role-based Authentication**: Support for students, teachers, and administrators
- **Course Management**: Create, update, delete, and manage courses with sections
- **Student Enrollment**: Enroll in courses, track progress, and earn certificates
- **File Upload**: Support for course thumbnails, videos, and certificates
- **Progress Tracking**: Monitor student progress through course sections
- **Certificate Generation**: Automatic certificate generation upon course completion
- **Admin Dashboard**: Comprehensive admin panel with user and course management
- **RESTful API**: Clean and well-documented REST API endpoints
- **Security**: JWT authentication, password hashing, rate limiting, and CORS protection

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── courseController.js  # Course management
│   ├── enrollmentController.js # Enrollment & progress
│   └── adminController.js   # Admin functions
├── middleware/
│   ├── authMiddleware.js    # JWT & role verification
│   ├── uploadMiddleware.js  # File upload handling
│   └── errorMiddleware.js   # Error handling
├── models/
│   ├── User.js             # User model
│   ├── Course.js           # Course model
│   ├── Enrollment.js       # Enrollment model
│   ├── Certificate.js      # Certificate model
│   └── Payment.js          # Payment model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── courses.js          # Course routes
│   ├── enrollments.js      # Enrollment routes
│   └── admin.js            # Admin routes
├── utils/
│   └── generateToken.js    # JWT token generation
├── uploads/                # File upload directory
├── .env                    # Environment variables
├── package.json            # Dependencies
├── server.js              # Main server file
└── README.md              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/olp_database

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # File Upload Configuration
   MAX_FILE_SIZE=10000000
   UPLOAD_PATH=./uploads

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation**
   Visit `http://localhost:5000/api/health` to check if the server is running.

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "type": "student" // student, teacher, admin
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/me
Authorization: Bearer <token>
```

### Course Endpoints

#### Get All Courses (Public)
```http
GET /api/courses?page=1&limit=10&category=programming&level=beginner&search=javascript
```

#### Get Single Course (Public)
```http
GET /api/courses/:courseId
```

#### Create Course (Teacher Only)
```http
POST /api/courses/teacher/course
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "C_title": "JavaScript Fundamentals",
  "C_description": "Learn JavaScript from scratch",
  "C_categories": ["programming", "web-development"],
  "C_price": 49.99,
  "C_level": "beginner",
  "C_language": "English",
  "thumbnail": <file>
}
```

#### Add Section to Course (Teacher Only)
```http
POST /api/courses/teacher/course/:courseId/section
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Introduction to Variables",
  "description": "Learn about variables in JavaScript",
  "content": "Variables are containers for storing data...",
  "duration": 15,
  "order": 1,
  "video": <file>
}
```

### Student Endpoints

#### Enroll in Course
```http
POST /api/enroll/:courseId
Authorization: Bearer <token>
```

#### Get My Courses
```http
GET /api/enroll/mycourses
Authorization: Bearer <token>
```

#### Get Course Progress
```http
GET /api/enroll/progress/:courseId
Authorization: Bearer <token>
```

#### Complete Section
```http
POST /api/enroll/progress/:courseId/section/:sectionId/complete
Authorization: Bearer <token>
```

#### Get Certificate
```http
GET /api/enroll/certificate/:courseId
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&type=student&status=active&search=john
Authorization: Bearer <token>
```

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <token>
```

## 🔐 Authentication & Authorization

### User Roles

1. **Student**: Can enroll in courses, track progress, and earn certificates
2. **Teacher**: Can create and manage courses, view enrolled students
3. **Admin**: Can manage all users and courses, access dashboard

### JWT Token Usage

Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  type: String (student/teacher/admin),
  avatar: String,
  bio: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  userID: ObjectId (ref: User),
  C_educator: String,
  C_categories: [String],
  C_title: String,
  C_description: String,
  C_price: Number,
  C_thumbnail: String,
  C_level: String (beginner/intermediate/advanced),
  C_language: String,
  sections: [SectionSchema],
  enrolled: [ObjectId (ref: User)],
  totalEnrollments: Number,
  rating: Number,
  totalRatings: Number,
  isPublished: Boolean,
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment Model
```javascript
{
  _id: ObjectId,
  studentID: ObjectId (ref: User),
  courseID: ObjectId (ref: Course),
  progress: Number (0-100),
  completedSections: [{
    sectionId: ObjectId,
    completedAt: Date
  }],
  certificateIssued: Boolean,
  certificateID: ObjectId (ref: Certificate),
  status: String (active/completed/dropped),
  paymentStatus: String (pending/completed/failed/refunded),
  enrolledAt: Date,
  lastAccessed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/olp_database
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRE=7d
MAX_FILE_SIZE=10000000
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Steps

1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start the server: `npm start`
5. Set up a process manager like PM2 for production

## 🧪 Testing

The API can be tested using tools like:
- Postman
- Insomnia
- curl commands
- Frontend applications

### Example curl commands

```bash
# Register a new user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","type":"student"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get courses (public)
curl -X GET http://localhost:5000/api/courses
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api` endpoint

## 🔄 Version History

- **v1.0.0**: Initial release with core features
  - User authentication and authorization
  - Course management
  - Student enrollment and progress tracking
  - Certificate generation
  - Admin dashboard
  - File upload support 