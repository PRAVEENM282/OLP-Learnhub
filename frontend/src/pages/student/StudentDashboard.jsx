import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalProgress: 0
  });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching student courses...');
      const response = await api.get('/enroll/mycourses');
      console.log('Student courses response:', response.data);
      const coursesData = response.data.data;
      setCourses(coursesData);

      // Calculate stats
      const totalCourses = coursesData.length;
      const completedCourses = coursesData.filter(course => course.status === 'completed').length;
      const inProgressCourses = coursesData.filter(course => course.status === 'active').length;
      const totalProgress = coursesData.length > 0 
        ? Math.round(coursesData.reduce((sum, course) => sum + course.progress, 0) / coursesData.length)
        : 0;

      console.log('Student dashboard stats:', {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalProgress
      });

      setStats({
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalProgress
      });
    } catch (error) {
      console.error('Error fetching student courses:', error);
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
            onClick={fetchMyCourses}
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
          <p className="text-muted">Continue your learning journey</p>
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
              <h3>{stats.inProgressCourses}</h3>
              <p className="mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.completedCourses}</h3>
              <p className="mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalProgress}%</h3>
              <p className="mb-0">Average Progress</p>
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
              <Link to="/student/courses" className="btn btn-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <div className="text-center py-4">
                  <h5 className="text-muted">No courses enrolled yet</h5>
                  <p className="text-muted">Start by exploring our course catalog</p>
                  <Link to="/" className="btn btn-primary">
                    Browse Courses
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
                          <h6 className="card-title">{course.C_title}</h6>
                          <p className="card-text text-muted small flex-grow-1">
                            {course.C_description.substring(0, 80)}...
                          </p>
                          
                          <div className="mt-auto">
                            <div className="mb-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Progress</small>
                                <small className="text-muted">{course.progress}%</small>
                              </div>
                              <div className="progress">
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <span className={`badge ${
                                course.status === 'completed' ? 'bg-success' : 
                                course.status === 'active' ? 'bg-primary' : 'bg-secondary'
                              }`}>
                                {course.status}
                              </span>
                              <Link
                                to={`/student/course/${course._id}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                Continue
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

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <Link to="/" className="btn btn-outline-primary w-100">
                    Browse New Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/student/courses" className="btn btn-outline-secondary w-100">
                    View All My Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/student/certificates" className="btn btn-outline-success w-100">
                    View Certificates
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-info w-100">
                    Learning Path
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 