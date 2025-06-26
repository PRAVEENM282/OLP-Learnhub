import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const TeacherCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getTeacherCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await coursesAPI.deleteCourse(courseToDelete._id);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner text="Loading your courses..." />;
  }

  return (
    <>
      <Helmet>
        <title>My Courses - Teacher Dashboard</title>
      </Helmet>

      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">My Courses</h1>
            <p className="lead text-muted">
              Manage and track all your created courses
            </p>
          </Col>
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
        </Row>

        {/* Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center">
              <Card.Body>
                <h3 className="text-primary mb-1">{courses.length}</h3>
                <p className="text-muted mb-0">Total Courses</p>
              </Card.Body>
            </Card>
          </Col>
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
        </Row>

        {/* Courses Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                {courses.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-book text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h4>No courses created yet</h4>
                    <p className="text-muted mb-4">
                      Start your teaching journey by creating your first course
                    </p>
                    <Button
                      as={Link}
                      to="/teacher/create-course"
                      variant="primary"
                      size="lg"
                    >
                      <i className="fas fa-plus me-2"></i>
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Course</th>
                          <th>Status</th>
                          <th>Level</th>
                          <th>Price</th>
                          <th>Students</th>
                          <th>Sections</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(course => (
                          <tr key={course._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={course.C_thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=50&h=30&fit=crop'}
                                  alt={course.C_title}
                                  className="rounded me-3"
                                  style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div className="fw-bold">{course.C_title}</div>
                                  <small className="text-muted">
                                    {course.C_description.length > 50
                                      ? `${course.C_description.substring(0, 50)}...`
                                      : course.C_description}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{getStatusBadge(course.status)}</td>
                            <td>{getLevelBadge(course.C_level)}</td>
                            <td className="fw-bold">{formatPrice(course.C_price)}</td>
                            <td>
                              <div className="text-center">
                                <div className="fw-bold">{course.totalEnrollments || 0}</div>
                                <small className="text-muted">enrolled</small>
                              </div>
                            </td>
                            <td>
                              <div className="text-center">
                                <div className="fw-bold">{course.totalSections || 0}</div>
                                <small className="text-muted">sections</small>
                              </div>
                            </td>
                            <td>{formatDate(course.createdAt)}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/teacher/course/${course._id}/sections`)}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => navigate(`/teacher/course/${course._id}/students`)}
                                >
                                  <i className="fas fa-users"></i>
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => navigate(`/teacher/course/${course._id}/edit`)}
                                >
                                  <i className="fas fa-cog"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(course)}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the course "{courseToDelete?.C_title}"? 
          This action cannot be undone and will affect all enrolled students.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete Course'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TeacherCourses; 