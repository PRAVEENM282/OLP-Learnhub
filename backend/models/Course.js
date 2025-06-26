const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Section description is required']
  },
  content: {
    type: String,
    required: [true, 'Section content is required']
  },
  videoUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  order: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  C_educator: {
    type: String,
    required: [true, 'Educator name is required'],
    trim: true
  },
  C_categories: [{
    type: String,
    required: [true, 'At least one category is required']
  }],
  C_title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  C_description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  C_price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  C_thumbnail: {
    type: String,
    default: ''
  },
  C_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  C_language: {
    type: String,
    default: 'English'
  },
  sections: [sectionSchema],
  enrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalEnrollments: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  return this.sections.reduce((total, section) => total + section.duration, 0);
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema); 