const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
  candidate: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    name: String,
    email: String
  },
  offerDate: {
    type: Date,
    default: Date.now
  },
  joiningDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  offerDetails: {
    position: String,
    salary: Number,
    benefits: [String],
    location: String
  },
  offerLetterUrl: {
    type: String
  },
  validTill: {
    type: Date,
    required: true
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

module.exports = mongoose.model('OfferLetter', offerLetterSchema); 