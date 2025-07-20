import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    C_title: '',
    C_description: '',
    C_price: 0,
    C_level: 'beginner',
    C_categories: [],
    isPublished: false
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/teacher/course/${courseId}`);
      const courseData = response.data.data;
      setCourse(courseData);
      setFormData({
        C_title: courseData.C_title || '',
        C_description: courseData.C_description || '',
        C_price: courseData.C_price || 0,
        C_level: courseData.C_level || 'beginner',
        C_categories: courseData.C_categories || [],
        isPublished: courseData.isPublished || false
      });
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat);
    setFormData(prev => ({
      ...prev,
      C_categories: categories
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/courses/teacher/course/${courseId}`, formData);
      navigate('/teacher/courses');
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading course..." />;
  }

  if (!course) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2 className="text-danger">Course Not Found</h2>
          <p className="text-muted">The course you're looking for doesn't exist</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/teacher/courses')}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Edit Course</h1>
          <p className="text-muted">Update your course information</p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/teacher/courses')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Courses
          </button>
        </div>
      </div>

      {/* Course Preview */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Course Preview</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  {course.C_thumbnail && (
                    <img
                      src={course.C_thumbnail}
                      alt={course.C_title}
                      className="img-fluid rounded"
                    />
                  )}
                </div>
                <div className="col-md-8">
                  <h4>{course.C_title}</h4>
                  <p className="text-muted">{course.C_description}</p>
                  <div className="d-flex gap-2 mb-2">
                    <span className={`badge ${
                      course.isPublished ? 'bg-success' : 'bg-warning'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className={`badge bg-primary`}>
                      {course.C_level}
                    </span>
                    <span className="badge bg-info">
                      ${course.C_price}
                    </span>
                  </div>
                  <small className="text-muted">
                    {course.enrolled?.length || 0} students enrolled
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Course Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label htmlFor="C_title" className="form-label">Course Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="C_title"
                        name="C_title"
                        value={formData.C_title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="C_description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="C_description"
                        name="C_description"
                        rows="4"
                        value={formData.C_description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="C_price" className="form-label">Price ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="C_price"
                            name="C_price"
                            min="0"
                            step="0.01"
                            value={formData.C_price}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="C_level" className="form-label">Level</label>
                          <select
                            className="form-select"
                            id="C_level"
                            name="C_level"
                            value={formData.C_level}
                            onChange={handleInputChange}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="C_categories" className="form-label">Categories (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="C_categories"
                        name="C_categories"
                        value={formData.C_categories.join(', ')}
                        onChange={handleCategoryChange}
                        placeholder="e.g., Programming, Web Development, JavaScript"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Publishing</h6>
                      </div>
                      <div className="card-body">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isPublished"
                            name="isPublished"
                            checked={formData.isPublished}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="isPublished">
                            Publish Course
                          </label>
                        </div>
                        <small className="text-muted">
                          Published courses are visible to students
                        </small>
                      </div>
                    </div>

                    <div className="card mt-3">
                      <div className="card-header">
                        <h6 className="mb-0">Course Stats</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <small className="text-muted">Sections</small>
                          <div className="fw-bold">{course.sections?.length || 0}</div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Students</small>
                          <div className="fw-bold">{course.enrolled?.length || 0}</div>
                        </div>
                        <div className="mb-0">
                          <small className="text-muted">Created</small>
                          <div className="fw-bold">{new Date(course.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/teacher/courses')}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse; 