import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, uploadFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

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
      const response = await coursesAPI.getCourse(courseId);
      setCourse(response.data.data);
      setSections(response.data.data.sections || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
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
      toast.error('Please select a valid video file (MP4, WebM, or OGG)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 100MB');
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
          toast.error('Failed to upload video. Please try again.');
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

      const response = await coursesAPI.addSection(courseId, sectionData);
      
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
      
      toast.success('Section added successfully!');
      
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error(error.response?.data?.message || 'Failed to add section');
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
      await coursesAPI.updateCourse(courseId, { sections: updatedSections });
      
      toast.success('Section removed successfully!');
    } catch (error) {
      console.error('Error removing section:', error);
      toast.error('Failed to remove section');
      // Reload sections if error occurs
      fetchCourse();
    }
  };

  const handlePublishCourse = async () => {
    if (sections.length === 0) {
      toast.error('Please add at least one section before publishing');
      return;
    }

    try {
      await coursesAPI.updateCourse(courseId, { 
        isPublished: true,
        status: 'published'
      });
      
      toast.success('Course published successfully!');
      navigate('/teacher/courses');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Failed to publish course');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading course details..." />;
  }

  if (!course) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Course Not Found</Alert.Heading>
          <p>The course you're looking for doesn't exist or you don't have permission to access it.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Add Sections - {course.C_title} - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">Add Course Sections</h1>
            <p className="lead text-muted">
              Build your course content by adding sections with videos and materials
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            {/* Course Info */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={course.C_thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=60&fit=crop'}
                    alt={course.C_title}
                    className="rounded me-3"
                    style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 className="fw-bold mb-1">{course.C_title}</h4>
                    <p className="text-muted mb-0">by {course.C_educator}</p>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <Badge bg="primary">{course.C_level}</Badge>
                  <Badge bg="secondary">{sections.length} sections</Badge>
                  <Badge bg={course.isPublished ? 'success' : 'warning'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </Card.Body>
            </Card>

            {/* Add Section Form */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">
                  <i className="fas fa-plus-circle me-2 text-primary"></i>
                  Add New Section
                </h4>
                
                <Form onSubmit={handleAddSection}>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Section Title *</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={currentSection.title}
                          onChange={handleSectionChange}
                          placeholder="Enter section title"
                          isInvalid={!!errors.title}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.title}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Duration (minutes)</Form.Label>
                        <Form.Control
                          type="number"
                          name="duration"
                          value={currentSection.duration}
                          onChange={handleSectionChange}
                          min="0"
                          placeholder="0"
                          isInvalid={!!errors.duration}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.duration}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Section Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="description"
                      value={currentSection.description}
                      onChange={handleSectionChange}
                      placeholder="Brief description of what this section covers"
                      isInvalid={!!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Section Content *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="content"
                      value={currentSection.content}
                      onChange={handleSectionChange}
                      placeholder="Detailed content, notes, or instructions for this section"
                      isInvalid={!!errors.content}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.content}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Video Upload</Form.Label>
                    <Form.Control
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Supported formats: MP4, WebM, OGG. Max size: 100MB
                    </Form.Text>
                    
                    {currentSection.videoPreview && (
                      <div className="mt-3">
                        <video
                          src={currentSection.videoPreview}
                          controls
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Video URL (Alternative)</Form.Label>
                    <Form.Control
                      type="url"
                      name="videoUrl"
                      value={currentSection.videoUrl}
                      onChange={handleSectionChange}
                      placeholder="https://example.com/video.mp4"
                    />
                    <Form.Text className="text-muted">
                      Use this if you prefer to host videos externally
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding Section...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Section
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => {
                        setCurrentSection({
                          title: '',
                          description: '',
                          content: '',
                          videoUrl: '',
                          duration: 0,
                          videoFile: null,
                          videoPreview: null
                        });
                      }}
                    >
                      Clear Form
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Course Sections List */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-list me-2 text-primary"></i>
                  Course Sections ({sections.length})
                </h5>
                
                {sections.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-folder-open text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0">No sections added yet</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {sections.map((section, index) => (
                      <ListGroup.Item key={index} className="border-0 px-0 py-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{section.title}</h6>
                            <p className="text-muted small mb-1">{section.description}</p>
                            <div className="d-flex gap-2">
                              {section.duration > 0 && (
                                <Badge bg="light" text="dark" className="small">
                                  {formatDuration(section.duration)}
                                </Badge>
                              )}
                              {section.videoUrl && (
                                <Badge bg="success" className="small">
                                  <i className="fas fa-video me-1"></i>
                                  Video
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveSection(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Actions</h5>
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    onClick={handlePublishCourse}
                    disabled={sections.length === 0}
                  >
                    <i className="fas fa-globe me-2"></i>
                    Publish Course
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/teacher/course/${courseId}/edit`)}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Course Details
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/teacher/courses')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to My Courses
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AddSections; 