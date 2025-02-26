const mongoose = require('mongoose');

const ManagerRequestSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  requestType: {
    type: String,
    enum: ['developer', 'digitalMarketer', 'contentCreator'],
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Dynamic reference based on requestType
    refPath: 'memberModel'
  },
  memberModel: {
    type: String,
    required: true,
    enum: ['Developer', 'DigitalMarketingRole', 'ContentCreator']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  responseDate: Date,
  notes: String
});

const ManagerRequest = mongoose.model('ManagerRequest', ManagerRequestSchema);

module.exports = ManagerRequest;