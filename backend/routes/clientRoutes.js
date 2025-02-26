const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const verifyClientToken = require('../middleware/verifyClientToken');
const {addEvent,updateEvent,deleteEvent} = require('../controllers/calendarController');
const {addComment, deleteComment} = require('../controllers/taskUpdateController');
const {getAllAdmins,getAllManagers,getAllDevelopers} = require('../controllers/adminController');
const {getAllMembers} = require('../controllers/digitalMarketingController');
const {getAllContentCreatorMembers} = require('../controllers/contentCreatorController');
const {
    registerClient,
    loginClient,
    updateClient,
    deleteClient,
    getClientProjects,
    getClientMeetings,
    fetchClientNotifications,
    markAllNotificationsAsRead,
    getClientProfile
} = require('../controllers/clientController');

// Auth routes
router.post('/register', 
    upload.single('companyLogo'),
    registerClient
);
router.post('/login', loginClient);

// Protected routes
router.put('/:clientId', 
    verifyClientToken,
    upload.single('companyLogo'),
    updateClient
);
router.delete('/:clientId', verifyClientToken, deleteClient);

// Get client's projects (protected route)
router.get('/projects', verifyClientToken, getClientProjects);
router.get('/meetings', verifyClientToken, getClientMeetings);

//comment
router.post('/comment/:updateId', verifyClientToken, addComment);
router.delete('/comment/:updateId/:commentId', verifyClientToken, deleteComment);

//calendar
router.post('/calendar/event', verifyClientToken, addEvent);
router.put('/calendar/event/:eventId', verifyClientToken, updateEvent);
router.delete('/calendar/event/:eventId', verifyClientToken, deleteEvent);

//admin
router.get('/admins', verifyClientToken, getAllAdmins);
router.get('/managers', verifyClientToken, getAllManagers);
router.get('/developers', verifyClientToken, getAllDevelopers);

//digital marketing
router.get('/digital-marketing', verifyClientToken, getAllMembers);

//content creator
router.get('/content-creators', verifyClientToken, getAllContentCreatorMembers);

//notifications
router.get('/notifications', verifyClientToken, fetchClientNotifications);
router.put('/notifications/mark-all-as-read', verifyClientToken, markAllNotificationsAsRead);

// Add this route with the protected middleware
router.get('/profile', verifyClientToken, getClientProfile);

module.exports = router;
