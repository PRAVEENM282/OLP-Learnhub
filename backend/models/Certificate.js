const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  enrollmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Enrollment ID is required']
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  dateIssued: {
    type: Date,
    default: Date.now
  },
  certificateURL: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    default: 'A'
  },
  completionDate: {
    type: Date,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Generate certificate number
certificateSchema.pre('save', function(next) {
  if (!this.certificateNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.certificateNumber = `CERT-${timestamp}-${random}`;
  }
  
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  
  next();
});

// Virtual for certificate URL
certificateSchema.virtual('downloadURL').get(function() {
  return `/api/certificates/${this._id}/download`;
});

// Ensure virtual fields are serialized
certificateSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Certificate', certificateSchema); 