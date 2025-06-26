import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const MainNavbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isTeacher()) return '/teacher/dashboard';
    if (isStudent()) return '/student/dashboard';
    return '/';
  };

  return (
    <>
      <Helmet>
        <title>Online Learning Platform</title>
      </Helmet>
      
      <Navbar 
        bg="white" 
        expand="lg" 
        className="shadow-sm"
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
            <i className="fas fa-graduation-cap me-2"></i>
            OLP Platform
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => setExpanded(false)}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/courses" 
                className={location.pathname === '/courses' ? 'active' : ''}
                onClick={() => setExpanded(false)}
              >
                Courses
              </Nav.Link>
              {isAuthenticated && (
                <>
                  {isStudent() && (
                    <Nav.Link 
                      as={Link} 
                      to="/student/mycourses" 
                      className={location.pathname.includes('/student/mycourses') ? 'active' : ''}
                      onClick={() => setExpanded(false)}
                    >
                      My Courses
                    </Nav.Link>
                  )}
                  {isTeacher() && (
                    <Nav.Link 
                      as={Link} 
                      to="/teacher/courses" 
                      className={location.pathname.includes('/teacher/courses') ? 'active' : ''}
                      onClick={() => setExpanded(false)}
                    >
                      My Courses
                    </Nav.Link>
                  )}
                  {isAdmin() && (
                    <Nav.Link 
                      as={Link} 
                      to="/admin/users" 
                      className={location.pathname.includes('/admin') ? 'active' : ''}
                      onClick={() => setExpanded(false)}
                    >
                      Admin Panel
                    </Nav.Link>
                  )}
                </>
              )}
            </Nav>
            
            <Nav>
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                    <i className="fas fa-user me-2"></i>
                    {user?.name}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={getDashboardLink()}>
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="fas fa-user-edit me-2"></i>
                      Profile
                    </Dropdown.Item>
                    {isTeacher() && (
                      <Dropdown.Item as={Link} to="/teacher/course/create">
                        <i className="fas fa-plus-circle me-2"></i>
                        Create Course
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item as={Link} to="/settings">
                      <i className="fas fa-cog me-2"></i>
                      Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="d-flex gap-2">
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="outline-primary"
                    onClick={() => setExpanded(false)}
                  >
                    Login
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="primary"
                    onClick={() => setExpanded(false)}
                  >
                    Register
                  </Button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default MainNavbar; 