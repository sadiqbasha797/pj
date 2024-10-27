const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Developer = require('../models/Developer');
const Manager = require('../models/Manager');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const CalendarEvent = require('../models/calendarEvent');
const Holiday = require('../models/Holiday');
const { createNotification, notifyCreation, notifyUpdate, leaveUpdateNotification, leaveNotification } = require('../utils/notificationHelper'); // Adjust the path as necessary

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

//calendar api's
const addEvent = async (req, res) => {
    const { title, description, eventDate, participants, eventType, projectId, location, time } = req.body;
    const createdBy = req.admin ? req.admin._id : req.manager._id;
    const onModel = req.admin ? 'Admin' : 'Manager';

    try {
        const newEvent = new CalendarEvent({
            title,
            description,
            eventDate,
            createdBy,
            onModel: onModel, 
            participants,
            eventType,
            projectId,
            location,
            time
        });
  
        await newEvent.save();
        
        // Handle participants for notifications and emails
        if (participants && participants.length > 0) {
            const participantIds = participants.map(part => part.participantId);
            await notifyCreation(participantIds, 'Event', title, newEvent._id);
            
            const participantUsers = await Developer.find({ '_id': { $in: participantIds } });
            const emails = participantUsers.map(user => user.email);
            const mailOptions = {
                from: 'khanbasha7777777@gmail.com',
                to: emails.join(", "),
                subject: `New Event: ${title}`,
                text: `You are invited to the event: ${title}
Description: ${description}
Date: ${eventDate}
Time: ${time}
Location: ${location || 'N/A'}`
            };
            await transporter.sendMail(mailOptions);
        } else {
            // If no participants, send a notification with a null recipient
            await notifyCreation(null, 'Event', title, newEvent._id);
        }

        res.status(201).json({ message: 'Event added successfully and emails sent', event: newEvent });
    } catch (error) {
        console.error("Failed to add event or send emails:", error);
        res.status(500).json({ message: 'Error adding event or sending emails', error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const updates = req.body;

        const originalEvent = await CalendarEvent.findById(eventId);
        if (!originalEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const updatedEvent = await CalendarEvent.findByIdAndUpdate(eventId, updates, { new: true });

        const assignedTo = updatedEvent.participants;
        const participantIds = assignedTo.map(participant => participant.participantId);

        // Check what fields have been updated
        const updatedFields = [];
        if (updates.eventDate !== originalEvent.eventDate) updatedFields.push('Date');
        if (updates.location !== originalEvent.location) updatedFields.push('Location');
        if (updates.time !== originalEvent.time) updatedFields.push('Time');
        if (JSON.stringify(updates.participants) !== JSON.stringify(originalEvent.participants)) updatedFields.push('Participants');

        if (updatedFields.length > 0) {
            const participantUsers = await Developer.find({ '_id': { $in: participantIds } });
            const emails = participantUsers.map(user => user.email);
            
            const mailOptions = {
                from: 'khanbasha7777777@gmail.com',
                to: emails.join(", "),
                subject: `Event Update: ${updatedEvent.title}`,
                text: `The event "${updatedEvent.title}" has been updated.
Updated fields: ${updatedFields.join(', ')}
Current details:
Date: ${updatedEvent.eventDate}
Time: ${updatedEvent.time}
Location: ${updatedEvent.location || 'N/A'}
Description: ${updatedEvent.description}`
            };
            
            await transporter.sendMail(mailOptions);

            // Create notifications for updated details
            const notificationMessage = `Event "${updatedEvent.title}" has been updated. Updated fields: ${updatedFields.join(', ')}. Please check your email for details.`;
            await Promise.all(participantIds.map(participantId => 
                createNotification(participantId, 'Event Update', notificationMessage, updatedEvent._id)
            ));
        }

        await notifyUpdate(participantIds, 'Event', updatedEvent.title, updatedEvent._id);

        if (updatedEvent.eventType === 'Project Deadline' && updatedEvent.projectId) {
            const projectUpdates = {
                deadline: updates.eventDate,  
                description: updates.description,
                title: updates.title
            };

            const updatedProject = await Project.findByIdAndUpdate(updatedEvent.projectId, projectUpdates, { new: true });
            if (!updatedProject) {
                return res.status(404).json({ message: 'Related project not found' });
            }
        }

        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
      const eventId = req.params.eventId;
  
      const eventToDelete = await CalendarEvent.findById(eventId);
      if (!eventToDelete) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      if (eventToDelete.eventType === 'Project Deadline' && eventToDelete.projectId) {
        // Update the project to remove or flag the deadline as deleted
        await Project.findByIdAndUpdate(eventToDelete.projectId, { deadline: null }); // Setting deadline to null
      }
  
      // Send cancellation emails to participants
      if (eventToDelete.participants && eventToDelete.participants.length > 0) {
        const participantIds = eventToDelete.participants.map(part => part.participantId);
        const participantUsers = await Developer.find({ '_id': { $in: participantIds } });
        const emails = participantUsers.map(user => user.email);
        
        const mailOptions = {
          from: 'khanbasha7777777@gmail.com',
          to: emails.join(", "),
          subject: `Event Cancelled: ${eventToDelete.title}`,
          text: `The event "${eventToDelete.title}" scheduled for ${eventToDelete.eventDate} has been cancelled.`
        };
        
        await transporter.sendMail(mailOptions);

        // Create notifications for event cancellation
        const notificationMessage = `Event "${eventToDelete.title}" scheduled for ${eventToDelete.eventDate} has been cancelled.`;
        await Promise.all(participantIds.map(participantId => 
            createNotification(participantId, 'Event Cancellation', notificationMessage, eventToDelete._id)
        ));
      }
  
      await CalendarEvent.findByIdAndDelete(eventId);
      res.status(200).json({ message: 'Event deleted successfully and cancellation emails sent' });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
  };
  
  const fetchAllEvents = async (req, res) => {
    try {
      const events = await CalendarEvent.find({});  // Fetch all events
      if (events.length === 0) {
        return res.status(404).json({ message: 'No events found' });
      }
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
  };
  
  const fetchUserEvents = async (req, res) => {
    try {
      const userId = req.admin._id;  
      const userEvents = await CalendarEvent.find({ createdBy: userId }); 
  
      if (userEvents.length === 0) {
        return res.status(404).json({ message: 'No events found created by you' });
      }
      res.status(200).json(userEvents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user events', error: error.message });
    }
  };
  
  //holiday api's
  const approveOrDenyHoliday = async (req, res) => {
    try {
      const holidayId = req.params.holidayId;
      const { status } = req.body;  
  
      if (!['Approved', 'Denied'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Only "Approved" or "Denied" are valid statuses.' });
      }
  
      const holiday = await Holiday.findByIdAndUpdate(holidayId, { status: status }, { new: true });
      if (!holiday) {
        return res.status(404).json({ message: 'Holiday request not found' });
      }
  
      await leaveNotification(holiday.developer, `Your holiday request has been ${status.toLowerCase()}`, holiday._id);
  
      const action = status === 'Approved' ? 'approved' : 'denied';
      res.status(200).json({ message: `Holiday ${action} successfully`, holiday });
    } catch (error) {
      res.status(500).json({ message: `Error ${status.toLowerCase()} holiday`, error: error.message });
    }
  };
  
  
  const updateHoliday = async (req, res) => {
    try {
      const holidayId = req.params.holidayId;
      const updates = req.body;
  
      const updatedHoliday = await Holiday.findByIdAndUpdate(holidayId, updates, { new: true });
      if (!updatedHoliday) {
        return res.status(404).json({ message: 'Holiday request not found' });
      }
      res.status(200).json({ message: 'Holiday updated successfully', holiday: updatedHoliday });
    } catch (error) {
      res.status(500).json({ message: 'Error updating holiday', error: error.message });
    }
  };
  
  const deleteHoliday = async (req, res) => {
    try {
      const holidayId = req.params.holidayId;
  
      const deletedHoliday = await Holiday.findByIdAndDelete(holidayId);
      if (!deletedHoliday) {
        return res.status(404).json({ message: 'Holiday request not found' });
      }
      res.status(200).json({ message: 'Holiday deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting holiday', error: error.message });
    }
  };
  
  module.exports = {
    updateHoliday,
    deleteHoliday,
    approveOrDenyHoliday,
    fetchUserEvents,
    fetchAllEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  }