import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { to: '/', label: 'Home' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' }
      ];
    }

    switch (user?.type) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard' },
          { to: '/student/courses', label: 'My Courses' }
        ];
      case 'teacher':
        return [
          { to: '/teacher/dashboard', label: 'Dashboard' },
          { to: '/teacher/courses', label: 'My Courses' },
          { to: '/teacher/course/create', label: 'Create Course' }
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/courses', label: 'Courses' },
          { to: '/admin/enrollments', label: 'Enrollments' }
        ];
      default:
        return [];
    }
  };

  const getProfileMenuItems = () => {
    const baseItems = [
      {
        label: 'Profile',
        icon: 'fas fa-user',
        action: () => navigate('/profile')
      },
      {
        label: 'Settings',
        icon: 'fas fa-cog',
        action: () => navigate('/settings')
      },
      {
        label: 'Notifications',
        icon: 'fas fa-bell',
        action: () => navigate('/notifications')
      }
    ];

    // Add role-specific items
    if (user?.type === 'student') {
      baseItems.push({
        label: 'Certificates',
        icon: 'fas fa-certificate',
        action: () => navigate('/student/certificates')
      });
    } else if (user?.type === 'teacher') {
      baseItems.push({
        label: 'Analytics',
        icon: 'fas fa-chart-line',
        action: () => navigate('/teacher/analytics')
      });
    } else if (user?.type === 'admin') {
      baseItems.push({
        label: 'System Settings',
        icon: 'fas fa-tools',
        action: () => navigate('/admin/settings')
      });
    }

    return baseItems;
  };

  const navLinks = getNavLinks();
  const profileMenuItems = getProfileMenuItems();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-graduation-cap me-2"></i>
          LearnHub
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            {navLinks.map((link) => (
              <li key={link.to} className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div className="avatar me-2">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ width: '32px', height: '32px' }}>
                      <span className="text-primary fw-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span>{user?.name}</span>
                </a>
                <ul className={`dropdown-menu dropdown-menu-end ${isProfileDropdownOpen ? 'show' : ''}`}>
                  <li>
                    <div className="dropdown-header">
                      <div className="fw-bold">{user?.name}</div>
                      <small className="text-muted">{user?.email}</small>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  
                  {profileMenuItems.map((item, index) => (
                    <li key={index}>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          item.action();
                          setIsProfileDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        <i className={`${item.icon} me-2`}></i>
                        {item.label}
                      </button>
                    </li>
                  ))}
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 