import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    stats: {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0
    },
    recentUsers: [],
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats if API fails
      setStats({
        stats: {
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalCourses: 0,
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0
        },
        recentUsers: [],
        recentCourses: []
      });
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'success',
      draft: 'secondary',
      archived: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status || 'draft'}</Badge>;
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">
              Welcome, {user?.name}! 👨‍💼
            </h1>
            <p className="lead text-muted">
              Manage your online learning platform and monitor key metrics
            </p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-5">
          <Col md={3} sm={6} className="mb-3">
            <Card className="dashboard-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.totalUsers}</div>
                <div className="dashboard-label">Total Users</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.totalCourses}</div>
                <div className="dashboard-label">Total Courses</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-warning text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.totalEnrollments}</div>
                <div className="dashboard-label">Total Enrollments</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-info text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.totalStudents}</div>
                <div className="dashboard-label">Active Students</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Stats */}
        <Row className="mb-5">
          <Col md={4} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-primary text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.totalTeachers}</div>
                <div className="dashboard-label">Teachers</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.activeEnrollments}</div>
                <div className="dashboard-label">Active Enrollments</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-warning text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.stats.completedEnrollments}</div>
                <div className="dashboard-label">Completed</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">Quick Actions</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <Link to="/admin/users">
                    <Button variant="outline-primary">
                      <i className="fas fa-users me-2"></i>
                      Manage Users
                    </Button>
                  </Link>
                  <Link to="/admin/courses">
                    <Button variant="outline-success">
                      <i className="fas fa-book me-2"></i>
                      Manage Courses
                    </Button>
                  </Link>
                  <Link to="/admin/enrollments">
                    <Button variant="outline-info">
                      <i className="fas fa-graduation-cap me-2"></i>
                      View Enrollments
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button variant="outline-secondary">
                      <i className="fas fa-eye me-2"></i>
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="fw-bold mb-3">Recent Users</h5>
                {stats.recentUsers && stats.recentUsers.length > 0 ? (
                  <ListGroup variant="flush">
                    {stats.recentUsers.map(user => (
                      <ListGroup.Item key={user._id} className="border-0 px-0 py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{user.name}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                          <div className="text-end">
                            <Badge bg={user.type === 'student' ? 'success' : user.type === 'teacher' ? 'warning' : 'primary'}>
                              {user.type}
                            </Badge>
                            <div className="text-muted small">{formatDate(user.createdAt)}</div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-3">
                    <i className="fas fa-users text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0">No recent users</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="fw-bold mb-3">Recent Courses</h5>
                {stats.recentCourses && stats.recentCourses.length > 0 ? (
                  <ListGroup variant="flush">
                    {stats.recentCourses.map(course => (
                      <ListGroup.Item key={course._id} className="border-0 px-0 py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{course.C_title}</div>
                            <small className="text-muted">by {course.C_educator}</small>
                          </div>
                          <div className="text-end">
                            {getStatusBadge(course.status)}
                            <div className="text-muted small">{formatDate(course.createdAt)}</div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-3">
                    <i className="fas fa-book text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0">No recent courses</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard; 