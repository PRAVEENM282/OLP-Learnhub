import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

const StudentList = () => {
  return (
    <>
      <Helmet>
        <title>Student List - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row>
          <Col>
            <h1 className="display-5 fw-bold mb-4">Student List</h1>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-users text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h3>Student List Page</h3>
                <p className="text-muted">This page will show all students enrolled in the teacher's courses.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default StudentList; 