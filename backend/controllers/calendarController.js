const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Developer = require('../models/Developer');
const Manager = require('../models/Manager');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const CalendarEvent = require('../models/calendarEvent');
const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');
const DigitalMarketingRole = require('../models/digitalMarketingRole');
const ContentCreator = require('../models/contentCreator');
const { createNotification, notifyCreation, notifyUpdate, leaveUpdateNotification, leaveNotification } = require('../utils/notificationHelper'); // Adjust the path as necessary
const Client = require('../models/Client');
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

  transporter.sendMail(mailOptions, function (error, info) {
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
  
  // Add digital marketing, content creator and client roles to possible creators
  const createdBy = req.admin ? req.admin._id : 
                   req.manager ? req.manager._id :
                   req.developer ? req.developer._id :
                   req.marketingUser ? req.marketingUser._id :
                   req.contentCreator ? req.contentCreator._id :
                   req.client._id;

  const onModel = req.admin ? 'Admin' : 
                 req.manager ? 'Manager' : 
                 req.developer ? 'Developer' :
                 req.marketingUser ? 'DigitalMarketingRole' :
                 req.contentCreator ? 'ContentCreator' :
                 'Client';

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
      
      // Create individual notifications for each participant
      for (const participantId of participantIds) {
        const notification = new Notification({
          recipient: participantId,
          content: `New event created: ${title}`,
          type: 'Event',
          relatedId: newEvent._id,
          read: false
        });
        await notification.save();
      }

      // Get all participants based on their model type
      const developerParticipants = await Developer.find({
        '_id': { $in: participantIds }
      });
      const managerParticipants = await Manager.find({
        '_id': { $in: participantIds }
      });
      const clientParticipants = await Client.find({
        '_id': { $in: participantIds }
      });
      const marketingParticipants = await DigitalMarketingRole.find({
        '_id': { $in: participantIds }
      });
      const contentCreatorParticipants = await ContentCreator.find({
        '_id': { $in: participantIds }
      });

      // Combine all participant emails
      const emails = [
        ...developerParticipants.map(dev => dev.email),
        ...managerParticipants.map(mgr => mgr.email),
        ...clientParticipants.map(client => client.email),
        ...marketingParticipants.map(marketing => marketing.email),
        ...contentCreatorParticipants.map(creator => creator.email)
      ];

      if (emails.length > 0) {
        // Create ICS file content if event type is meeting
        let emailAttachments = [];
        if (eventType.toLowerCase() === 'meeting') {
          // Format the date and time properly
          const eventDateTime = new Date(eventDate);
          if (time) {
            const [hours, minutes] = time.split(':');
            eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
          }

          // Format current timestamp
          const now = new Date();
          
          const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//Calendar Event//EN
BEGIN:VEVENT
UID:${newEvent._id}@yourdomain.com
DTSTAMP:${now.toISOString().replace(/[-:.]/g, '').split('T').join('T')}
DTSTART:${eventDateTime.toISOString().replace(/[-:.]/g, '').split('T').join('T')}
SUMMARY:${title}
DESCRIPTION:${description || ''}
LOCATION:${location || 'N/A'}
END:VEVENT
END:VCALENDAR`;

          emailAttachments = [{
            filename: 'meeting.ics',
            content: icsContent,
            contentType: 'text/calendar'
          }];
        }

        const mailOptions = {
          from: 'khanbasha7777777@gmail.com',
          to: emails.join(", "),
          subject: `New Event: ${title}`,
          text: `You are invited to the event: ${title}
Description: ${description}
Date: ${eventDate}
Time: ${time}
Location: ${location || 'N/A'}`,
          attachments: emailAttachments
        };
        
        await transporter.sendMail(mailOptions);
      }
    } else {
      // Create notification with null recipient
      const notification = new Notification({
        recipient: null,
        content: `New event created: ${title}`,
        type: 'Event',
        relatedId: newEvent._id,
        read: false
      });
      await notification.save();
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

    // Check if the user has permission to update the event
    const userId = req.admin?._id || req.manager?._id || req.developer?._id || 
                  req.marketingUser?._id || req.contentCreator?._id || req.client?._id;
    
    if (originalEvent.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(eventId, updates, { new: true });

    // Check if participants exist before processing
    if (updatedEvent.participants && updatedEvent.participants.length > 0) {
      const participantIds = updatedEvent.participants.map(participant => participant.participantId);

      // Check what fields have been updated
      const updatedFields = [];
      if (updates.eventDate !== originalEvent.eventDate) updatedFields.push('Date');
      if (updates.location !== originalEvent.location) updatedFields.push('Location');
      if (updates.time !== originalEvent.time) updatedFields.push('Time');
      if (JSON.stringify(updates.participants) !== JSON.stringify(originalEvent.participants)) updatedFields.push('Participants');

      if (updatedFields.length > 0) {
        const participantUsers = await Developer.find({ '_id': { $in: participantIds } });
        const emails = participantUsers.map(user => user.email);

        if (emails.length > 0) {
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

          // Create individual notifications for each participant
          const notificationMessage = `Event "${updatedEvent.title}" has been updated. Updated fields: ${updatedFields.join(', ')}. Please check your email for details.`;
          for (const participantId of participantIds) {
            const notification = new Notification({
              recipient: participantId,
              content: notificationMessage,
              type: 'Event',
              relatedId: updatedEvent._id,
              read: false
            });
            await notification.save();
          }
        }
      }

      // Create update notifications for each participant
      for (const participantId of participantIds) {
        const notification = new Notification({
          recipient: participantId,
          content: `Event "${updatedEvent.title}" has been updated`,
          type: 'Event',
          relatedId: updatedEvent._id,
          read: false
        });
        await notification.save();
      }
    }

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

    // Check if the user has permission to delete the event
    const userId = req.admin?._id || req.manager?._id || req.developer?._id || 
                  req.marketingUser?._id || req.contentCreator?._id || req.client?._id;
    
    if (eventToDelete.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    if (eventToDelete.eventType === 'Project Deadline' && eventToDelete.projectId) {
      await Project.findByIdAndUpdate(eventToDelete.projectId, { deadline: null });
    }

    // Send cancellation emails to participants
    if (eventToDelete.participants && eventToDelete.participants.length > 0) {
      const participantIds = eventToDelete.participants.map(part => part.participantId);
      
      // Get participants from all possible models
      const developerParticipants = await Developer.find({ '_id': { $in: participantIds } });
      const managerParticipants = await Manager.find({ '_id': { $in: participantIds } });
      const marketingParticipants = await DigitalMarketingRole.find({ '_id': { $in: participantIds } });
      const contentCreatorParticipants = await ContentCreator.find({ '_id': { $in: participantIds } });
      const clientParticipants = await Client.find({ '_id': { $in: participantIds } });

      // Combine all participant emails
      const emails = [
        ...developerParticipants.map(dev => dev.email),
        ...managerParticipants.map(mgr => mgr.email),
        ...marketingParticipants.map(mkt => mkt.email),
        ...contentCreatorParticipants.map(cc => cc.email),
        ...clientParticipants.map(client => client.email)
      ].filter(email => email); // Remove any undefined/null emails

      if (emails.length > 0) {
        const mailOptions = {
          from: 'khanbasha7777777@gmail.com',
          to: emails.join(", "),
          subject: `Event Cancelled: ${eventToDelete.title}`,
          text: `The event "${eventToDelete.title}" scheduled for ${eventToDelete.eventDate} has been cancelled.`
        };

        await transporter.sendMail(mailOptions);
      }

      // Create individual notifications for each participant
      for (const participantId of participantIds) {
        const notification = new Notification({
          recipient: participantId,
          content: `Event "${eventToDelete.title}" scheduled for ${eventToDelete.eventDate} has been cancelled.`,
          type: 'Event',
          relatedId: eventToDelete._id,
          read: false
        });
        await notification.save();
      }
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
    const userId = req.admin?._id || req.manager?._id || req.developer?._id || 
                  req.marketingUser?._id || req.contentCreator?._id || req.client?._id;
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
      return res.status(400).json({ 
        message: 'Invalid status. Only "Approved" or "Denied" are valid statuses.' 
      });
    }

    // Create update object
    const updateData = { status };

    // Add approver details if status is 'Approved'
    if (status === 'Approved') {
      // Determine the approver's role and details
      let approverRole, approverName;
      
      if (req.admin) {
        approverRole = 'admin';
        approverName = req.admin.username;
      } else if (req.hr) {
        approverRole = 'hr';
        approverName = req.hr.name;
      } else if (req.manager) {
        approverRole = 'manager';
        approverName = req.manager.username;
      }
      
      updateData.approvedBy = {
        name: approverName,
        role: approverRole,
        approvedDate: new Date()
      };
    }

    const holiday = await Holiday.findByIdAndUpdate(
      holidayId, 
      updateData,
      { new: true }
    ).populate('developer', 'username email');

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday request not found' });
    }

    // Send email notification to developer
    const mailOptions = {
      from: 'khanbasha7777777@gmail.com',
      to: holiday.developer.email,
      subject: `Holiday Request ${status}`,
      text: `
Dear ${holiday.developer.username},

Your holiday request for ${new Date(holiday.startDate).toLocaleDateString()} to ${new Date(holiday.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.

${status === 'Approved' ? `Approved by: ${updateData.approvedBy.name} (${updateData.approvedBy.role})` : ''}
${holiday.notes ? `Notes: ${holiday.notes}` : ''}

Best regards,
HR Department
      `
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Create notification for the developer
    await createNotification(
      [holiday.developer._id],
      `Your holiday request has been ${status.toLowerCase()}${status === 'Approved' ? ` by ${updateData.approvedBy.name} (${updateData.approvedBy.role})` : ''}`,
      'holiday_status',
      holiday._id
    );

    // Create notification for the approver
    const approverId = req.admin?._id || req.hr?.id || req.manager?._id;
    await createNotification(
      [approverId],
      `Holiday request for ${holiday.developer.username} has been ${status.toLowerCase()}`,
      'holiday_processed',
      holiday._id
    );

    const action = status === 'Approved' ? 'approved' : 'denied';
    res.status(200).json({ 
      message: `Holiday ${action} successfully`, 
      holiday 
    });
  } catch (error) {
    console.error('Error processing holiday request:', error);
    res.status(500).json({ 
      message: `Error processing holiday request`, 
      error: error.message 
    });
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

const getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({})
      .populate('developer', 'username email') // Populate developer details but exclude password
      .sort({ appliedOn: -1 }); // Sort by application date, most recent first

    if (holidays.length === 0) {
      return res.status(404).json({ message: 'No holiday records found' });
    }

    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holidays', error: error.message });
  }
};

const getDeveloperHolidays = async (req, res) => {
  try {
    const developerId = req.params.developerId;

    // Verify developer exists
    const developer = await Developer.findById(developerId);
    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    const holidays = await Holiday.find({ developer: developerId })
      .sort({ appliedOn: -1 }); // Sort by application date, most recent first

    if (holidays.length === 0) {
      return res.status(404).json({ message: 'No holiday records found for this developer' });
    }

    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching developer holidays', error: error.message });
  }
};

const getHolidayById = async (req, res) => {
  try {
    const holidayId = req.params.holidayId;

    const holiday = await Holiday.findById(holidayId)
      .populate('developer', 'username email');

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday record not found' });
    }

    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching holiday record', error: error.message });
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
  getAllHolidays,
  getDeveloperHolidays,
  getHolidayById
}