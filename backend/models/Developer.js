const mongoose = require('mongoose');

const DeveloperSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: [{ type: String }],
  experience: { type: String },
  resume: { type: String },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: "developer" },
  image: { type: String },
  resetPasswordOTP: {
    code: String,
    expiresAt: Date
  }
});

const Developer = mongoose.model('Developer', DeveloperSchema);

module.exports = Developer;
