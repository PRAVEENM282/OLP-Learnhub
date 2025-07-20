import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Mock notifications for now - replace with actual API call
      const mockNotifications = [
        {
          id: 1,
          type: 'course_update',
          title: 'Course Updated',
          message: 'JavaScript Fundamentals has been updated with new content',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          courseId: '123'
        },
        {
          id: 2,
          type: 'enrollment',
          title: 'Enrollment Successful',
          message: 'You have successfully enrolled in React Development',
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          courseId: '456'
        },
        {
          id: 3,
          type: 'certificate',
          title: 'Certificate Ready',
          message: 'Your certificate for Python Basics is ready for download',
          read: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          courseId: '789'
        },
        {
          id: 4,
          type: 'system',
          title: 'Welcome to LearnHub',
          message: 'Thank you for joining LearnHub! Start exploring our courses.',
          read: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          courseId: null
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      alert('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Mock API call - replace with actual API call
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mock API call - replace with actual API call
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Mock API call - replace with actual API call
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_update':
        return 'fas fa-book text-primary';
      case 'enrollment':
        return 'fas fa-user-plus text-success';
      case 'certificate':
        return 'fas fa-certificate text-warning';
      case 'system':
        return 'fas fa-info-circle text-info';
      default:
        return 'fas fa-bell text-secondary';
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'course_update':
        return 'bg-primary';
      case 'enrollment':
        return 'bg-success';
      case 'certificate':
        return 'bg-warning';
      case 'system':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Notifications</h1>
          <p className="text-muted">
            Stay updated with your course progress and platform updates
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

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{notifications.length}</h3>
              <p className="text-muted mb-0">Total</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning mb-1">{unreadCount}</h3>
              <p className="text-muted mb-0">Unread</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {notifications.filter(n => n.type === 'course_update').length}
              </h3>
              <p className="text-muted mb-0">Course Updates</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info mb-1">
                {notifications.filter(n => n.type === 'certificate').length}
              </h3>
              <p className="text-muted mb-0">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="course_update">Course Updates</option>
            <option value="enrollment">Enrollments</option>
            <option value="certificate">Certificates</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <i className="fas fa-check-double me-2"></i>
              Mark All as Read
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={fetchNotifications}
            >
              <i className="fas fa-refresh me-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                {filter === 'all' ? 'All Notifications' : 
                 filter === 'unread' ? 'Unread Notifications' :
                 `${filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Notifications`}
                <span className="badge bg-primary ms-2">{filteredNotifications.length}</span>
              </h5>
            </div>
            <div className="card-body">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-bell-slash text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted">No notifications found</h5>
                  <p className="text-muted">
                    {filter === 'all' ? 'You\'re all caught up!' : 
                     filter === 'unread' ? 'No unread notifications' :
                     `No ${filter.replace('_', ' ')} notifications`}
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
                    >
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <i className={`${getNotificationIcon(notification.type)}`} style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">
                                {notification.title}
                                {!notification.read && (
                                  <span className={`badge ${getNotificationBadge(notification.type)} ms-2`}>
                                    New
                                  </span>
                                )}
                              </h6>
                              <p className="mb-1 text-muted">{notification.message}</p>
                              <small className="text-muted">
                                {formatTimeAgo(notification.createdAt)}
                              </small>
                            </div>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </button>
                              <ul className="dropdown-menu">
                                {!notification.read && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <i className="fas fa-check me-2"></i>
                                      Mark as Read
                                    </button>
                                  </li>
                                )}
                                {notification.courseId && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => navigate(`/courses/${notification.courseId}`)}
                                    >
                                      <i className="fas fa-external-link-alt me-2"></i>
                                      View Course
                                    </button>
                                  </li>
                                )}
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    <i className="fas fa-trash me-2"></i>
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default Notifications; 