import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      console.log('Fetching certificate for courseId:', courseId);
      const response = await api.get(`/enroll/certificate/${courseId}`);
      console.log('Certificate response:', response.data);
      setCertificate(response.data.data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      const errorMessage = error.response?.data?.message || 'Certificate not found';
      console.log('Certificate error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;

    try {
      setDownloading(true);
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
      setError('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const handleVerify = () => {
    if (certificate) {
      window.open(`/verify/${certificate.verificationCode}`, '_blank');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading certificate..." />;
  }

  if (error || !certificate) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="text-danger mb-3">Certificate Not Available</h3>
                <p className="text-muted mb-4">{error}</p>
                
                {error === 'Certificate not yet issued' && (
                  <div className="alert alert-info text-start mb-4">
                    <h6><i className="fas fa-info-circle me-2"></i>How to get your certificate:</h6>
                    <ul className="mb-0">
                      <li>Complete all sections of the course</li>
                      <li>Ensure your progress reaches 100%</li>
                      <li>Mark all sections as complete</li>
                      <li>Return here after completion</li>
                    </ul>
                  </div>
                )}
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/student/course/${courseId}`)}
                  >
                    <i className="fas fa-play me-2"></i>
                    Continue Course
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/student/courses')}
                  >
                    <i className="fas fa-list me-2"></i>
                    Back to My Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Certificate Preview */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="mb-0">Certificate of Completion</h3>
            </div>
            <div className="card-body">
              <div className="certificate-preview">
                <div className="text-center mb-4">
                  <h2 className="text-primary mb-2">LEARNHUB</h2>
                  <p className="text-muted">Online Learning Platform</p>
                </div>
                
                <div className="text-center mb-4">
                  <h1 className="h2 mb-3">Certificate of Completion</h1>
                  <p className="lead">This is to certify that</p>
                  <h3 className="text-primary mb-3">{certificate.studentID?.name}</h3>
                  <p className="lead">has successfully completed the course</p>
                  <h4 className="text-primary mb-3">{certificate.courseID?.C_title}</h4>
                </div>
                
                <div className="row text-center">
                  <div className="col-md-6">
                    <p><strong>Instructor:</strong><br />{certificate.courseID?.C_educator}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Completion Date:</strong><br />
                      {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {certificate.grade && (
                  <div className="text-center mt-3">
                    <span className="badge bg-success fs-6">Grade: {certificate.grade}</span>
                  </div>
                )}
                
                <hr className="my-4" />
                
                <div className="row text-center">
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Certificate ID:</strong><br />
                      {certificate.certificateNumber}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">
                      <strong>Verification Code:</strong><br />
                      {certificate.verificationCode}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Certificate Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Certificate Number:</strong>
                    <p className="text-muted">{certificate.certificateNumber}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Verification Code:</strong>
                    <p className="text-muted">{certificate.verificationCode}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Date Issued:</strong>
                    <p className="text-muted">
                      {new Date(certificate.dateIssued).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Course:</strong>
                    <p className="text-muted">{certificate.courseID?.C_title}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Instructor:</strong>
                    <p className="text-muted">{certificate.courseID?.C_educator}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Grade:</strong>
                    <p className="text-muted">
                      {certificate.grade ? (
                        <span className="badge bg-success">{certificate.grade}</span>
                      ) : (
                        'Not graded'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-2">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download me-2"></i>
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
                <div className="col-md-6 mb-2">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={handleVerify}
                  >
                    <i className="fas fa-shield-alt me-2"></i>
                    Verify Certificate
                  </button>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/student/courses')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to My Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate; 