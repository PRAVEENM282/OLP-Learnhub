import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EnrollmentRecords = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/enrollments');
      setEnrollments(response.data.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      alert('Failed to load enrollment records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-success',
      completed: 'bg-primary',
      dropped: 'bg-danger',
      pending: 'bg-warning'
    };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.course?.C_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || enrollment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading enrollment records..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">Enrollment Records</h1>
          <p className="text-muted">
            Monitor all course enrollments, track progress, and analyze student engagement
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin/dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary mb-1">{enrollments.length}</h3>
              <p className="text-muted mb-0">Total Enrollments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success mb-1">
                {enrollments.filter(e => e.status === 'active').length}
              </h3>
              <p className="text-muted mb-0">Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info mb-1">
                {enrollments.filter(e => e.status === 'completed').length}
              </h3>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning mb-1">
                {enrollments.filter(e => e.status === 'pending').length}
              </h3>
              <p className="text-muted mb-0">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by student name or course title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-3">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <button
            className="btn btn-primary w-100"
            onClick={fetchEnrollments}
          >
            <i className="fas fa-refresh me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Enrollment Records ({filteredEnrollments.length})</h5>
            </div>
            <div className="card-body">
              {filteredEnrollments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-graduation-cap text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted">No enrollment records found</h5>
                  <p className="text-muted">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Enrolled Date</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnrollments.map(enrollment => (
                        <tr key={enrollment._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar me-3">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                                     style={{ width: '40px', height: '40px' }}>
                                  <span className="text-white fw-bold">
                                    {enrollment.student?.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="fw-bold">{enrollment.student?.name}</div>
                                <small className="text-muted">{enrollment.student?.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-bold">{enrollment.course?.C_title}</div>
                              <small className="text-muted">by {enrollment.course?.C_educator}</small>
                            </div>
                          </td>
                          <td>{formatDate(enrollment.enrolledAt)}</td>
                          <td>{getStatusBadge(enrollment.status)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '100px', height: '6px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                ></div>
                              </div>
                              <small className="text-muted">{enrollment.progress || 0}%</small>
                            </div>
                          </td>
                          <td>{formatPrice(enrollment.course?.C_price)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/admin/enrollments/${enrollment._id}`)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
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

export default EnrollmentRecords; 