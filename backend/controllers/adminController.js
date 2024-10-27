const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Developer = require('../models/Developer');
const Manager = require('../models/Manager');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const CalendarEvent = require('../models/calendarEvent');
const Holiday = require('../models/Holiday');
const { createNotification,notifyCreation,notifyUpdate,leaveUpdateNotification,leaveNotification } = require('../utils/notificationHelper'); // Adjust the path as necessary

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com',
        pass: 'hpdi qrqk plrn blzz'
    }
});

const sendEmailToDevelopers = async (developerEmails, projectDetails) => {
  // Creating a string with all related document links formatted as a list
  const relatedDocsLinks = projectDetails.relatedDocs.map((doc, index) => `${index + 1}: ${doc}`).join("\n");

  const mailOptions = {
      from: 'khanbasha7777777@gmail.com',
      to: developerEmails.join(", "), // Sending email to multiple recipients
      subject: `Assigned to a New Project: ${projectDetails.title}`,
      text: `You have been assigned to a new project: ${projectDetails.title}
Description: ${projectDetails.description}
Deadline: ${projectDetails.deadline.toDateString()}
Related Documents: 
${relatedDocsLinks}` // Adding related documents links to the email body
  };

  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log('Error sending email:', error);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
};

//user management apis
const registerAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword
    });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Admin logged in', token, admin });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const adminid = req.admin.id;
    const admin = await Admin.findById(adminid);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin profile', error });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const adminid = req.admin.id
    const updates = req.body;
    const admin = await Admin.findByIdAndUpdate(adminid, updates, { new: true });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Admin profile updated', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin profile', error });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminid = req.admin.id;
    const admin = await Admin.findByIdAndDelete(adminid);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error });
  }
};


// Operations on Developers and Managers
const getAllDevelopers = async (req, res) => {
  const developers = await Developer.find({});
  res.status(200).json(developers);
};

const getAllManagers = async (req, res) => {
  const managers = await Manager.find({});
  res.status(200).json(managers);
};

const deleteDeveloper = async (req, res) => {
  const deletedDeveloper = await Developer.findByIdAndDelete(req.params.developerId);
  if (!deletedDeveloper) {
    return res.status(404).json({ message: 'Developer not found' });
  }
  res.status(200).json({ message: 'Developer deleted successfully' });
};

const deleteManager = async (req, res) => {
  const deletedManager = await Manager.findByIdAndDelete(req.params.managerId);
  if (!deletedManager) {
    return res.status(404).json({ message: 'Manager not found' });
  }
  res.status(200).json({ message: 'Manager deleted successfully' });
};

const updateDeveloper = async (req, res) => {
  const updatedDeveloper = await Developer.findByIdAndUpdate(req.params.developerId, req.body, { new: true });
  if (!updatedDeveloper) {
    return res.status(404).json({ message: 'Developer not found' });
  }
  res.status(200).json({ message: 'Developer updated successfully', updatedDeveloper });
};

const updateManager = async (req, res) => {
  const updatedManager = await Manager.findByIdAndUpdate(req.params.managerId, req.body, { new: true });
  if (!updatedManager) {
    return res.status(404).json({ message: 'Manager not found' });
  }
  res.status(200).json({ message: 'Manager updated successfully', updatedManager });
};

const verifyDeveloper = async (req, res) => {
  const developer = await Developer.findByIdAndUpdate(req.params.developerId, { verified: 'yes' }, { new: true });
  if (!developer) {
    return res.status(404).json({ message: 'Developer not found' });
  }
  res.status(200).json({ message: 'Developer verified', developer });
};

const  getNonVerifiedDevelopers = async (req, res) => {
  try {
    const nonVerifiedDevelopers = await Developer.find({ verified: 'no' });
    if (!nonVerifiedDevelopers.length) {
      return res.status(404).json({ message: 'No non-verified developers found' });
    }
    res.status(200).json(nonVerifiedDevelopers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching non-verified developers', error });
  }
};

//project management apis



// Export all functions
module.exports = {
 
  sendEmailToDevelopers,
  getNonVerifiedDevelopers,
  registerAdmin,
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  deleteAdmin,
  getAllDevelopers,
  getAllManagers,
  deleteDeveloper,
  deleteManager,
  updateDeveloper,
  updateManager,
  verifyDeveloper
};