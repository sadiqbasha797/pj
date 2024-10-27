const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  teamSize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  role  : {type:String, default: "manager"}

});

const Manager = mongoose.model('Manager', ManagerSchema);

module.exports = Manager;
