import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

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
      const response = await api.get('/courses/teacher/courses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
      await api.delete(`/courses/teacher/course/${courseToDelete._id}`);
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setDeleting(false);
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

  if (loading) {
    return <LoadingSpinner text="Loading your courses..." />;
  }

  return (
    <div className="container py-4">
        {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">My Courses</h1>
          <p className="text-muted">
              Manage and track all your created courses
            </p>
        </div>
        <div className="col-auto">
          <Link
            to="/teacher/course/create"
            className="btn btn-primary"
            >
              <i className="fas fa-plus me-2"></i>
              Create New Course
          </Link>
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

      {/* Courses Grid */}
      <div className="row">
                {courses.length === 0 ? (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                    <i className="fas fa-book text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h4>No courses created yet</h4>
                    <p className="text-muted mb-4">
                      Start your teaching journey by creating your first course
                    </p>
                <Link
                  to="/teacher/course/create"
                  className="btn btn-primary"
                    >
                      <i className="fas fa-plus me-2"></i>
                      Create Your First Course
                </Link>
              </div>
            </div>
                  </div>
                ) : (
          courses.map(course => (
            <div key={course._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 course-card">
                {course.C_thumbnail && (
                  <img
                    src={course.C_thumbnail}
                    className="card-img-top course-thumbnail"
                                  alt={course.C_title}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    {getStatusBadge(course.isPublished ? 'published' : 'draft')}
                    {getLevelBadge(course.C_level)}
                  </div>
                  
                  <h5 className="card-title">{course.C_title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {course.C_description.substring(0, 80)}...
                  </p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small className="text-muted">
                        {course.enrolled?.length || 0} students
                                  </small>
                      <span className="fw-bold text-primary">
                        {formatPrice(course.C_price)}
                      </span>
                                </div>
                    
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => navigate(`/teacher/course/${course._id}/edit`)}
                                >
                        <i className="fas fa-edit me-2"></i>
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm flex-fill"
                                  onClick={() => navigate(`/teacher/course/${course._id}/students`)}
                                >
                        <i className="fas fa-users me-2"></i>
                        Students
                      </button>
                    </div>
                    
                    <button
                      className="btn btn-outline-danger btn-sm w-100 mt-2"
                                  onClick={() => handleDeleteClick(course)}
                                >
                      <i className="fas fa-trash me-2"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
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
                <p>Are you sure you want to delete "{courseToDelete?.C_title}"?</p>
                <p className="text-muted">This action cannot be undone.</p>
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
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showDeleteModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default TeacherCourses; 