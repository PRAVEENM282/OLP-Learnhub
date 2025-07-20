import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

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
    isPublished: false
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Programming', 'Web Development', 'Data Science', 'Design', 
    'Business', 'Marketing', 'Language', 'Music', 'Photography',
    'Health', 'Fitness', 'Cooking', 'Art', 'Technology'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'C_categories') {
        const updatedCategories = checked
          ? [...formData.C_categories, value]
          : formData.C_categories.filter(cat => cat !== value);
        setFormData(prev => ({ ...prev, C_categories: updatedCategories }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
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
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
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
          const formDataUpload = new FormData();
          formDataUpload.append('file', formData.C_thumbnail);
          formDataUpload.append('type', 'thumbnail');
          const uploadResponse = await api.post('/upload', formDataUpload, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          thumbnailUrl = uploadResponse.data.data.url;
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          alert('Failed to upload thumbnail. Please try again.');
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

      const response = await api.post('/courses/teacher/course', courseData);
      
      alert('Course created successfully!');
      navigate(`/teacher/course/${response.data.data._id}/sections`);
      
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Creating course..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Create New Course</h1>
          <p className="text-muted">
            Share your knowledge and create an engaging learning experience
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
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Course Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <h6 className="mb-3">Basic Information</h6>
                
                <div className="mb-3">
                  <label htmlFor="C_title" className="form-label">Course Title</label>
                  <input
                    type="text"
                    className={`form-control ${errors.C_title ? 'is-invalid' : ''}`}
                    id="C_title"
                    name="C_title"
                    value={formData.C_title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                  />
                  {errors.C_title && <div className="invalid-feedback">{errors.C_title}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="C_description" className="form-label">Description</label>
                  <textarea
                    className={`form-control ${errors.C_description ? 'is-invalid' : ''}`}
                    id="C_description"
                    name="C_description"
                    rows="4"
                    value={formData.C_description}
                    onChange={handleChange}
                    placeholder="Describe what students will learn in this course"
                  ></textarea>
                  {errors.C_description && <div className="invalid-feedback">{errors.C_description}</div>}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="C_educator" className="form-label">Educator Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors.C_educator ? 'is-invalid' : ''}`}
                        id="C_educator"
                        name="C_educator"
                        value={formData.C_educator}
                        onChange={handleChange}
                        placeholder="Your name"
                      />
                      {errors.C_educator && <div className="invalid-feedback">{errors.C_educator}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="C_price" className="form-label">Price ($)</label>
                      <input
                        type="number"
                        className={`form-control ${errors.C_price ? 'is-invalid' : ''}`}
                        id="C_price"
                        name="C_price"
                        value={formData.C_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      {errors.C_price && <div className="invalid-feedback">{errors.C_price}</div>}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="C_level" className="form-label">Level</label>
                      <select
                        className="form-select"
                        id="C_level"
                        name="C_level"
                        value={formData.C_level}
                        onChange={handleChange}
                      >
                        {levels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="C_thumbnail" className="form-label">Thumbnail</label>
                      <input
                        type="file"
                        className="form-control"
                        id="C_thumbnail"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <small className="text-muted">
                        Recommended size: 1280x720px, max 5MB
                      </small>
                    </div>
                  </div>
                </div>

                {formData.C_thumbnailPreview && (
                  <div className="mb-3">
                    <label className="form-label">Thumbnail Preview</label>
                    <img
                      src={formData.C_thumbnailPreview}
                      alt="Thumbnail preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Categories</label>
                  <div className="row">
                    {categories.map(category => (
                      <div key={category} className="col-md-4 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`category-${category}`}
                            name="C_categories"
                            value={category}
                            checked={formData.C_categories.includes(category)}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`category-${category}`}>
                            {category}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.C_categories && <div className="text-danger small">{errors.C_categories}</div>}
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isPublished">
                      Publish course immediately
                    </label>
                  </div>
                  <small className="text-muted">
                    Published courses are visible to students. You can always edit this later.
                  </small>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || uploading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Create Course
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
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Course Creation Tips</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  <small>Write a clear, compelling title</small>
                </li>
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  <small>Use detailed descriptions</small>
                </li>
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  <small>Choose relevant categories</small>
                </li>
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  <small>Add high-quality thumbnails</small>
                </li>
                <li className="mb-0">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  <small>Set appropriate pricing</small>
                </li>
              </ul>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Next Steps</h6>
            </div>
            <div className="card-body">
              <ol className="mb-0">
                <li className="mb-2">
                  <small>Create your course</small>
                </li>
                <li className="mb-2">
                  <small>Add course sections</small>
                </li>
                <li className="mb-2">
                  <small>Upload video content</small>
                </li>
                <li className="mb-0">
                  <small>Publish and share</small>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse; 