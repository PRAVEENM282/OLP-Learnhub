import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: null,
    avatarPreview: user?.avatar || null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: null,
        avatarPreview: user.avatar || null
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
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
        avatar: file,
        avatarPreview: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    
    try {
      let avatarUrl = formData.avatarPreview;
      
      // Upload avatar if selected
      if (formData.avatar) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.avatar);
        formDataUpload.append('type', 'avatar');
        const uploadResponse = await api.post('/upload', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        avatarUrl = uploadResponse.data.data.url;
      }

      // Update profile
      const profileData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        avatar: avatarUrl
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        alert('Profile updated successfully!');
      } else {
        alert(result.error || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Profile</h1>
          <p className="text-muted">
            Manage your account information and preferences
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Profile Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Avatar Section */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="avatar mb-3">
                        {formData.avatarPreview ? (
                          <img
                            src={formData.avatarPreview}
                            alt="Profile"
                            className="rounded-circle"
                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto"
                               style={{ width: '120px', height: '120px' }}>
                            <span className="text-white fw-bold" style={{ fontSize: '3rem' }}>
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <small className="text-muted">
                        Recommended: 200x200px, max 5MB
                      </small>
                    </div>
                  </div>
                  <div className="col-md-9">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Full Name</label>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                          />
                          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                          />
                          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="bio" className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                  </div>
                </div>

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
                    onClick={() => navigate(-1)}
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
              <h6 className="mb-0">Account Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Account Type</small>
                <div className="fw-bold text-capitalize">{user?.type}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Member Since</small>
                <div className="fw-bold">{new Date(user?.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mb-0">
                <small className="text-muted">Last Updated</small>
                <div className="fw-bold">{new Date(user?.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate('/settings')}
                >
                  <i className="fas fa-cog me-2"></i>
                  Settings
                </button>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => navigate('/notifications')}
                >
                  <i className="fas fa-bell me-2"></i>
                  Notifications
                </button>
                {user?.type === 'student' && (
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate('/student/certificates')}
                  >
                    <i className="fas fa-certificate me-2"></i>
                    My Certificates
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 