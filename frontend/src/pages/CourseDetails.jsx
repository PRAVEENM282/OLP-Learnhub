import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.type !== 'student') {
      setError('Only students can enroll in courses');
      return;
    }

    try {
      setEnrolling(true);
      setError('');
      
      const response = await api.post(`/enroll/${id}`);
      
      if (response.data.success) {
        navigate('/student/courses');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading course details..." />;
  }

  if (error || !course) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2 className="text-danger">Course Not Found</h2>
          <p className="text-muted">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Course Header */}
        <div className="col-lg-8">
          <div className="card mb-4">
            {course.C_thumbnail && (
              <img
                src={course.C_thumbnail}
                className="card-img-top"
                alt={course.C_title}
                style={{ height: '300px', objectFit: 'cover' }}
              />
            )}
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="card-title h2">{course.C_title}</h1>
                  <p className="text-muted mb-2">By {course.C_educator}</p>
                </div>
                <div className="text-end">
                  <h3 className="text-primary mb-0">${course.C_price}</h3>
                  <small className="text-muted">
                    {course.totalEnrollments} students enrolled
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <span className="badge bg-primary me-2">{course.C_level}</span>
                {course.C_categories.map(category => (
                  <span key={category} className="badge bg-secondary me-1">
                    {category}
                  </span>
                ))}
              </div>

              <p className="card-text">{course.C_description}</p>
            </div>
          </div>

          {/* Course Sections */}
          <div className="card">
            <div className="card-header">
              <h3 className="h5 mb-0">Course Content</h3>
            </div>
            <div className="card-body">
              {course.sections && course.sections.length > 0 ? (
                <div className="list-group list-group-flush">
                  {course.sections.map((section, index) => (
                    <div key={section._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Section {index + 1}: {section.title}</h6>
                        <p className="mb-1 text-muted small">{section.description}</p>
                        {section.duration > 0 && (
                          <small className="text-muted">{section.duration} minutes</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No sections available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '2rem' }}>
            <div className="card-body">
              <h4 className="card-title">Course Information</h4>
              
              <div className="mb-3">
                <strong>Price:</strong>
                <span className="text-primary fw-bold ms-2">${course.C_price}</span>
              </div>

              <div className="mb-3">
                <strong>Level:</strong>
                <span className="ms-2 text-capitalize">{course.C_level}</span>
              </div>

              <div className="mb-3">
                <strong>Language:</strong>
                <span className="ms-2">{course.C_language}</span>
              </div>

              <div className="mb-3">
                <strong>Students:</strong>
                <span className="ms-2">{course.totalEnrollments}</span>
              </div>

              <div className="mb-3">
                <strong>Sections:</strong>
                <span className="ms-2">{course.sections ? course.sections.length : 0}</span>
              </div>

              {course.sections && course.sections.length > 0 && (
                <div className="mb-4">
                  <strong>Total Duration:</strong>
                  <span className="ms-2">
                    {course.sections.reduce((total, section) => total + (section.duration || 0), 0)} minutes
                  </span>
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {isAuthenticated && user?.type === 'student' ? (
                <button
                  className="btn btn-primary w-100"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              ) : !isAuthenticated ? (
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate('/login')}
                >
                  Login to Enroll
                </button>
              ) : (
                <div className="alert alert-info" role="alert">
                  Only students can enroll in courses.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails; 