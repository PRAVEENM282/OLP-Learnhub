import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="text-center">
        <Spinner animation="border" size={size} variant="primary" />
        <p className="mt-2 text-secondary">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 