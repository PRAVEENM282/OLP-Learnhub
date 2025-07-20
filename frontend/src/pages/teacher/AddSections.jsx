import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AddSections = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    duration: 0,
    videoFile: null,
    videoPreview: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/teacher/course/${courseId}`);
      setCourse(response.data.data);
      setSections(response.data.data.sections || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (e) => {
    const { name, value } = e.target;
    setCurrentSection(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid video file (MP4, WebM, or OGG)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 100MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCurrentSection(prev => ({
      ...prev,
      videoFile: file,
      videoPreview: previewUrl
    }));
  };

  const validateSection = () => {
    const newErrors = {};

    if (!currentSection.title.trim()) {
      newErrors.title = 'Section title is required';
    } else if (currentSection.title.trim().length < 5) {
      newErrors.title = 'Section title must be at least 5 characters';
    }

    if (!currentSection.description.trim()) {
      newErrors.description = 'Section description is required';
    } else if (currentSection.description.trim().length < 20) {
      newErrors.description = 'Section description must be at least 20 characters';
    }

    if (!currentSection.content.trim()) {
      newErrors.content = 'Section content is required';
    } else if (currentSection.content.trim().length < 50) {
      newErrors.content = 'Section content must be at least 50 characters';
    }

    if (currentSection.duration < 0) {
      newErrors.duration = 'Duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    
    if (!validateSection()) return;

    setSaving(true);
    
    try {
      let videoUrl = currentSection.videoUrl;
      
      // Upload video if selected
      if (currentSection.videoFile) {
        try {
          const uploadResponse = await uploadFile(currentSection.videoFile, 'video');
          videoUrl = uploadResponse.url;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload video. Please try again.');
          setSaving(false);
          return;
        }
      }

      // Prepare section data
      const sectionData = {
        title: currentSection.title,
        description: currentSection.description,
        content: currentSection.content,
        videoUrl: videoUrl,
        duration: parseInt(currentSection.duration),
        order: sections.length + 1
      };

      const response = await api.post(`/courses/teacher/course/${courseId}/section`, sectionData);
      
      // Update local state
      setSections(response.data.data.sections);
      
      // Reset form
      setCurrentSection({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        duration: 0,
        videoFile: null,
        videoPreview: null
      });
      
      alert('Section added successfully!');
      
    } catch (error) {
      console.error('Error adding section:', error);
      alert(error.response?.data?.message || 'Failed to add section');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSection = async (sectionIndex) => {
    if (!window.confirm('Are you sure you want to remove this section?')) {
      return;
    }

    try {
      // Remove section from local state
      const updatedSections = sections.filter((_, index) => index !== sectionIndex);
      setSections(updatedSections);
      
      // Update course with new sections array
      await api.put(`/courses/teacher/course/${courseId}`, { sections: updatedSections });
      
      alert('Section removed successfully!');
    } catch (error) {
      console.error('Error removing section:', error);
      alert('Failed to remove section');
      // Reload sections if error occurs
      fetchCourse();
    }
  };

  const handlePublishCourse = async () => {
    if (sections.length === 0) {
      alert('Please add at least one section before publishing');
      return;
    }

    try {
      await api.put(`/courses/teacher/course/${courseId}`, { isPublished: true });
      alert('Course published successfully!');
      navigate('/teacher/courses');
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('Failed to publish course');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
          <h1 className="h2 mb-2">Add Course Sections</h1>
          <p className="text-muted">
            {course.C_title} - {sections.length} sections
          </p>
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

      <div className="row">
        {/* Add Section Form */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Add New Section</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddSection}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Section Title</label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        value={currentSection.title}
                        onChange={handleSectionChange}
                        placeholder="Enter section title"
                      />
                      {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                      <input
                        type="number"
                        className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
                        id="duration"
                        name="duration"
                        value={currentSection.duration}
                        onChange={handleSectionChange}
                        min="0"
                      />
                      {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows="3"
                    value={currentSection.description}
                    onChange={handleSectionChange}
                    placeholder="Brief description of this section"
                  ></textarea>
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Content</label>
                  <textarea
                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                    id="content"
                    name="content"
                    rows="6"
                    value={currentSection.content}
                    onChange={handleSectionChange}
                    placeholder="Detailed content for this section..."
                  ></textarea>
                  {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="videoUrl" className="form-label">Video URL (optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="videoUrl"
                    name="videoUrl"
                    value={currentSection.videoUrl}
                    onChange={handleSectionChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="videoFile" className="form-label">Or Upload Video File</label>
                  <input
                    type="file"
                    className="form-control"
                    id="videoFile"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                  <small className="text-muted">
                    Supported formats: MP4, WebM, OGG (max 100MB)
                  </small>
                </div>

                {currentSection.videoPreview && (
                  <div className="mb-3">
                    <label className="form-label">Video Preview</label>
                    <video
                      controls
                      className="w-100"
                      style={{ maxHeight: '200px' }}
                    >
                      <source src={currentSection.videoPreview} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Add Section
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handlePublishCourse}
                    disabled={sections.length === 0}
                  >
                    <i className="fas fa-globe me-2"></i>
                    Publish Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Course Sections ({sections.length})</h5>
            </div>
            <div className="card-body">
              {sections.length === 0 ? (
                <p className="text-muted text-center py-3">
                  No sections added yet. Add your first section to get started.
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {sections.map((section, index) => (
                    <div key={section._id || index} className="list-group-item d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Section {index + 1}: {section.title}</h6>
                        <p className="mb-1 text-muted small">{section.description}</p>
                        <small className="text-muted">
                          {formatDuration(section.duration || 0)}
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveSection(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSections; 