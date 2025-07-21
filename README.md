# LearnHub - Online Learning Platform

A comprehensive online learning platform built with Node.js, Express, MongoDB, and React. The platform supports role-based access control for students, teachers, and administrators with features like course management, enrollment tracking, progress monitoring, and certificate generation.

## Features

### 🎓 For Students
- Browse and enroll in courses
- Track learning progress
- Watch video content and read materials
- Complete course sections
- Download completion certificates
- View course history and achievements

### 👨‍🏫 For Teachers
- Create and manage courses
- Add course sections and content
- Upload video materials
- Track student enrollment and progress
- View student analytics
- Manage course settings

### 👨‍💼 For Administrators
- User management (students, teachers, admins)
- Course oversight and moderation
- System analytics and reporting
- Platform health monitoring
- Enrollment management

### 🔧 Technical Features
- JWT-based authentication
- Role-based access control
- File upload support
- PDF certificate generation
- Progress tracking
- Real-time course updates
- Responsive design

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **PDFKit** - Certificate generation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap** - CSS framework
- **React Player** - Video player
- **React Hot Toast** - Notifications

## Project Structure

```
Learnhub/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── index.css      # Global styles
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learnhub
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses/teacher/course` - Create new course (Teacher)
- `PUT /api/courses/teacher/course/:id` - Update course (Teacher)
- `DELETE /api/courses/teacher/course/:id` - Delete course (Teacher)
- `POST /api/courses/teacher/course/:id/section` - Add section to course (Teacher)
- `GET /api/courses/teacher/courses` - Get teacher courses (Teacher)
- `GET /api/courses/teacher/course/:id/students` - Get course students (Teacher)

### Enrollments
- `POST /api/enroll/:courseId` - Enroll in course (Student)
- `DELETE /api/enroll/:courseId` - Unenroll from course (Student)
- `GET /api/enroll/mycourses` - Get enrolled courses (Student)
- `GET /api/enroll/progress/:courseId` - Get course progress (Student)
- `POST /api/enroll/progress/:courseId/section/:sectionId/complete` - Complete section (Student)
- `GET /api/enroll/certificate/:courseId` - Get course certificate (Student)

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/users/:id` - Get single user (Admin)
- `PUT /api/admin/users/:id` - Update user (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)
- `GET /api/admin/courses` - Get all courses (Admin)
- `DELETE /api/admin/courses/:id` - Delete course (Admin)
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)

### Certificates
- `GET /api/certificates/:id/download` - Download certificate PDF (Private)
- `GET /api/certificates/verify/:code` - Verify certificate (Public)

## Usage

### Creating an Admin User
To create the first admin user, you can either:
1. Register normally and manually update the user type in the database
2. Use the registration endpoint with admin type (if allowed)

### Course Creation Flow
1. Teacher registers/logs in
2. Creates a new course with basic information
3. Adds course sections with content and videos
4. Publishes the course for student enrollment

### Student Learning Flow
1. Student registers/logs in
2. Browses available courses
3. Enrolls in desired courses
4. Accesses course content and tracks progress
5. Completes sections and earns certificates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@learnhub.com or create an issue in the repository.

## Acknowledgments

- Bootstrap for the UI framework
- React community for the excellent documentation
- MongoDB for the database solution
- All contributors who helped build this platform

- Doc and Video link :- https://drive.google.com/drive/folders/1SnXACHy5lYS20wvNo3UjgLRQ7YoC4Qm4?usp=drive_link
