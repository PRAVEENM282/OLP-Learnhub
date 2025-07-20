import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Certificates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all certificates for student...');
      
      // Get all certificates for the student using the new endpoint
      const response = await api.get('/certificates/student');
      console.log('Certificates response:', response.data);
      
      setCertificates(response.data.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      const response = await api.get(`/certificates/${certificate._id}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  const handleVerify = (certificate) => {
    window.open(`/verify/${certificate.verificationCode}`, '_blank');
  };

  if (loading) {
    return <LoadingSpinner text="Loading certificates..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">My Certificates</h1>
          <p className="text-muted">
            View and download your course completion certificates
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/student/courses')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Courses
          </button>
        </div>
      </div>

      {error ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-certificate text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="text-muted">No Certificates Yet</h3>
                <p className="text-muted mb-4">
                  Complete your courses to earn certificates. Start learning to get your first certificate!
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/student/courses')}
                >
                  <i className="fas fa-play me-2"></i>
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-success mb-1">{certificates.length}</h3>
                  <p className="text-muted mb-0">Total Certificates</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary mb-1">
                    {certificates.filter(cert => cert.grade === 'A' || cert.grade === 'A+').length}
                  </h3>
                  <p className="text-muted mb-0">A Grades</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-info mb-1">
                    {new Date(Math.max(...certificates.map(cert => new Date(cert.completionDate)))).getFullYear()}
                  </h3>
                  <p className="text-muted mb-0">Latest Year</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="row">
            {certificates.map((certificate) => (
              <div key={certificate._id} className="col-lg-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="fas fa-certificate text-success me-2"></i>
                        {certificate.courseID?.C_title}
                      </h5>
                      {certificate.grade && (
                        <span className={`badge ${
                          certificate.grade === 'A+' || certificate.grade === 'A' ? 'bg-success' :
                          certificate.grade === 'B+' || certificate.grade === 'B' ? 'bg-primary' :
                          certificate.grade === 'C+' || certificate.grade === 'C' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {certificate.grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <p className="text-muted mb-1">
                        <i className="fas fa-user me-2"></i>
                        <strong>Instructor:</strong> {certificate.courseID?.C_educator}
                      </p>
                      <p className="text-muted mb-1">
                        <i className="fas fa-calendar me-2"></i>
                        <strong>Completed:</strong> {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted mb-1">
                        <i className="fas fa-hashtag me-2"></i>
                        <strong>Certificate ID:</strong> {certificate.certificateNumber}
                      </p>
                    </div>

                    <div className="certificate-preview mb-3">
                      <div className="text-center">
                        <h6 className="text-primary mb-2">Certificate Preview</h6>
                        <div className="bg-light p-3 rounded">
                          <small className="text-muted">
                            This is to certify that <strong>{user?.name}</strong> has successfully completed the course <strong>{certificate.courseID?.C_title}</strong>
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownload(certificate)}
                      >
                        <i className="fas fa-download me-2"></i>
                        Download PDF
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleVerify(certificate)}
                      >
                        <i className="fas fa-shield-alt me-2"></i>
                        Verify Certificate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Certificates; 