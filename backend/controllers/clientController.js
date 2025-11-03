const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const CalendarEvent = require('../models/calendarEvent');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const Notification = require('../models/Notification');

// Register a new client
const registerClient = async (req, res) => {
    try {
        const { clientName, email, password, companyName, address, countryCode, mobileNumber } = req.body;
        
        // Check if client already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Handle company logo upload if provided
        let companyLogo;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, {
                folder: 'client-logos',
                resource_type: 'auto'
            });
            companyLogo = result.secure_url;
        }

        const client = new Client({
            clientName,
            email,
            password,
            companyName,
            address,
            countryCode,
            mobileNumber,
            companyLogo
        });

        await client.save();
        res.status(201).json({ 
            message: 'Client registered successfully', 
            client: {
                ...client.toObject(),
                password: undefined
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering client', error: error.message });
    }
};

// Client login
const loginClient = async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await Client.findOne({ email });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = jwt.sign({ id: client._id, role: 'client' }, process.env.JWT_SECRET);
        
        // Return token with usage instructions and user ID
        res.status(200).json({ 
            message: 'Login successful',
            token,
            userId: client._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Update client
const updateClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const updates = { ...req.body };

        // Get current client document
        const currentClient = await Client.findById(clientId);
        if (!currentClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Handle company logo upload if provided
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, {
                folder: 'client-logos',
                resource_type: 'auto'
            });
            updates.companyLogo = result.secure_url;

            // Delete old company logo if it exists
            if (currentClient.companyLogo) {
                const publicId = currentClient.companyLogo.split('/').slice(-2).join('/').split('.')[0];
                await deleteFromCloudinary(publicId);
            }
        }

        // Remove projects from updates if it exists to prevent the error
        delete updates.projects;

        // If password is being updated, hash it
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const client = await Client.findByIdAndUpdate(
            clientId,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.status(200).json({ 
            message: 'Client updated successfully', 
            client 
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ 
            message: 'Error updating client', 
            error: error.message 
        });
    }
};

// Delete client
const deleteClient = async (req, res) => {
    const { clientId } = req.params;

    try {
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Delete company logo from Cloudinary if it exists
        if (client.companyLogo) {
            const publicId = client.companyLogo.split('/').slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        await client.deleteOne();
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting client', error: error.message });
    }
};

// Get client's projects with related tasks
const getClientProjects = async (req, res) => {
    try {
        // Get client from the token
        const clientId = req.client._id;

        // Find client and populate the projects field
        const client = await Client.findById(clientId)
            .populate({
                path: 'projects',
                select: 'title description deadline status updatedAt assignedTo',
                populate: [
                    {
                        path: 'assignedTo',
                        select: 'name email'
                    }
                ]
            });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Get all project IDs
        const projectIds = client.projects.map(project => project._id);

        // Fetch all tasks related to these projects
        const tasks = await Task.find({ projectId: { $in: projectIds } })
            .populate([
                {
                    path: 'participants.participantId',
                    select: 'name email'
                },
                {
                    path: 'updates.updatedBy',
                    select: 'name email'
                }
            ]);

        // Create a map of tasks by project ID
        const tasksByProject = tasks.reduce((acc, task) => {
            if (!acc[task.projectId]) {
                acc[task.projectId] = [];
            }
            acc[task.projectId].push(task);
            return acc;
        }, {});

        // Combine projects with their tasks
        const projectsWithTasks = client.projects.map(project => ({
            ...project.toObject(),
            tasks: tasksByProject[project._id] || []
        }));

        res.status(200).json({
            success: true,
            projects: projectsWithTasks
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching client projects and tasks',
            error: error.message
        });
    }
};

// Get client's calendar events/meetings
const getClientMeetings = async (req, res) => {
    try {
        const clientId = req.client._id; // From verifyClientToken middleware

        const meetings = await CalendarEvent.find({
            $or: [
                {
                    'participants.participantId': clientId,
                    'participants.onModel': 'Client'
                },
                {
                    'createdBy': clientId,
                    'onModel': 'Client'
                }
            ],
            'status': 'Active',
            'eventType': 'Meeting' // Filter for meetings only
        })
        .populate([
            {
                // Populate creator details
                path: 'createdBy',
                select: 'name email clientName', // Added clientName for Client creators
                refPath: 'onModel'
            },
            {
                // Populate other participants
                path: 'participants.participantId',
                select: 'name email clientName',
                refPath: 'participants.onModel'
            },
            {
                // Populate project details if meeting is related to a project
                path: 'projectId',
                select: 'title description'
            }
        ])
        .sort({ eventDate: 1 }); // Sort by date ascending

        // Format the meetings data
        const formattedMeetings = meetings.map(meeting => ({
            _id: meeting._id,
            title: meeting.title,
            description: meeting.description,
            eventDate: meeting.eventDate,
            endDate: meeting.endDate,
            location: meeting.location,
            isAllDay: meeting.isAllDay,
            project: meeting.projectId ? {
                _id: meeting.projectId._id,
                title: meeting.projectId.title,
                description: meeting.projectId.description
            } : null,
            creator: {
                _id: meeting.createdBy._id,
                name: meeting.createdBy.name || meeting.createdBy.clientName,
                email: meeting.createdBy.email,
                role: meeting.onModel
            },
            participants: meeting.participants.map(participant => ({
                _id: participant.participantId._id,
                name: participant.participantId.name || participant.participantId.clientName,
                email: participant.participantId.email,
                role: participant.onModel
            }))
        }));

        res.status(200).json({
            success: true,
            meetings: formattedMeetings
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching client meetings',
            error: error.message
        });
    }
};

// Get all clients
const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find()
            .select('-password') // Exclude password field
            .populate('projects', 'title description'); // Populate projects with selected fields

        res.status(200).json({
            success: true,
            clients: clients
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching clients',
            error: error.message
        });
    }
};

const fetchClientNotifications = async (req, res) => {
  try {
    const clientId = req.client._id;

    // Find notifications for this client
    const notifications = await Notification.find({
      recipient: clientId
    }).sort({ date: -1 }); // Sort by date descending (newest first)

    if (notifications.length === 0) {
      return res.status(404).json({
        message: 'No notifications found'
      });
    }

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const clientId = req.client._id;

    // Update all unread notifications for this client
    await Notification.updateMany(
      { 
        recipient: clientId,
        read: false 
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read', 
      error: error.message
    });
  }
};

const getClientProfile = async (req, res) => {
    try {
        const clientId = req.client._id;

        const client = await Client.findById(clientId)
            .select('-password') // Exclude password
            .populate('projects', 'title description status deadline'); // Include basic project info

        if (!client) {
            return res.status(404).json({ 
                success: false,
                message: 'Client not found' 
            });
        }

        res.status(200).json({
            success: true,
            client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching client profile',
            error: error.message
        });
    }
};

module.exports = {
  registerClient,
  loginClient,
  updateClient,
  deleteClient,
  getClientProjects,
  getClientMeetings,
  getAllClients,
  fetchClientNotifications,
  markAllNotificationsAsRead,
  getClientProfile
};
