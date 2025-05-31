const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  salaryOffered: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  vacancies: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: true
  },
  dates: {
    posted: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      required: true
    }
  },
  attachments: [{
    name: String,
    url: String
  }],
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
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema); 