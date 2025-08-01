const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyMarketingToken = require('../middleware/verifyMarketingToken');
const {
    register,
    login,
    updateProfile,
    getProfile,
    deleteProfile,
    fetchNotifications,
    markAllNotificationsAsRead,
    getParticipatingMeetings,   
    getMarketingEvents,
    getAllMembers,
    applyForHoliday,
    withdrawHoliday,
    fetchHolidays,
    initiatePasswordReset,
    resetPassword
} = require('../controllers/digitalMarketingController');
const {fetchProjects} = require('../controllers/projectController');
const {createMarketingTask, getAllMarketingTasks, getMarketingTaskById, updateMarketingTask, deleteMarketingTask} = require('../controllers/marketingTaskController');
const {getAllClients} = require('../controllers/clientController');
const {createTaskUpdate, getTaskUpdates, addComment, deleteTaskUpdate, updateTaskUpdate, getProjectTaskUpdates} = require('../controllers/taskUpdateController');
const {getAssignedMarketingTasks} = require('../controllers/marketingTaskController');
const {createRevenue, getAllRevenue, getRevenueByProject, updateRevenue, deleteRevenue} = require('../controllers/revenueController');
const {getAllDevelopers,getAllManagers,getAllAdmins} = require('../controllers/adminController');
const {getAllContentCreatorMembers} = require('../controllers/contentCreatorController');
const {addEvent, updateEvent, deleteEvent} = require('../controllers/calendarController');
// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Accept images and common document types
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx)$/)) {
            return cb(new Error('Only images and documents are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Public routes
router.post('/register', upload.single('image'), register);
router.post('/login', login);

// Add password reset routes (public)
router.post('/forgot-password', initiatePasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes - only for digital marketing role
router.use(verifyMarketingToken); // Apply marketing auth middleware to all routes below
router.get('/profile', getProfile);
router.put('/profile', upload.single('image'), updateProfile);
router.delete('/profile', deleteProfile);

// Task Update routes
router.post('/task-updates',verifyMarketingToken, upload.array('attachments', 5), createTaskUpdate);
router.get('/task-updates/:taskId', verifyMarketingToken, getTaskUpdates);
router.post('/task-updates/:id/comments', verifyMarketingToken, addComment);
router.delete('/task-updates/:id', verifyMarketingToken, deleteTaskUpdate);
router.put('/task-updates/:id', verifyMarketingToken, upload.array('attachments', 5), updateTaskUpdate);

// Revenue routes
router.post('/revenue', verifyMarketingToken, upload.array('attachments', 5), createRevenue);
router.get('/revenue', verifyMarketingToken, getAllRevenue);
router.get('/revenue/project/:projectId', verifyMarketingToken, getRevenueByProject);
router.put('/revenue/:revenueId', verifyMarketingToken, upload.array('attachments', 5), updateRevenue);
router.delete('/revenue/:revenueId', verifyMarketingToken, deleteRevenue);

// Get assigned marketing tasks
router.get('/assigned-tasks', verifyMarketingToken, getAssignedMarketingTasks);

// Get task updates for a specific project
router.get('/project-task-updates/:projectId', verifyMarketingToken, getProjectTaskUpdates);

//project api's
router.get('/projects', verifyMarketingToken, fetchProjects);

// Notifications API's
router.get('/notifications', verifyMarketingToken, fetchNotifications);
router.put('/notifications/mark-all-as-read', verifyMarketingToken, markAllNotificationsAsRead);

// Get participating meetings
router.get('/participating-meetings', verifyMarketingToken, getParticipatingMeetings);

// Get marketing events
router.get('/marketing-events', verifyMarketingToken, getMarketingEvents);  

// Get all members
router.get('/digital-marketing-members', verifyMarketingToken, getAllMembers);
router.get('/content-creator-members', verifyMarketingToken, getAllContentCreatorMembers);
router.get('/developers', verifyMarketingToken, getAllDevelopers);
router.get('/managers', verifyMarketingToken, getAllManagers);
router.get('/admins', verifyMarketingToken, getAllAdmins);

// Calendar API's
router.post('/add-event', verifyMarketingToken, addEvent);
router.put('/update-event/:eventId', verifyMarketingToken, updateEvent);
router.delete('/delete-event/:eventId', verifyMarketingToken, deleteEvent);

// Holiday API's
router.post('/apply-for-holiday', verifyMarketingToken, applyForHoliday);
router.put('/withdraw-holiday/:holidayId', verifyMarketingToken, withdrawHoliday);
router.get('/fetch-holidays', verifyMarketingToken, fetchHolidays);

//client api's
router.get('/clients', verifyMarketingToken, getAllClients);

//marketing task api's
router.post('/create-marketing-task', verifyMarketingToken, createMarketingTask);
router.get('/get-all-marketing-tasks', verifyMarketingToken, getAllMarketingTasks);
router.get('/get-marketing-task-by-id/:taskId', verifyMarketingToken, getMarketingTaskById);
router.put('/update-marketing-task/:taskId', verifyMarketingToken, updateMarketingTask);
router.delete('/delete-marketing-task/:taskId', verifyMarketingToken, deleteMarketingTask);

//project api's
router.get('/projects', verifyMarketingToken, fetchProjects);

module.exports = router;
