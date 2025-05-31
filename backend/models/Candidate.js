const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  resume: {
    type: String, // URL to stored resume
    required: true
  },
  education: [{
    degree: String,
    institution: String,
    year: Number,
    grade: String
  }],
  skills: [{
    type: String
  }],
  jobsApplied: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interviewed', 'selected', 'rejected'],
      default: 'pending'
    },
    interviewDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    offerLetter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfferLetter'
    }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  createdBy: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'hr'],
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
candidateSchema.index({ email: 1 });
candidateSchema.index({ 'jobsApplied.status': 1 });
candidateSchema.index({ 'jobsApplied.appliedDate': -1 });

module.exports = mongoose.model('Candidate', candidateSchema); 