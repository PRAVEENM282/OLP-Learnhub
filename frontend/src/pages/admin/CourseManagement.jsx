import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Alert, Modal } from 'react-bootstrap';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    teacher: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminCourses(filters);
      setCourses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminAPI.deleteAdminCourse(courseToDelete._id);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete course';
      toast.error(errorMessage);
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
    return <LoadingSpinner text="Loading courses..." />;
  }

  return (
    <>
      <Helmet>
        <title>Course Management - Admin Dashboard</title>
      </Helmet>

      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">Course Management</h1>
            <p className="lead text-muted">
              Manage all courses on the platform
            </p>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Search Courses</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by title..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Teacher</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by teacher..."
                        value={filters.teacher}
                        onChange={(e) => handleFilterChange('teacher', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setFilters({
                        search: '',
                        status: '',
                        teacher: '',
                        page: 1,
                        limit: 10
                      })}
                      className="w-100"
                    >
                      <i className="fas fa-times me-2"></i>
                      Clear Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Results Count */}
        <Row className="mb-4">
          <Col>
            <p className="text-muted">
              Showing {courses.length} of {pagination.total} courses
            </p>
          </Col>
        </Row>

        {/* Courses Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Course</th>
                      <th>Teacher</th>
                      <th>Status</th>
                      <th>Level</th>
                      <th>Price</th>
                      <th>Enrollments</th>
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
                                {course.C_categories.join(', ')}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold">{course.C_educator}</div>
                            <small className="text-muted">{course.userID?.email}</small>
                          </div>
                        </td>
                        <td>{getStatusBadge(course.status)}</td>
                        <td>{getLevelBadge(course.C_level)}</td>
                        <td>{formatPrice(course.C_price)}</td>
                        <td>
                          <div className="text-center">
                            <div className="fw-bold">{course.totalEnrollments || 0}</div>
                            <small className="text-muted">students</small>
                          </div>
                        </td>
                        <td>{formatDate(course.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              href={`/course/${course._id}`}
                              target="_blank"
                            >
                              <i className="fas fa-eye"></i>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === pagination.page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the course "{courseToDelete?.C_title}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Course
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseManagement; 