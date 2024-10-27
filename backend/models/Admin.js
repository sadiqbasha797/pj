const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  role  : {type:String, default: "admin"}
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
