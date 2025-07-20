import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseProgress();
  }, [courseId]);

  const fetchCourseProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get course progress using the correct endpoint
      const response = await api.get(`/enroll/progress/${courseId}`);
      const data = response.data.data;
      
      console.log('Course progress data:', data); // Debug log
      
      // The backend returns course, enrollment, and sections separately
      setCourse({
        _id: data.course._id,
        C_title: data.course.title,
        sections: data.sections
      });
      setEnrollment(data.enrollment);
      
      // Set first section as current if no current section
      if (data.sections && data.sections.length > 0 && !currentSection) {
        setCurrentSection(data.sections[0]);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
      if (error.response?.status === 404) {
        setError('You are not enrolled in this course. Please enroll first.');
      } else {
        setError('Failed to load course. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section) => {
    setCurrentSection(section);
  };

  const handleCompleteSection = async () => {
    if (!currentSection || !enrollment) return;

    try {
      setCompleting(true);
      
      console.log('Completing section:', {
        courseId,
        sectionId: currentSection._id,
        sectionTitle: currentSection.title
      });
      
      // Mark section as completed using the correct endpoint
      const response = await api.post(`/enroll/progress/${courseId}/section/${currentSection._id}/complete`);
      
      console.log('Section completion response:', response.data);
      
      // Refresh course progress
      await fetchCourseProgress();
      
      // Show success message
      alert('Section marked as complete!');
    } catch (error) {
      console.error('Error completing section:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to mark section as complete. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Section or course not found.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to complete this section.';
      }
      
      alert(errorMessage);
    } finally {
      setCompleting(false);
    }
  };

  const isSectionCompleted = (sectionId) => {
    if (!course || !course.sections) return false;
    
    // Check if the section has isCompleted property from the backend
    const section = course.sections.find(s => s._id === sectionId);
    return section ? section.isCompleted : false;
  };

  const getVideoUrl = (section) => {
    if (!section) return null;
    
    console.log('Section data:', section); // Debug log
    
    // Handle different video URL formats
    if (section.videoUrl) {
      console.log('Original video URL:', section.videoUrl); // Debug log
      
      // If it's a full URL, use it directly
      if (section.videoUrl.startsWith('http')) {
        return section.videoUrl;
      }
      // If it's a relative path, construct the full URL
      const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${section.videoUrl}`;
      console.log('Constructed video URL:', fullUrl); // Debug log
      return fullUrl;
    }
    
    return null;
  };

  const calculateProgress = () => {
    if (!course || !course.sections) return 0;
    
    const totalSections = course.sections.length;
    if (totalSections === 0) return 0;
    
    const completedSections = course.sections.filter(section => 
      section.isCompleted
    ).length;
    
    return Math.round((completedSections / totalSections) * 100);
  };

  if (loading) {
    return <LoadingSpinner text="Loading course..." />;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-danger">Error Loading Course</h2>
          <p className="text-muted">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/student/courses')}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2 className="text-danger">Course Not Found</h2>
          <p className="text-muted">You are not enrolled in this course</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/student/courses')}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const videoUrl = getVideoUrl(currentSection);

  // Check if course has sections
  if (!course.sections || course.sections.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-book text-muted mb-3" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-muted">No Course Content</h2>
          <p className="text-muted">This course doesn't have any sections yet.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/student/courses')}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Video Player */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {currentSection ? currentSection.title : 'Select a section to start'}
                </h4>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/student/courses')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Courses
                </button>
              </div>
            </div>
            <div className="card-body">
              {currentSection && videoUrl ? (
                <div className="video-container mb-3">
                  <video
                    controls
                    className="w-100"
                    style={{ maxHeight: '500px', borderRadius: '8px' }}
                    preload="metadata"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    <source src={videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : currentSection ? (
                <div className="text-center py-5">
                  <div className="bg-light rounded p-4">
                    <i className="fas fa-video text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted">No video content</h5>
                    <p className="text-muted">This section doesn't have video content</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="bg-light rounded p-4">
                    <i className="fas fa-play-circle text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted">Select a section</h5>
                    <p className="text-muted">Choose a section from the sidebar to start learning</p>
                  </div>
                </div>
              )}

              {currentSection && (
                <div className="mt-4">
                  <h5>Section Description</h5>
                  <p className="text-muted">{currentSection.description || 'No description available'}</p>
                  
                  {currentSection.content && (
                    <div className="mt-3">
                      <h5>Content</h5>
                      <div 
                        className="bg-light p-3 rounded"
                        dangerouslySetInnerHTML={{ __html: currentSection.content }}
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    {isSectionCompleted(currentSection._id) ? (
                      <div className="alert alert-success">
                        <i className="fas fa-check-circle me-2"></i>
                        This section has been completed!
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={handleCompleteSection}
                        disabled={completing}
                      >
                        {completing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Marking as Complete...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check me-2"></i>
                            Mark as Complete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Sections Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Course Content</h5>
              <small className="text-muted">
                Progress: {progress}%
              </small>
            </div>
            <div className="card-body p-0">
              <div className="progress rounded-0" style={{ height: '4px' }}>
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="list-group list-group-flush">
                {course.sections?.map((section, index) => (
                  <button
                    key={section._id}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                      currentSection?._id === section._id ? 'active' : ''
                    }`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {isSectionCompleted(section._id) ? (
                          <i className="fas fa-check-circle text-success"></i>
                        ) : (
                          <i className="fas fa-circle text-muted"></i>
                        )}
                      </div>
                      <div className="text-start">
                        <div className="fw-bold">Section {index + 1}</div>
                        <small className="text-muted">{section.title}</small>
                      </div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">
                        {section.duration ? `${section.duration}m` : 'No duration'}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Course Information</h6>
            </div>
            <div className="card-body">
              <h6>{course.C_title}</h6>
              <p className="text-muted small mb-2">by {course.C_educator}</p>
              
              <div className="d-flex justify-content-between mb-2">
                <small className="text-muted">Level:</small>
                <small className="text-capitalize">{course.C_level}</small>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <small className="text-muted">Sections:</small>
                <small>{course.sections?.length || 0}</small>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <small className="text-muted">Enrolled:</small>
                <small>{enrollment ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}</small>
              </div>

              {/* View Certificate Button for Completed Courses */}
              {progress === 100 && (
                <div className="d-grid">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => navigate(`/student/certificate/${courseId}`)}
                  >
                    <i className="fas fa-certificate me-2"></i>
                    View Certificate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer; 