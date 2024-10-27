const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Developer = require('../models/Developer');
const { createNotification,notifyCreation,notifyUpdate,leaveUpdateNotification,leaveNotification } = require('../utils/notificationHelper'); // Adjust the path as necessary
const CalendarEvent = require('../models/calendarEvent');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com', // Replace with your email
        pass: 'hpdi qrqk plrn blzz' // Replace with your email password or app-specific password
    }
});

// Function to send email notification to participants
const sendEmailToParticipants = async (participantIds, taskDetails) => {
    const participants = await Developer.find({ '_id': { $in: participantIds } });
    const emails = participants.map(participant => participant.email);

    const mailOptions = {
        from: 'khanbasha7777777@gmail.com', // Replace with your email
        to: emails.join(', '),
        subject: `New Task Assigned: ${taskDetails.taskName}`,
        text: `You have been assigned a new task: ${taskDetails.taskName}\nDescription: ${taskDetails.description}\nStart Date: ${taskDetails.startDate}\nEnd Date: ${taskDetails.endDate}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

const addTask = async (req, res) => {
    try {
        const { taskName, startDate, endDate, projectId, participants, status } = req.body;
        const createdBy = req.admin ? req.admin._id : req.manager._id;  // Use correct authentication based on your setup

        // Ensure the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Ensure participants are part of the project
        const validParticipants = participants.every(p => project.assignedTo.includes(p.participantId));
        if (!validParticipants) {
            return res.status(400).json({ message: 'All participants must be part of the project' });
        }

        const newTask = new Task({
            taskName,
            startDate,
            endDate,
            projectId,
            participants,
            status,
            createdBy
        });
        await newTask.save();

        // Create a corresponding calendar event for the task
        const newEvent = new CalendarEvent({
            title: taskName,
            description: 'Task: ' + taskName,
            eventDate: startDate,
            endDate: endDate,
            createdBy,
            onModel: 'Task',
            eventType: 'Task',
            projectId,
            onModel : 'Developer',
            participants: participants.map(p => ({ participantId: p.participantId, onModel: 'Developer' }))
        });
        await newEvent.save();

        const participantIds = participants.map(p => p.participantId);
        await notifyCreation(participantIds, 'Task', taskName, newTask._id);

        await sendEmailToParticipants(participantIds, newTask);

        res.status(201).json({ message: 'Task and corresponding calendar event added successfully', task: newTask, event: newEvent });
    } catch (error) {
        console.error('Failed to add task and corresponding calendar event:', error);
        res.status(500).json({ message: 'Error adding task and calendar event', error: error.message });
    }
};
// Update a task
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const updates = req.body;

        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Notify participants
        await notifyUpdate(updatedTask.participants, 'Task', updatedTask.taskName, updatedTask._id);

        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        console.error('Failed to update task:', error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

// Fetch tasks for a project
const getTasksByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tasks = await Task.find({ projectId });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;

        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Failed to delete task:', error);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};

// Fetch all tasks
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('projectId', 'title') // Populate project title
            .populate('participants.participantId', 'username') // Populate participant usernames
            .populate('createdBy', 'username'); // Populate creator username

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// Fetch a task by ID
const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await Task.findById(taskId)
            .populate('projectId', 'title') // Populate project title
            .populate('participants.participantId', 'username') // Populate participant usernames
            .populate('createdBy', 'username'); // Populate creator username

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Failed to fetch task:', error);
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
};

module.exports = {
    addTask,
    updateTask,
    getTasksByProject,
    deleteTask,
    getAllTasks,
    getTaskById
};
