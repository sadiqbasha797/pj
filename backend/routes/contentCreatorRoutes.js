const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyContentCreatorToken = require('../middleware/verifyContentCreatorToken');
const {
    registerContentCreator,
    login,
    updateProfile,
    getProfile,
    deleteProfile,
    fetchNotifications,
    markAllNotificationsAsRead,
    getParticipatingMeetings,
    getAllContentCreatorMembers,
    getContentCreatorEvents,
    applyForHoliday,
    withdrawHoliday,
    fetchHolidays
} = require('../controllers/contentCreatorController');
const {createMarketingTask, getAllMarketingTasks, getMarketingTaskById, updateMarketingTask, deleteMarketingTask} = require('../controllers/marketingTaskController');
const {getAllClients} = require('../controllers/clientController');
const {addEvent, updateEvent, deleteEvent} = require('../controllers/calendarController');
const {getAllAdmins, getAllDevelopers, getAllManagers} = require('../controllers/adminController');
const {getAllMembers}=require('../controllers/digitalMarketingController');
const {createTaskUpdate, getTaskUpdates, addComment, deleteTaskUpdate, updateTaskUpdate, getProjectTaskUpdates} = require('../controllers/taskUpdateController');
const {getAssignedMarketingTasks} = require('../controllers/marketingTaskController');
const {createRevenue, getAllRevenue, getRevenueByProject, updateRevenue, deleteRevenue} = require('../controllers/revenueController');
const {fetchProjects} = require('../controllers/projectController');

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
router.post('/register', upload.single('image'), registerContentCreator);
router.post('/login', login);

// Protected routes - only for content creator role
router.use(verifyContentCreatorToken);
router.get('/profile', getProfile);
router.put('/profile', upload.single('image'), updateProfile);
router.delete('/profile', deleteProfile);

// Task Update routes
router.post('/task-updates', verifyContentCreatorToken, upload.array('attachments', 5), createTaskUpdate);
router.get('/task-updates/:taskId', verifyContentCreatorToken, getTaskUpdates);
router.post('/task-updates/:id/comments', verifyContentCreatorToken, addComment);
router.delete('/task-updates/:id', verifyContentCreatorToken, deleteTaskUpdate);
router.put('/task-updates/:id', verifyContentCreatorToken, upload.array('attachments', 5), updateTaskUpdate);

// Revenue routes
router.post('/revenue', verifyContentCreatorToken, upload.array('attachments', 5), createRevenue);
router.get('/revenue', verifyContentCreatorToken, getAllRevenue);
router.get('/revenue/project/:projectId', verifyContentCreatorToken, getRevenueByProject);
router.put('/revenue/:revenueId', verifyContentCreatorToken, upload.array('attachments', 5), updateRevenue);
router.delete('/revenue/:revenueId', verifyContentCreatorToken, deleteRevenue);

// Get assigned marketing tasks
router.get('/assigned-tasks', verifyContentCreatorToken, getAssignedMarketingTasks);

// Get task updates for a specific project
router.get('/project-task-updates/:projectId', verifyContentCreatorToken, getProjectTaskUpdates);

//project api's
router.get('/projects', verifyContentCreatorToken, fetchProjects);

// Notifications API's
router.get('/notifications', verifyContentCreatorToken, fetchNotifications);
router.put('/notifications/mark-all-as-read', verifyContentCreatorToken, markAllNotificationsAsRead);

// Get participating meetings
router.get('/participating-meetings', verifyContentCreatorToken, getParticipatingMeetings);

// Get all members
router.get('/all-digital-marketing-members', verifyContentCreatorToken, getAllMembers);
router.get('/all-content-creator-members', verifyContentCreatorToken, getAllContentCreatorMembers);
router.get('/all-admins', verifyContentCreatorToken, getAllAdmins);
router.get('/all-developers', verifyContentCreatorToken, getAllDevelopers);
router.get('/all-managers', verifyContentCreatorToken, getAllManagers);

// Calendar API's
router.post('/add-event', verifyContentCreatorToken, addEvent);
router.put('/update-event/:eventId', verifyContentCreatorToken, updateEvent);
router.delete('/delete-event/:eventId', verifyContentCreatorToken, deleteEvent);

// Get content creator events
router.get('/content-creator-events', verifyContentCreatorToken, getContentCreatorEvents);

// Holiday API's
router.post('/apply-for-holiday', verifyContentCreatorToken, applyForHoliday);
router.put('/withdraw-holiday/:holidayId', verifyContentCreatorToken, withdrawHoliday);
router.get('/fetch-holidays', verifyContentCreatorToken, fetchHolidays);

//client api's
router.get('/clients', verifyContentCreatorToken, getAllClients);

//marketing task api's
router.post('/create-marketing-task', verifyContentCreatorToken, createMarketingTask);
router.get('/get-all-marketing-tasks', verifyContentCreatorToken, getAllMarketingTasks);
router.get('/get-marketing-task-by-id/:taskId', verifyContentCreatorToken, getMarketingTaskById);
router.put('/update-marketing-task/:taskId', verifyContentCreatorToken, updateMarketingTask);
router.delete('/delete-marketing-task/:taskId', verifyContentCreatorToken, deleteMarketingTask);
module.exports = router;
