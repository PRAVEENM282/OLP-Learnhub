import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form } from 'react-bootstrap';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const EnrollmentRecords = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    status: '',
    dateRange: ''
  });

  useEffect(() => {
    fetchEnrollments();
  }, [filters]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setEnrollments([]);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollment records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      completed: 'primary',
      dropped: 'danger',
      pending: 'warning'
    };
    return <Badge bg={colors[status]}>{status}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading enrollment records..." />;
  }

  return (
    <>
      <Helmet>
        <title>Enrollment Records - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">Enrollment Records</h1>
            <p className="lead text-muted">
              Monitor all course enrollments, track progress, and analyze student engagement
            </p>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-graduation-cap text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h3>Enrollment Records Page</h3>
                <p className="text-muted">
                  This page will show all enrollment records with filtering and analytics.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EnrollmentRecords; 