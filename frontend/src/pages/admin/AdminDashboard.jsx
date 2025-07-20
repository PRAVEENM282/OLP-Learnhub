import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching admin dashboard stats...');
      const response = await api.get('/admin/dashboard');
      console.log('Admin dashboard response:', response.data);
      const data = response.data.data;
      
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setRecentCourses(data.recentCourses);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
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
            onClick={fetchDashboardStats}
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
          <p className="text-muted">Manage the platform and monitor system performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalUsers}</h3>
              <p className="mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalStudents}</h3>
              <p className="mb-0">Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalTeachers}</h3>
              <p className="mb-0">Teachers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalCourses}</h3>
              <p className="mb-0">Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.totalEnrollments}</h3>
              <p className="mb-0">Total Enrollments</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.activeEnrollments}</h3>
              <p className="mb-0">Active Enrollments</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card stat-card">
            <div className="card-body text-center">
              <h3>{stats.completedEnrollments}</h3>
              <p className="mb-0">Completed</p>
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
                  <Link to="/admin/users" className="btn btn-primary w-100">
                    <i className="fas fa-users me-2"></i>
                    Manage Users
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/admin/courses" className="btn btn-outline-primary w-100">
                    <i className="fas fa-book me-2"></i>
                    Manage Courses
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/admin/enrollments" className="btn btn-outline-secondary w-100">
                    <i className="fas fa-graduation-cap me-2"></i>
                    View Enrollments
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-outline-info w-100">
                    <i className="fas fa-chart-bar me-2"></i>
                    System Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        {/* Recent Users */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Users</h5>
              <Link to="/admin/users" className="btn btn-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentUsers.length === 0 ? (
                <p className="text-muted text-center">No recent users</p>
              ) : (
                <div className="list-group list-group-flush">
                  {recentUsers.map(user => (
                    <div key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{user.name}</h6>
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${
                          user.type === 'admin' ? 'bg-danger' :
                          user.type === 'teacher' ? 'bg-warning' : 'bg-success'
                        }`}>
                          {user.type}
                        </span>
                        <br />
                        <small className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Courses</h5>
              <Link to="/admin/courses" className="btn btn-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentCourses.length === 0 ? (
                <p className="text-muted text-center">No recent courses</p>
              ) : (
                <div className="list-group list-group-flush">
                  {recentCourses.map(course => (
                    <div key={course._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{course.C_title}</h6>
                        <small className="text-muted">By {course.C_educator}</small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${
                          course.isPublished ? 'bg-success' : 'bg-warning'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <br />
                        <small className="text-muted">
                          {course.totalEnrollments || 0} students
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

      {/* System Health */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">System Health</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="h4 text-success mb-2">
                      <i className="fas fa-server"></i>
                    </div>
                    <h6>Server Status</h6>
                    <span className="badge bg-success">Online</span>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="h4 text-info mb-2">
                      <i className="fas fa-database"></i>
                    </div>
                    <h6>Database</h6>
                    <span className="badge bg-success">Connected</span>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="h4 text-warning mb-2">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <h6>Security</h6>
                    <span className="badge bg-success">Protected</span>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="h4 text-primary mb-2">
                      <i className="fas fa-clock"></i>
                    </div>
                    <h6>Uptime</h6>
                    <span className="badge bg-success">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 