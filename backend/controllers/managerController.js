const Manager = require('../models/Manager');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Developer = require('../models/Developer');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const Holiday = require('../models/Holiday');
const CalendarEvent = require('../models/calendarEvent');
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

const registerManager = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const newManager = new Manager({
      username,
      email,
      password: hashedPassword
    });
    await newManager.save();
    res.status(201).json({ message: 'Manager registered successfully', manager: newManager });
  } catch (error) {
    res.status(500).json({ message: 'Error registering manager', error });
  }
};

const managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: manager._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Manager logged in', token, manager });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
};

const getManagerProfile = async (req, res) => {
  try {
    const managerId = req.manager.id;
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manager profile', error });
  }
};

const updateManagerProfile = async (req, res) => {
  try {
    const managerId = req.manager.id;
    const updates = req.body;
    const updatedManager = await Manager.findByIdAndUpdate(managerId, updates, { new: true });
    if (!updatedManager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json({ message: 'Manager profile updated', manager: updatedManager });
  } catch (error) {
    res.status(500).json({ message: 'Error updating manager profile', error });
  }
};

const deleteDeveloper = async (req, res) => {
  try {
    const developerId = req.params.developerId;
    const deletedDeveloper = await Developer.findByIdAndDelete(developerId);
    if (!deletedDeveloper) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.status(200).json({ message: 'Developer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting developer', error });
  }
};

const verifyDeveloper = async (req, res) => {
  try {
    const developerId = req.params.developerId;
    const developer = await Developer.findByIdAndUpdate(developerId, { verified: 'yes' }, { new: true });
    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.status(200).json({ message: 'Developer verified successfully', developer });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying developer', error });
  }
};

const getAllDevelopers = async (req, res) => {
  try {
    const developers = await Developer.find({});  // Fetch all developer documents
    res.status(200).json(developers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching developers', error });
  }
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




// Export all controller functions at the end
module.exports = {
  getNonVerifiedDevelopers,
  registerManager,
  verifyDeveloper,
  managerLogin,
  getManagerProfile,
  updateManagerProfile,
  getAllDevelopers,
  deleteDeveloper
};