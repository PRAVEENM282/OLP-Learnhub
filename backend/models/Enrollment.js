const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedSections: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

// Compound index to ensure unique enrollment per student per course
enrollmentSchema.index({ studentID: 1, courseID: 1 }, { unique: true });

// Method to calculate progress
enrollmentSchema.methods.calculateProgress = function(course) {
  if (!course || !course.sections || course.sections.length === 0) {
    return 0;
  }
  
  const totalSections = course.sections.length;
  const completedSections = this.completedSections.length;
  
  return Math.round((completedSections / totalSections) * 100);
};

// Method to mark section as completed
enrollmentSchema.methods.completeSection = function(sectionId) {
  const sectionExists = this.completedSections.find(
    section => section.sectionId.toString() === sectionId.toString()
  );
  
  if (!sectionExists) {
    this.completedSections.push({
      sectionId: sectionId,
      completedAt: new Date()
    });
  }
  
  return this;
};

module.exports = mongoose.model('Enrollment', enrollmentSchema); 