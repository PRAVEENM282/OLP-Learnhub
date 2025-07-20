import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching teacher courses...');
      const response = await api.get('/courses/teacher/courses');
      console.log('Teacher courses response:', response.data);
      const coursesData = response.data.data;
      setCourses(coursesData);

      // Calculate stats
      const totalCourses = coursesData.length;
      const publishedCourses = coursesData.filter(course => course.isPublished).length;
      const draftCourses = coursesData.filter(course => !course.isPublished).length;
      const totalStudents = coursesData.reduce((sum, course) => sum + (course.enrolled?.length || 0), 0);
      const totalRevenue = coursesData.reduce((sum, course) => {
        const studentCount = course.enrolled?.length || 0;
        return sum + (studentCount * course.C_price);
      }, 0);

      console.log('Teacher dashboard stats:', {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        totalRevenue
      });

      setStats({
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-danger">Dashboard Error</h2>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={fetchTeacherCourses}
          >
            <i className="fas fa-refresh me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted">Manage your courses and track student progress</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalCourses}</h3>
              <p className="mb-0">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.publishedCourses}</h3>
              <p className="mb-0">Published</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalStudents}</h3>
              <p className="mb-0">Total Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>${stats.totalRevenue}</h3>
              <p className="mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <Link to="/teacher/course/create" className="btn btn-primary w-100">
                    <i className="fas fa-plus me-2"></i>
                    Create New Course
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/teacher/courses" className="btn btn-outline-primary w-100">
                    <i className="fas fa-book me-2"></i>
                    Manage Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-search me-2"></i>
                    Browse Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-info w-100">
                    <i className="fas fa-chart-bar me-2"></i>
                    Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">My Courses</h4>
              <Link to="/teacher/courses" className="btn btn-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <div className="text-center py-4">
                  <h5 className="text-muted">No courses created yet</h5>
                  <p className="text-muted">Start by creating your first course</p>
                  <Link to="/teacher/course/create" className="btn btn-primary">
                    Create Course
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {courses.slice(0, 6).map(course => (
                    <div key={course._id} className="col-lg-4 col-md-6 mb-3">
                      <div className="card course-card h-100">
                        {course.C_thumbnail && (
                          <img
                            src={course.C_thumbnail}
                            className="card-img-top course-thumbnail"
                            alt={course.C_title}
                          />
                        )}
                        <div className="card-body d-flex flex-column">
                          <div className="mb-2">
                            <span className={`badge ${
                              course.isPublished ? 'bg-success' : 'bg-warning'
                            } me-2`}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="badge bg-primary">
                              {course.C_level}
                            </span>
                          </div>
                          
                          <h6 className="card-title">{course.C_title}</h6>
                          <p className="card-text text-muted small flex-grow-1">
                            {course.C_description.substring(0, 80)}...
                          </p>
                          
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">
                                {course.totalSections || 0} sections
                              </small>
                              <small className="text-muted">
                                {course.totalDuration || 0} min
                              </small>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">
                                {course.enrolled?.length || 0} students
                              </small>
                              <span className="fw-bold text-primary">
                                ${course.C_price}
                              </span>
                            </div>
                            
                            <div className="d-flex gap-2">
                              <Link
                                to={`/teacher/course/${course._id}/edit`}
                                className="btn btn-outline-primary btn-sm flex-fill"
                              >
                                Edit
                              </Link>
                              <Link
                                to={`/teacher/course/${course._id}/students`}
                                className="btn btn-outline-secondary btn-sm flex-fill"
                              >
                                Students
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <p className="text-muted text-center">No recent activity</p>
              ) : (
                <div className="list-group list-group-flush">
                  {courses.slice(0, 5).map(course => (
                    <div key={course._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{course.C_title}</h6>
                        <small className="text-muted">
                          Created {new Date(course.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${
                          course.isPublished ? 'bg-success' : 'bg-warning'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <br />
                        <small className="text-muted">
                          {course.enrolled?.length || 0} students
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 