import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

const EditCourse = () => {
  return (
    <>
      <Helmet>
        <title>Edit Course - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row>
          <Col>
            <h1 className="display-5 fw-bold mb-4">Edit Course</h1>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-edit text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h3>Edit Course Page</h3>
                <p className="text-muted">This page will allow teachers to edit existing courses and content.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EditCourse; 