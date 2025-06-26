import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getMyCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching my courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (course) => {
    // Use the progress field returned from the backend
    return course.progress || 0;
  };

  const getLevelBadge = (level) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'danger'
    };
    return <Badge bg={colors[level]}>{level}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'success',
      draft: 'secondary',
      archived: 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status || 'draft'}</Badge>;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalDuration = (sections) => {
    if (!sections) return 0;
    return sections.reduce((total, section) => total + (section.duration || 0), 0);
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading your courses..." />;
  }

  const isTeacher = user?.type === 'teacher';
  const pageTitle = isTeacher ? 'My Created Courses' : 'My Enrolled Courses';
  const emptyMessage = isTeacher 
    ? "You haven't created any courses yet. Start your teaching journey today!"
    : "You haven't enrolled in any courses yet. Start your learning journey today!";
  const emptyButtonText = isTeacher ? 'Create Your First Course' : 'Browse Courses';
  const emptyButtonLink = isTeacher ? '/teacher/create-course' : '/courses';

  return (
    <>
      <Helmet>
        <title>{pageTitle} - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">{pageTitle}</h1>
            <p className="lead text-muted">
              {isTeacher 
                ? 'Manage and track all your created courses'
                : 'Continue learning from where you left off'
              }
            </p>
          </Col>
          {isTeacher && (
            <Col xs="auto">
              <Button
                as={Link}
                to="/teacher/create-course"
                variant="primary"
                size="lg"
              >
                <i className="fas fa-plus me-2"></i>
                Create New Course
              </Button>
            </Col>
          )}
        </Row>

        {courses.length === 0 ? (
          <Row>
            <Col>
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <i className="fas fa-book-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h3>No Courses Yet</h3>
                  <p className="text-muted mb-4">{emptyMessage}</p>
                  <Link to={emptyButtonLink}>
                    <Button variant="primary" size="lg">
                      <i className="fas fa-search me-2"></i>
                      {emptyButtonText}
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <>
            {/* Stats */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <h3 className="text-primary mb-1">{courses.length}</h3>
                    <p className="text-muted mb-0">
                      {isTeacher ? 'Created Courses' : 'Enrolled Courses'}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              {!isTeacher && (
                <>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                      <Card.Body>
                        <h3 className="text-success mb-1">
                          {courses.filter(course => calculateProgress(course) === 100).length}
                        </h3>
                        <p className="text-muted mb-0">Completed</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                      <Card.Body>
                        <h3 className="text-warning mb-1">
                          {courses.filter(course => calculateProgress(course) > 0 && calculateProgress(course) < 100).length}
                        </h3>
                        <p className="text-muted mb-0">In Progress</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                      <Card.Body>
                        <h3 className="text-info mb-1">
                          {courses.filter(course => calculateProgress(course) === 0).length}
                        </h3>
                        <p className="text-muted mb-0">Not Started</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              )}
              {isTeacher && (
                <>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                      <Card.Body>
                        <h3 className="text-success mb-1">
                          {courses.filter(course => course.status === 'published').length}
                        </h3>
                        <p className="text-muted mb-0">Published</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                      <Card.Body>
                        <h3 className="text-warning mb-1">
                          {courses.filter(course => course.status === 'draft').length}
                        </h3>
                        <p className="text-muted mb-0">Drafts</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                      <Card.Body>
                        <h3 className="text-info mb-1">
                          {courses.reduce((total, course) => total + (course.totalEnrollments || 0), 0)}
                        </h3>
                        <p className="text-muted mb-0">Total Students</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              )}
            </Row>

            {/* Course Grid */}
            <Row>
              {courses.map(course => {
                const progress = calculateProgress(course);
                const totalDuration = getTotalDuration(course.sections);
                
                return (
                  <Col key={course._id} lg={6} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm course-card">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={course.C_thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
                          alt={course.C_title}
                          className="course-card-img"
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          {getLevelBadge(course.C_level)}
                        </div>
                        {!isTeacher && (
                          <div className="position-absolute bottom-0 start-0 end-0 m-2">
                            <ProgressBar 
                              now={progress} 
                              variant={progress === 100 ? 'success' : 'primary'}
                              className="rounded-pill"
                            />
                          </div>
                        )}
                      </div>
                      
                      <Card.Body className="d-flex flex-column">
                        <div className="mb-2">
                          {course.C_categories.map(category => (
                            <Badge key={category} bg="light" text="dark" className="me-1">
                              {category}
                            </Badge>
                          ))}
                          {isTeacher && getStatusBadge(course.status)}
                        </div>
                        
                        <Card.Title className="fw-bold mb-2">{course.C_title}</Card.Title>
                        <Card.Text className="text-muted flex-grow-1">
                          {course.C_description.length > 80
                            ? `${course.C_description.substring(0, 80)}...`
                            : course.C_description}
                        </Card.Text>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                              <i className="fas fa-user me-1"></i>
                              {course.C_educator}
                            </small>
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              {formatDuration(totalDuration)}
                            </small>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="fas fa-play-circle me-1"></i>
                              {course.sections ? course.sections.length : 0} sections
                            </small>
                            {!isTeacher ? (
                              <Badge 
                                bg={progress === 100 ? 'success' : progress > 0 ? 'warning' : 'secondary'}
                              >
                                {progress}% Complete
                              </Badge>
                            ) : (
                              <small className="text-muted">
                                {course.totalEnrollments || 0} students
                              </small>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          {isTeacher ? (
                            <div className="d-grid gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/teacher/course/${course._id}/sections`)}
                              >
                                <i className="fas fa-edit me-2"></i>
                                Manage Course
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => navigate(`/teacher/course/${course._id}/edit`)}
                              >
                                <i className="fas fa-cog me-2"></i>
                                Edit Details
                              </Button>
                            </div>
                          ) : (
                            <Link to={`/course/${course._id}`} className="w-100">
                              <Button 
                                variant={progress === 100 ? 'outline-success' : 'primary'} 
                                className="w-100"
                              >
                                {progress === 100 ? (
                                  <>
                                    <i className="fas fa-certificate me-2"></i>
                                    View Certificate
                                  </>
                                ) : progress > 0 ? (
                                  <>
                                    <i className="fas fa-play me-2"></i>
                                    Continue Learning
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-play me-2"></i>
                                    Start Learning
                                  </>
                                )}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default MyCourses; 