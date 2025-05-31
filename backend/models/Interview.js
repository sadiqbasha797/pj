const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  candidate: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    name: String,
    email: String
  },
  interviewDate: {
    type: Date,
    required: true
  },
  interviewStatus: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  interviewLink: {
    type: String
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
  }],
  feedback: {
    rating: Number,
    comments: String,
    technicalScore: Number,
    communicationScore: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema); 