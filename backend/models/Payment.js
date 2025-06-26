const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    ref: 'Enrollment'
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: 'Course enrollment payment'
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ studentID: 1, courseID: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

// Virtual for payment status
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Virtual for refund status
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded';
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema); 