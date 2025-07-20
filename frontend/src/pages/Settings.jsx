import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [settings, setSettings] = useState({
    emailNotifications: true,
    courseUpdates: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en'
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const validatePasswordChange = () => {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordChange()) return;

    setLoading(true);
    
    try {
      const response = await api.put('/me/password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        alert('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordErrors({});
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/me/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Settings</h1>
          <p className="text-muted">
            Manage your account settings and preferences
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
          {/* Notification Settings */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Notification Settings
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="emailNotifications">
                    Email Notifications
                  </label>
                  <small className="text-muted d-block">
                    Receive important updates via email
                  </small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="courseUpdates"
                    checked={settings.courseUpdates}
                    onChange={(e) => handleSettingChange('courseUpdates', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="courseUpdates">
                    Course Updates
                  </label>
                  <small className="text-muted d-block">
                    Get notified when courses you're enrolled in are updated
                  </small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="marketingEmails"
                    checked={settings.marketingEmails}
                    onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="marketingEmails">
                    Marketing Emails
                  </label>
                  <small className="text-muted d-block">
                    Receive promotional emails and special offers
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-palette me-2"></i>
                Appearance
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="darkMode"
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="darkMode">
                    Dark Mode
                  </label>
                  <small className="text-muted d-block">
                    Switch to dark theme for better viewing in low light
                  </small>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="language" className="form-label">Language</label>
                <select
                  className="form-select"
                  id="language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-lock me-2"></i>
                Change Password
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  {passwordErrors.currentPassword && (
                    <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                  {passwordErrors.newPassword && (
                    <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key me-2"></i>
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveSettings}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Settings
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/profile')}
                >
                  <i className="fas fa-user me-2"></i>
                  Edit Profile
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={() => navigate('/notifications')}
                >
                  <i className="fas fa-bell me-2"></i>
                  Notifications
                </button>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Account Security</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Last Login</small>
                <div className="fw-bold">{new Date().toLocaleDateString()}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Account Status</small>
                <div className="fw-bold text-success">Active</div>
              </div>
              <div className="mb-0">
                <small className="text-muted">Two-Factor Auth</small>
                <div className="fw-bold text-warning">Not Enabled</div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0">Danger Zone</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to deactivate your account?')) {
                      alert('Account deactivation feature coming soon');
                    }
                  }}
                >
                  <i className="fas fa-user-slash me-2"></i>
                  Deactivate Account
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      alert('Account deletion feature coming soon');
                    }
                  }}
                >
                  <i className="fas fa-trash me-2"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 