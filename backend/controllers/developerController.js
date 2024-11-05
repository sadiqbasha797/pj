const Developer = require('../models/Developer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const CalendarEvent = require('../models/calendarEvent');
const Holiday = require('../models/Holiday');
const { createNotification,notifyCreation,notifyUpdate,leaveUpdateNotification,leaveNotification } = require('../utils/notificationHelper'); // Adjust the path as necessary

const registerDeveloper = async (req, res) => {
  try {
    const { username, password, email, skills } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const newDeveloper = new Developer({
      username,
      email,
      password: hashedPassword,
      skills
    });
    await newDeveloper.save();
    res.status(201).json({ message: 'Developer registered successfully', developer: newDeveloper });
  } catch (error) {
    res.status(500).json({ message: 'Error registering developer', error });
  }
};

const verifyDeveloper = async (req, res) => {
  try {
    const developerId = req.params.developerId;
    const developer = await Developer.findByIdAndUpdate(developerId, { verified: 'yes' }, { new: true });
    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.status(200).json({ message: 'Developer verified', developer });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying developer', error });
  }
};

const developerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const developer = await Developer.findOne({ email });

    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }
   
    const isMatch = await bcrypt.compare(password, developer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: developer._id, username: developer.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Developer logged in', token, developer });
  } catch (error) {
    console.error('Login error:', error);  
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

const getDeveloperProfile = async (req, res) => {
  try {
    const developerId = req.developer.id;
    const developer = await Developer.findById(developerId);
    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.status(200).json(developer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching developer profile', error });
  }
};

const updateDeveloperProfile = async (req, res) => {
  try {
    const developerId = req.developer.id;
    const updates = req.body;
    const options = { new: true };

    const updatedDeveloper = await Developer.findByIdAndUpdate(developerId, updates, options);
    if (!updatedDeveloper) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.status(200).json({ message: 'Developer profile updated', developer: updatedDeveloper });
  } catch (error) {
    res.status(500).json({ message: 'Error updating developer profile', error });
  }
};

// Fetch projects assigned to the current developer
const getAssignedProjects = async (req, res) => {
  try {
    const developerId = req.developer._id; // Assuming you have middleware to set `req.developer` from the token
    const projects = await Project.find({ assignedTo: { $in: [developerId] } });
    if (!projects.length) {
      return res.status(404).json({ message: 'No projects found assigned to you' });
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned projects', error });
  }
};
//update project
const updateProjectStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { status } = req.body; // Expecting 'status' in the request body
    const developerId = req.developer._id; // Assuming `req.developer` is set from the token

    // Find the project and ensure the developer is assigned to it
    const project = await Project.findOne({ _id: projectId, assignedTo: { $in: [developerId] } });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or not assigned to you' });
    }

    // Update the status and lastUpdatedBy fields if the project is found and the developer is assigned
    project.status = status;
    project.lastUpdatedBy = developerId; // Update the lastUpdatedBy to the current developer's ID
    await project.save();

    res.status(200).json({ message: 'Project status updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project status', error });
  }
};
const addEvent = async (req, res) => {
  try {
    const { title, description, eventDate, createdBy, onModel, participants, eventType, projectId, location } = req.body;

    const newEvent = new CalendarEvent({
      title,
      description,
      eventDate,
      createdBy,
      onModel : "Developer" ,
      participants,
      eventType,
      projectId,
      location
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error adding event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const updates = req.body;

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(eventId, updates, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event is a project deadline and has a linked project
    if (updatedEvent.eventType === 'Project Deadline' && updatedEvent.projectId) {
      const projectUpdates = {
        deadline: updates.eventDate,  // Assume you want to update the deadline of the project to the new event date
        description : updates.description,
        title : updates.title
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

    await eventToDelete.remove(); // Or use findByIdAndDelete as before, if preferred
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
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
    const userId = req.developer._id;  // Assumes you have user information in req.user, set by authentication middleware
    const userEvents = await CalendarEvent.find({ createdBy: userId });  // Fetch events created by the user

    if (userEvents.length === 0) {
      return res.status(404).json({ message: 'No events found created by you' });
    }
    res.status(200).json(userEvents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user events', error: error.message });
  }
};

const applyForHoliday = async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  const developerId = req.developer._id; // Assuming req.developer is set after authentication
  const developerName = req.developer.username;
  try {
      const newHoliday = new Holiday({
          developer: developerId,
          developerName: developerName,
          startDate,
          endDate,
          reason
      });
      await newHoliday.save();

      // Create a corresponding calendar event for the holiday
      const newEvent = new CalendarEvent({
          title: "Holiday",
          description: reason,
          eventDate: startDate, // Assuming the holiday is a single-day event or starts on this date
          createdBy: developerId,
          onModel: 'Developer', // Assuming the calendar event model includes a reference to who created it
          eventType: 'Holiday',
          endDate : endDate,
          projectId: newHoliday._id,
          participants: [{ participantId: developerId, onModel: 'Developer' }] // In case the model expects participant details
      });
      await newEvent.save();
      await leaveNotification(null, req.developer.username, newHoliday._id);

      res.status(201).json({ message: 'Holiday request and calendar event submitted successfully', holiday: newHoliday, event: newEvent });
  } catch (error) {
      res.status(500).json({ message: 'Error submitting holiday request and creating event', error: error.message });
  }
};

const fetchHolidays = async (req, res) => {
  const developerId = req.developer._id; // Assuming req.user is set after authentication

  try {
      const holidays = await Holiday.find({ developer: developerId });
      if (holidays.length === 0) {
          return res.status(404).json({ message: 'No holiday requests found' });
      }
      res.status(200).json(holidays);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching holiday requests', error: error.message });
  }
};

const withdrawHoliday = async (req, res) => {
  const holidayId = req.params.holidayId;
  const developerId = req.developer._id;

  try {
      // Update the holiday request to 'Withdrawn'
      const updatedHoliday = await Holiday.findOneAndUpdate(
          { _id: holidayId, developer: developerId, status: { $ne: 'Approved' } }, // Ensure it's their own and not already approved
          { status: 'Withdrawn' },
          { new: true }
      );

      if (!updatedHoliday) {
          return res.status(404).json({ message: 'Holiday request not found or already approved' });
      }

      // Update or remove the corresponding calendar event
      const updatedEvent = await CalendarEvent.findOneAndUpdate(
          { projectId: holidayId },
          { status: 'Not-Active', title: 'Withdrawn Holiday' }, // You might choose to delete the event instead
          { new: true }
      );

      res.status(200).json({ message: 'Holiday withdrawn successfully', holiday: updatedHoliday, event: updatedEvent });
  } catch (error) {
      res.status(500).json({ message: 'Error withdrawing holiday', error: error.message });
  }
};

// Export all controller functions at the end
module.exports = {
  withdrawHoliday,
  applyForHoliday,
  fetchHolidays,
  fetchUserEvents,
  fetchAllEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  updateProjectStatus,
  getAssignedProjects,
  registerDeveloper,
  verifyDeveloper,
  developerLogin,
  getDeveloperProfile,
  updateDeveloperProfile
};
