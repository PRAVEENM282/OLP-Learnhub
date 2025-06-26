import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/me'),
  updateProfile: (profileData) => api.put('/me', profileData),
  changePassword: (passwordData) => api.put('/me/password', passwordData),
};

// Courses API
export const coursesAPI = {
  getAllCourses: (params = {}) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses/teacher/course', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/teacher/course/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/teacher/course/${id}`),
  addSection: (courseId, sectionData) => api.post(`/courses/teacher/course/${courseId}/section`, sectionData),
  getTeacherCourses: () => api.get('/courses/teacher/courses'),
  getCourseStudents: (courseId) => api.get(`/courses/teacher/course/${courseId}/students`),
};

// Enrollment API
export const enrollmentAPI = {
  enrollInCourse: (courseId) => api.post(`/enroll/${courseId}`),
  getMyCourses: () => api.get('/enroll/mycourses'),
  getCourseProgress: (courseId) => api.get(`/enroll/progress/${courseId}`),
  completeSection: (courseId, sectionId) => api.post(`/enroll/progress/${courseId}/section/${sectionId}/complete`),
  getCertificate: (courseId) => api.get(`/enroll/certificate/${courseId}`),
  unenrollFromCourse: (courseId) => api.delete(`/enroll/${courseId}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAdminCourses: (params = {}) => api.get('/admin/courses', { params }),
  deleteAdminCourse: (id) => api.delete(`/admin/courses/${id}`),
  getDashboardStats: () => api.get('/admin/dashboard'),
};

// File upload helper
export const uploadFile = async (file, type = 'thumbnail') => {
  const formData = new FormData();
  formData.append(type, file);
  
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Upload failed');
  }
  
  return response.json();
};

export default api; 