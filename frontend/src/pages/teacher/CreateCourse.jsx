import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, uploadFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    C_title: '',
    C_description: '',
    C_educator: user?.name || '',
    C_price: 0,
    C_level: 'beginner',
    C_categories: [],
    C_thumbnail: null,
    C_thumbnailPreview: null,
    status: 'draft'
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'programming', 'web-development', 'data-science', 'design', 
    'business', 'marketing', 'language', 'music', 'photography',
    'health', 'fitness', 'cooking', 'art', 'technology'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'C_categories') {
        const updatedCategories = checked
          ? [...formData.C_categories, value]
          : formData.C_categories.filter(cat => cat !== value);
        setFormData(prev => ({ ...prev, C_categories: updatedCategories }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        C_thumbnail: file,
        C_thumbnailPreview: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.C_title.trim()) {
      newErrors.C_title = 'Course title is required';
    } else if (formData.C_title.trim().length < 10) {
      newErrors.C_title = 'Course title must be at least 10 characters';
    }

    if (!formData.C_description.trim()) {
      newErrors.C_description = 'Course description is required';
    } else if (formData.C_description.trim().length < 50) {
      newErrors.C_description = 'Course description must be at least 50 characters';
    }

    if (!formData.C_educator.trim()) {
      newErrors.C_educator = 'Educator name is required';
    }

    if (formData.C_price < 0) {
      newErrors.C_price = 'Price cannot be negative';
    }

    if (formData.C_categories.length === 0) {
      newErrors.C_categories = 'Please select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let thumbnailUrl = null;
      
      // Upload thumbnail if selected
      if (formData.C_thumbnail) {
        setUploading(true);
        try {
          const uploadResponse = await uploadFile(formData.C_thumbnail, 'thumbnail');
          thumbnailUrl = uploadResponse.url;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload thumbnail. Please try again.');
          setUploading(false);
          setLoading(false);
          return;
        }
        setUploading(false);
      }

      // Prepare course data
      const courseData = {
        ...formData,
        C_thumbnail: thumbnailUrl,
        C_price: parseFloat(formData.C_price)
      };

      // Remove file object from data
      delete courseData.C_thumbnailPreview;

      const response = await coursesAPI.createCourse(courseData);
      
      toast.success('Course created successfully!');
      navigate(`/teacher/course/${response.data.data._id}/sections`);
      
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Course - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">Create New Course</h1>
            <p className="lead text-muted">
              Share your knowledge and create an engaging learning experience
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <h4 className="fw-bold mb-4">Basic Information</h4>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Course Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="C_title"
                      value={formData.C_title}
                      onChange={handleChange}
                      placeholder="Enter a compelling course title"
                      isInvalid={!!errors.C_title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.C_title}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Make it engaging and descriptive (10-100 characters)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Course Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="C_description"
                      value={formData.C_description}
                      onChange={handleChange}
                      placeholder="Describe what students will learn in this course"
                      isInvalid={!!errors.C_description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.C_description}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Provide a detailed overview of the course content and objectives
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Educator Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="C_educator"
                          value={formData.C_educator}
                          onChange={handleChange}
                          placeholder="Your name or teaching alias"
                          isInvalid={!!errors.C_educator}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.C_educator}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Course Price ($)</Form.Label>
                        <Form.Control
                          type="number"
                          name="C_price"
                          value={formData.C_price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          isInvalid={!!errors.C_price}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.C_price}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Set to 0 for free courses
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Difficulty Level</Form.Label>
                        <Form.Select
                          name="C_level"
                          value={formData.C_level}
                          onChange={handleChange}
                        >
                          {levels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Draft courses are not visible to students
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Categories */}
                  <Form.Group className="mb-4">
                    <Form.Label>Categories *</Form.Label>
                    <div className="row">
                      {categories.map(category => (
                        <Col key={category} md={4} sm={6} className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={category}
                            name="C_categories"
                            value={category}
                            checked={formData.C_categories.includes(category)}
                            onChange={handleChange}
                            label={category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                          />
                        </Col>
                      ))}
                    </div>
                    {errors.C_categories && (
                      <div className="text-danger small">{errors.C_categories}</div>
                    )}
                    <Form.Text className="text-muted">
                      Select relevant categories to help students find your course
                    </Form.Text>
                  </Form.Group>

                  {/* Thumbnail Upload */}
                  <h4 className="fw-bold mb-4">Course Thumbnail</h4>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Course Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Recommended size: 1280x720px. Max file size: 5MB
                    </Form.Text>
                    
                    {formData.C_thumbnailPreview && (
                      <div className="mt-3">
                        <img
                          src={formData.C_thumbnailPreview}
                          alt="Course thumbnail preview"
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </Form.Group>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading || uploading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {uploading ? 'Uploading...' : 'Creating Course...'}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Create Course
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => navigate('/teacher/dashboard')}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Course Creation Tips</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Use clear, descriptive titles
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Write detailed descriptions
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Choose relevant categories
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Upload high-quality thumbnails
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Set appropriate difficulty levels
                  </li>
                </ul>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Next Steps</h5>
                <p className="text-muted small">
                  After creating your course, you'll be able to:
                </p>
                <ul className="list-unstyled small">
                  <li className="mb-1">
                    <i className="fas fa-plus text-primary me-2"></i>
                    Add course sections
                  </li>
                  <li className="mb-1">
                    <i className="fas fa-video text-primary me-2"></i>
                    Upload video content
                  </li>
                  <li className="mb-1">
                    <i className="fas fa-file text-primary me-2"></i>
                    Add downloadable resources
                  </li>
                  <li className="mb-1">
                    <i className="fas fa-users text-primary me-2"></i>
                    Manage enrolled students
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateCourse; 