const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  uploadThumbnail, 
  uploadVideo, 
  uploadAvatar, 
  uploadCertificate,
  handleUploadError 
} = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(protect);

// Upload thumbnail
router.post('/thumbnail', uploadThumbnail, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        url: `/uploads/thumbnails/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// Upload video
router.post('/video', uploadVideo, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        url: `/uploads/videos/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// Upload avatar
router.post('/avatar', uploadAvatar, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        url: `/uploads/avatars/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// Upload certificate
router.post('/certificate', uploadCertificate, handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        url: `/uploads/certificates/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

module.exports = router; 