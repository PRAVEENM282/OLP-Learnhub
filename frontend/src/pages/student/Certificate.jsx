import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

const Certificate = () => {
  return (
    <>
      <Helmet>
        <title>Certificate - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row>
          <Col>
            <h1 className="display-5 fw-bold mb-4">Certificate</h1>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-certificate text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h3>Certificate Page</h3>
                <p className="text-muted">This page will show downloadable completion certificates.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Certificate; 