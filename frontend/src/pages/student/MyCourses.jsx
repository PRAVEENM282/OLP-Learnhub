import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

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
      const response = await api.get('/enroll/mycourses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (course) => {
    return course.progress || 0;
  };

  const getLevelBadge = (level) => {
    const colors = {
      beginner: 'bg-success',
      intermediate: 'bg-warning',
      advanced: 'bg-danger'
    };
    return <span className={`badge ${colors[level]}`}>{level}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-success',
      draft: 'bg-secondary',
      archived: 'bg-danger'
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status || 'draft'}</span>;
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
  const emptyButtonLink = isTeacher ? '/teacher/course/create' : '/';

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">{pageTitle}</h1>
          <p className="text-muted">
            {isTeacher 
              ? 'Manage and track all your created courses'
              : 'Continue learning from where you left off'
            }
          </p>
        </div>
        {isTeacher && (
          <div className="col-auto">
            <Link
              to="/teacher/course/create"
              className="btn btn-primary"
            >
              <i className="fas fa-plus me-2"></i>
              Create New Course
            </Link>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="row">
          <div className="col">
            <div className="card text-center py-5">
              <div className="card-body">
                <i className="fas fa-book-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h3>No Courses Yet</h3>
                <p className="text-muted mb-4">{emptyMessage}</p>
                <Link to={emptyButtonLink} className="btn btn-primary">
                  <i className="fas fa-search me-2"></i>
                  {emptyButtonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Stats */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary mb-1">{courses.length}</h3>
                  <p className="text-muted mb-0">
                    {isTeacher ? 'Created Courses' : 'Enrolled Courses'}
                  </p>
                </div>
              </div>
            </div>
            {!isTeacher && (
              <div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h3 className="text-success mb-1">
                        {courses.filter(course => calculateProgress(course) === 100).length}
                      </h3>
                      <p className="text-muted mb-0">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h3 className="text-warning mb-1">
                        {courses.filter(course => calculateProgress(course) > 0 && calculateProgress(course) < 100).length}
                      </h3>
                      <p className="text-muted mb-0">In Progress</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-center">
                    <div className="card-body">
                      <h3 className="text-info mb-1">
                        {courses.filter(course => calculateProgress(course) === 0).length}
                      </h3>
                      <p className="text-muted mb-0">Not Started</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isTeacher && (
              <div>
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
            )}
          </div>

          {/* Course Grid */}
          <div className="row">
            {courses.map(course => {
              const progress = calculateProgress(course);
              const totalDuration = getTotalDuration(course.sections);
              
              return (
                <div key={course._id} className="col-lg-6 mb-4">
                  <div className="card h-100 course-card">
                    <div className="position-relative">
                      <img
                        src={course.C_thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
                        alt={course.C_title}
                        className="card-img-top course-card-img"
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        {getLevelBadge(course.C_level)}
                      </div>
                      {!isTeacher && (
                        <div className="position-absolute bottom-0 start-0 end-0 m-2">
                          <div className="progress rounded-pill">
                            <div 
                              className={`progress-bar ${progress === 100 ? 'bg-success' : 'bg-primary'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-body d-flex flex-column">
                      <div className="mb-2">
                        {course.C_categories?.map(category => (
                          <span key={category} className="badge bg-light text-dark me-1">
                            {category}
                          </span>
                        ))}
                        {isTeacher && getStatusBadge(course.status)}
                      </div>
                      
                      <h5 className="card-title fw-bold mb-2">{course.C_title}</h5>
                      <p className="card-text text-muted flex-grow-1">
                        {course.C_description.length > 80
                          ? `${course.C_description.substring(0, 80)}...`
                          : course.C_description}
                      </p>
                      
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
                            <span className={`badge ${
                              progress === 100 ? 'bg-success' : progress > 0 ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {progress}% Complete
                            </span>
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
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/teacher/course/${course._id}/sections`)}
                            >
                              <i className="fas fa-edit me-2"></i>
                              Manage Course
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => navigate(`/teacher/course/${course._id}/edit`)}
                            >
                              <i className="fas fa-cog me-2"></i>
                              Edit Details
                            </button>
                          </div>
                        ) : (
                          <div className="d-grid gap-2">
                            {progress === 100 ? (
                              <Link to={`/student/certificate/${course._id}`} className="w-100">
                                <button className="btn btn-success w-100">
                                  <i className="fas fa-certificate me-2"></i>
                                  View Certificate
                                </button>
                              </Link>
                            ) : (
                              <Link to={`/student/course/${course._id}`} className="w-100">
                                <button className="btn btn-primary w-100">
                                  {progress > 0 ? (
                                    <span>
                                      <i className="fas fa-play me-2"></i>
                                      Continue Learning
                                    </span>
                                  ) : (
                                    <span>
                                      <i className="fas fa-play me-2"></i>
                                      Start Learning
                                    </span>
                                  )}
                                </button>
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses; 