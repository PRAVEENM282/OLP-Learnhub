const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadDir;
    
    // Create subdirectories based on file type
    if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(uploadDir, 'thumbnails');
    } else if (file.fieldname === 'video') {
      uploadPath = path.join(uploadDir, 'videos');
    } else if (file.fieldname === 'certificate') {
      uploadPath = path.join(uploadDir, 'certificates');
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadDir, 'avatars');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  // Allow videos
  else if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  }
  // Allow PDFs
  else if (file.mimetype === 'application/pdf') {
    cb(null, true);
  }
  // Reject other file types
  else {
    cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  }
});

// Specific upload configurations
const uploadThumbnail = upload.single('thumbnail');
const uploadVideo = upload.single('video');
const uploadAvatar = upload.single('avatar');
const uploadCertificate = upload.single('certificate');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadThumbnail,
  uploadVideo,
  uploadAvatar,
  uploadCertificate,
  handleUploadError
}; 