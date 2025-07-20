import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to load courses');
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
      await api.delete(`/admin/courses/${courseToDelete._id}`);
      alert('Course deleted successfully');
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-success',
      draft: 'bg-secondary',
      archived: 'bg-danger'
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status || 'draft'}</span>;
  };

  const getLevelBadge = (level) => {
    const colors = {
      beginner: 'bg-success',
      intermediate: 'bg-warning',
      advanced: 'bg-danger'
    };
    return <span className={`badge ${colors[level]}`}>{level}</span>;
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.C_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || course.isPublished === (selectedStatus === 'published');
    const matchesTeacher = !selectedTeacher || course.C_educator?.toLowerCase().includes(selectedTeacher.toLowerCase());
    return matchesSearch && matchesStatus && matchesTeacher;
  });

  if (loading) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Course Management</h1>
          <p className="text-muted">
            Manage all courses on the platform
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin/dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{courses.length}</h3>
              <p className="text-muted mb-0">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {courses.filter(course => course.isPublished).length}
              </h3>
              <p className="text-muted mb-0">Published</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning mb-1">
                {courses.filter(course => !course.isPublished).length}
              </h3>
              <p className="text-muted mb-0">Drafts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info mb-1">
                {courses.reduce((total, course) => total + (course.enrolled?.length || 0), 0)}
              </h3>
              <p className="text-muted mb-0">Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search courses by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-3">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by teacher..."
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          />
        </div>
        <div className="col-md-2 mb-3">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('');
              setSelectedTeacher('');
            }}
          >
            <i className="fas fa-times me-2"></i>
            Clear
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="row mb-4">
        <div className="col">
          <p className="text-muted">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Courses</h5>
            </div>
            <div className="card-body">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-book text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted">No courses found</h5>
                  <p className="text-muted">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Teacher</th>
                        <th>Status</th>
                        <th>Level</th>
                        <th>Students</th>
                        <th>Price</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map(course => (
                        <tr key={course._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {course.C_thumbnail && (
                                <img
                                  src={course.C_thumbnail}
                                  alt={course.C_title}
                                  className="rounded me-3"
                                  style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <div className="fw-bold">{course.C_title}</div>
                                <small className="text-muted">
                                  {course.C_description?.substring(0, 50)}...
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{course.C_educator}</td>
                          <td>{getStatusBadge(course.isPublished ? 'published' : 'draft')}</td>
                          <td>{getLevelBadge(course.C_level)}</td>
                          <td>{course.enrolled?.length || 0}</td>
                          <td>{formatPrice(course.C_price)}</td>
                          <td>{formatDate(course.createdAt)}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/courses/${course._id}`)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClick(course)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete course <strong>{courseToDelete?.C_title}</strong>?</p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement; 