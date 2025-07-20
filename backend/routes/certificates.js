const express = require('express');
const router = express.Router();
const { protect, authorizeStudent } = require('../middleware/authMiddleware');
const Certificate = require('../models/Certificate');
const path = require('path');
const fs = require('fs');

// @desc    Get all certificates for student
// @route   GET /api/certificates/student
// @access  Private/Student
const getStudentCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentID: req.user._id })
      .populate('courseID', 'C_title C_educator')
      .sort({ completionDate: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Get student certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('studentID', 'name')
      .populate('courseID', 'C_title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if user is the certificate owner or admin
    if (certificate.studentID._id.toString() !== req.user._id.toString() && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    if (!certificate.certificateURL) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    const filePath = path.join(__dirname, '..', certificate.certificateURL);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found on server'
      });
    }

    res.download(filePath, `certificate_${certificate.certificateNumber}.pdf`);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:code
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      verificationCode: req.params.code 
    }).populate('studentID', 'name')
      .populate('courseID', 'C_title C_educator');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification code'
      });
    }

    res.json({
      success: true,
      data: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentID.name,
        courseTitle: certificate.courseID.C_title,
        instructor: certificate.courseID.C_educator,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        isVerified: certificate.isVerified
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

router.get('/student', protect, authorizeStudent, getStudentCertificates);
router.get('/:id/download', protect, downloadCertificate);
router.get('/verify/:code', verifyCertificate);

module.exports = router; 