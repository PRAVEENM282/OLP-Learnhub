import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;

      const response = await api.get('/courses', { params });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Music', 'Photography'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  if (loading) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h1 className="display-4 fw-bold mb-4">
            Welcome to LearnHub
          </h1>
          <p className="lead mb-4">
            Discover thousands of online courses from top instructors around the world.
            Start learning today and advance your career.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/courses" className="btn btn-outline-primary btn-lg">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-3">
          <select
            className="form-select form-select-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <select
            className="form-select form-select-lg"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="row">
        <div className="col-12 mb-4">
          <h2 className="h3">Featured Courses</h2>
        </div>
        {courses.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4 className="text-muted">No courses found</h4>
            <p className="text-muted">Try adjusting your search criteria</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card course-card h-100">
                {course.C_thumbnail && (
                  <img
                    src={course.C_thumbnail}
                    className="card-img-top course-thumbnail"
                    alt={course.C_title}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-primary me-2">
                      {course.C_level}
                    </span>
                    {course.C_categories.map(category => (
                      <span key={category} className="badge bg-secondary me-1">
                        {category}
                      </span>
                    ))}
                  </div>
                  <h5 className="card-title">{course.C_title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {course.C_description.substring(0, 100)}...
                  </p>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        By {course.C_educator}
                      </small>
                      <span className="fw-bold text-primary">
                        ${course.C_price}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn btn-primary w-100"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call to Action */}
      <div className="row mt-5">
        <div className="col-lg-8 mx-auto text-center">
          <div className="card bg-primary text-white">
            <div className="card-body py-5">
              <h3 className="card-title mb-3">Ready to start learning?</h3>
              <p className="card-text mb-4">
                Join thousands of students who are already learning on LearnHub.
                Create your account and start your learning journey today.
              </p>
              <Link to="/register" className="btn btn-light btn-lg">
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 