import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchTeacherData();
    fetchEnrollments();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getTeacherCourses();
      const teacherCourses = response.data.data;
      setCourses(teacherCourses);

      // Calculate stats
      const totalCourses = teacherCourses.length;
      const totalStudents = teacherCourses.reduce((sum, course) => sum + (course.totalEnrollments || 0), 0);
      const totalRevenue = teacherCourses.reduce((sum, course) => sum + (course.revenue || 0), 0);
      const averageRating = totalCourses > 0 
        ? Math.round(teacherCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / totalCourses * 10) / 10
        : 0;

      setStats({
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getTeacherCourses();
      setEnrollments(response.data.data);
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'success',
      draft: 'secondary',
      archived: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status || 'draft'}</Badge>;
  };

  const getLevelBadge = (level) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'danger'
    };
    return <Badge bg={colors[level]}>{level}</Badge>;
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getRecentCourses = () => {
    return courses
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  if (loading) {
    return <LoadingSpinner text="Loading teacher dashboard..." />;
  }

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">
              Welcome back, {user?.name}! 👨‍🏫
            </h1>
            <p className="lead text-muted">
              Manage your courses, track student progress, and grow your teaching business
            </p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-5">
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.totalCourses}</div>
                <div className="dashboard-label">Total Courses</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-success text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.totalStudents}</div>
                <div className="dashboard-label">Total Students</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-warning text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">${stats.totalRevenue}</div>
                <div className="dashboard-label">Total Revenue</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-info text-white">
              <Card.Body className="text-center">
                <div className="dashboard-stat">{stats.averageRating}⭐</div>
                <div className="dashboard-label">Avg Rating</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4 className="fw-bold mb-4">Quick Actions</h4>
                <Row>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/teacher/course/create"
                      variant="outline-primary"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-plus-circle mb-2" style={{ fontSize: '2rem' }}></i>
                      Create Course
                    </Button>
                  </Col>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/teacher/courses"
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
                      to="/courses"
                      variant="outline-info"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-search mb-2" style={{ fontSize: '2rem' }}></i>
                      Browse Courses
                    </Button>
                  </Col>
                  <Col md={3} sm={6} className="mb-3">
                    <Button
                      as={Link}
                      to="/profile"
                      variant="outline-secondary"
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4"
                    >
                      <i className="fas fa-user-edit mb-2" style={{ fontSize: '2rem' }}></i>
                      Edit Profile
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Courses */}
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold">My Courses</h3>
              <Button as={Link} to="/teacher/courses" variant="outline-primary">
                View All Courses
              </Button>
            </div>
            
            {enrollments.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <i className="fas fa-book text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h4>No courses created yet</h4>
                  <p className="text-muted mb-4">
                    Start creating your first course to share your knowledge
                  </p>
                  <Button as={Link} to="/teacher/create-course" variant="primary" size="lg">
                    <i className="fas fa-plus me-2"></i>
                    Create Your First Course
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {enrollments.slice(0, 3).map(course => (
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
                          {course.C_description.length > 80
                            ? `${course.C_description.substring(0, 80)}...`
                            : course.C_description}
                        </Card.Text>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Status</small>
                            {getStatusBadge(course.status)}
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">Students</small>
                            <small className="fw-bold">{course.totalEnrollments || 0}</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">Sections</small>
                            <small className="fw-bold">{course.totalSections || 0}</small>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="d-grid gap-2">
                            <Button
                              as={Link}
                              to={`/teacher/course/${course._id}/sections`}
                              variant="primary"
                              size="sm"
                            >
                              <i className="fas fa-edit me-2"></i>
                              Manage Course
                            </Button>
                            <Button
                              as={Link}
                              to={`/teacher/course/${course._id}/edit`}
                              variant="outline-secondary"
                              size="sm"
                            >
                              <i className="fas fa-cog me-2"></i>
                              Edit Details
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Performance Overview */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4 className="fw-bold mb-4">Performance Overview</h4>
                <Row>
                  <Col md={6}>
                    <h6>Course Completion Rate</h6>
                    <ProgressBar 
                      now={75} 
                      variant="success" 
                      className="mb-3"
                      label="75%"
                    />
                    <small className="text-muted">Average completion rate across all courses</small>
                  </Col>
                  <Col md={6}>
                    <h6>Student Satisfaction</h6>
                    <ProgressBar 
                      now={85} 
                      variant="info" 
                      className="mb-3"
                      label="85%"
                    />
                    <small className="text-muted">Based on student feedback and ratings</small>
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

export default TeacherDashboard; 