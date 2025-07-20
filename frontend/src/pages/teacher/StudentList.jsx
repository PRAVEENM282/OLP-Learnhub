import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentList = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseStudents();
  }, [courseId]);

  const fetchCourseStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/teacher/course/${courseId}/students`);
      setStudents(response.data.data.students);
      setCourse(response.data.data.course);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressBadge = (progress) => {
    if (progress === 100) return <span className="badge bg-success">Completed</span>;
    if (progress > 0) return <span className="badge bg-warning">In Progress</span>;
    return <span className="badge bg-secondary">Not Started</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner text="Loading students..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Course Students</h1>
          <p className="text-muted">
            {course?.C_title} - {students.length} enrolled students
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{students.length}</h3>
              <p className="text-muted mb-0">Total Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {students.filter(student => student.progress === 100).length}
              </h3>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning mb-1">
                {students.filter(student => student.progress > 0 && student.progress < 100).length}
              </h3>
              <p className="text-muted mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-secondary mb-1">
                {students.filter(student => student.progress === 0).length}
              </h3>
              <p className="text-muted mb-0">Not Started</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Enrolled Students</h5>
            </div>
            <div className="card-body">
              {students.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-users text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted">No students enrolled yet</h5>
                  <p className="text-muted">Students will appear here once they enroll in your course</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Enrolled Date</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Last Accessed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar me-3">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                                     style={{ width: '40px', height: '40px' }}>
                                  <span className="text-white fw-bold">
                                    {student.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="fw-bold">{student.name}</div>
                                <small className="text-muted">Student</small>
                              </div>
                            </div>
                          </td>
                          <td>{student.email}</td>
                          <td>{formatDate(student.enrolledAt)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '100px', height: '6px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <small className="text-muted">{student.progress}%</small>
                            </div>
                          </td>
                          <td>{getProgressBadge(student.progress)}</td>
                          <td>{formatDate(student.lastAccessed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList; 