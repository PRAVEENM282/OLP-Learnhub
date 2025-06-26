import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageProgress: 0
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getMyCourses();
      const data = response.data.data;
      setEnrollments(data);
      
      // Calculate stats
      const totalCourses = data.length;
      const completedCourses = data.filter(course => course.status === 'completed').length;
      const inProgressCourses = data.filter(course => course.status === 'active').length;
      const averageProgress = totalCourses > 0 
        ? Math.round(data.reduce((sum, course) => sum + course.progress, 0) / totalCourses)
        : 0;

      setStats({
        totalCourses,
        completedCourses,
        inProgressCourses,
        averageProgress
      });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentCourses = () => {
    return enrollments
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, 3);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <>
      <Helmet>
        <title>Student Dashboard - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="lead text-muted">
              Continue your learning journey and track your progress
            </p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-5">
          <Col md={3} sm={6} className="mb-3">
            <Card className="dashboard-card border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.totalCourses}</div>
                <div className="dashboard-label">Total Courses</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.completedCourses}</div>
                <div className="dashboard-label">Completed</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-warning text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.inProgressCourses}</div>
                <div className="dashboard-label">In Progress</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-info text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.averageProgress}%</div>
                <div className="dashboard-label">Avg Progress</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Courses */}
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold">Recent Courses</h3>
              <Button as={Link} to="/student/mycourses" variant="outline-primary">
                View All Courses
              </Button>
            </div>
            
            {enrollments.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <i className="fas fa-graduation-cap text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h4>No courses enrolled yet</h4>
                  <p className="text-muted mb-4">
                    Start your learning journey by enrolling in your first course
                  </p>
                  <Button as={Link} to="/courses" variant="primary" size="lg">
                    <i className="fas fa-search me-2"></i>
                    Browse Courses
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {getRecentCourses().map(course => (
                  <Col key={course._id} lg={4} md={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Img
                        variant="top"
                        src={course.C_thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fw-bold mb-2">
                          {course.C_title}
                        </Card.Title>
                        <Card.Text className="text-muted flex-grow-1">
                          {course.C_educator}
                        </Card.Text>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Progress</small>
                            <small className="fw-bold">{course.progress}%</small>
                          </div>
                          <ProgressBar 
                            now={course.progress} 
                            variant={getProgressColor(course.progress)}
                            className="mb-2"
                          />
                        </div>

                        <div className="mt-auto">
                          <Button
                            as={Link}
                            to={`/student/course/${course._id}`}
                            variant="primary"
                            size="sm"
                            className="w-100"
                          >
                            {course.progress === 100 ? (
                              <>
                                <i className="fas fa-certificate me-2"></i>
                                View Certificate
                              </>
                            ) : (
                              <>
                                <i className="fas fa-play me-2"></i>
                                Continue Learning
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4 className="fw-bold mb-4">Quick Actions</h4>
                <Row>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/courses"
                      variant="outline-primary"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-search mb-2" style={{ fontSize: '2rem' }}></i>
                      Browse Courses
                    </Button>
                  </Col>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/student/mycourses"
                      variant="outline-success"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-book mb-2" style={{ fontSize: '2rem' }}></i>
                      My Courses
                    </Button>
                  </Col>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/profile"
                      variant="outline-info"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-user-edit mb-2" style={{ fontSize: '2rem' }}></i>
                      Edit Profile
                    </Button>
                  </Col>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/courses"
                      variant="outline-warning"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-star mb-2" style={{ fontSize: '2rem' }}></i>
                      Featured Courses
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default StudentDashboard; 