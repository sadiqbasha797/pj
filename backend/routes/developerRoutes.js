const express = require('express');
const {
    withdrawHoliday,
    fetchHolidays,
    applyForHoliday,
    fetchUserEvents,
    fetchAllEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getAssignedProjects, 
    getDeveloperProfile, 
    updateDeveloperProfile, 
    developerLogin, 
    registerDeveloper,
    updateProjectStatus 
} = require('../controllers/developerController');
const verifyAdminToken = require('../middleware/verifyAdminToken');
const verifyDeveloperToken = require('../middleware/verifyDeveloperToken');
const router = express.Router();
//user managment api's
router.post('/register',verifyAdminToken, registerDeveloper);
router.post('/login',developerLogin);
router.get('/profile', verifyDeveloperToken, getDeveloperProfile);
router.put('/profile', verifyDeveloperToken,updateDeveloperProfile);
//project api's
router.get('/projects', verifyDeveloperToken, getAssignedProjects);
router.put('/project-status/:projectId', verifyDeveloperToken, updateProjectStatus);
//calendar
router.post('/events', verifyDeveloperToken, addEvent);
router.put('/events/:eventId', verifyDeveloperToken, updateEvent);
router.delete('/events/:eventId', verifyDeveloperToken, deleteEvent);
router.get('/events', verifyDeveloperToken,fetchAllEvents);
router.get('/user-events', verifyDeveloperToken, fetchUserEvents);
//holiday
router.post('/holidays', verifyDeveloperToken, applyForHoliday);
router.get('/holidays', verifyDeveloperToken, fetchHolidays);
router.put('/holidays/withdraw/:holidayId', verifyDeveloperToken, withdrawHoliday);

module.exports = router;