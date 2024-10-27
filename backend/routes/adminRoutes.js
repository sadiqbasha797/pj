const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
   
    getNonVerifiedDevelopers,
    registerAdmin,
    adminLogin,
    getAdminProfile, 
    updateAdminProfile, 
    deleteAdmin, 
    getAllDevelopers, 
    getAllManagers,
    deleteDeveloper, 
    deleteManager, 
    updateDeveloper, 
    updateManager, 
    verifyDeveloper,
   
  } = require('../controllers/adminController');
const verifyAdminToken = require('../middleware/verifyAdminToken'); // Ensure you have this middleware
const { addTask, updateTask, getTasksByProject, deleteTask, getAllTasks, getTaskById } = require('../controllers/taskController');
const { 
  getProjectsByStatus,
  addProject,
  fetchProjects,
  updateProject,
  deleteProject,
  getAssignedDevelopers,
  getProjectById
} = require('../controllers/projectController');
const {
  updateHoliday,
  deleteHoliday,
  approveOrDenyHoliday,
  fetchUserEvents,
  fetchAllEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/calendarController')
const {registerManager} = require('../controllers/managerController');
const {registerDeveloper} = require('../controllers/developerController');

// Register a new admin
router.post('/register', registerAdmin);
router.post('/register-manager', verifyAdminToken, registerManager);
router.post('/register-dev',verifyAdminToken, registerDeveloper);
//Register manager and developer

// Admin login
router.post('/login', adminLogin);

// APIs for user management, system settings, etc., could be added here
router.get('/profile', verifyAdminToken, getAdminProfile);
router.put('/profile', verifyAdminToken, updateAdminProfile);
router.delete('/profile', verifyAdminToken, deleteAdmin);
//developer api's
router.get('/developers', verifyAdminToken, getAllDevelopers);
router.delete('/delete-dev/:developerId', verifyAdminToken, deleteDeveloper);
router.put('/update-dev/:developerId', verifyAdminToken, updateDeveloper);
router.post('/developer/verify/:developerId', verifyAdminToken, verifyDeveloper);
//manager api's
router.get('/managers', verifyAdminToken, getAllManagers);
router.delete('/delete-manager/:managerId', verifyAdminToken, deleteManager);
router.put('/update-manager/:managerId', verifyAdminToken, updateManager);
router.get('/non-verified', verifyAdminToken, getNonVerifiedDevelopers);
//project apis
router.post('/project',upload.array('relatedDocs', 5), verifyAdminToken, addProject);
router.get('/projects', verifyAdminToken, fetchProjects);
router.put('/project/:projectId',upload.array('relatedDocs', 5), verifyAdminToken, updateProject);
router.delete('/project/:projectId', verifyAdminToken, deleteProject);
router.get('/projects/status', verifyAdminToken, getProjectsByStatus); 
router.get('/project/assigned-developers/:projectId', verifyAdminToken, getAssignedDevelopers);
router.get('/project/:projectId', verifyAdminToken, getProjectById);
//calendar
router.post('/events', verifyAdminToken, addEvent);
router.put('/events/:eventId', verifyAdminToken, updateEvent);
router.delete('/events/:eventId', verifyAdminToken, deleteEvent);
router.get('/events', verifyAdminToken,fetchAllEvents);
router.get('/user-events', verifyAdminToken, fetchUserEvents);
//holiday
router.put('/holidays/:holidayId', verifyAdminToken, approveOrDenyHoliday);
router.put('/holidays/update/:holidayId', verifyAdminToken, updateHoliday);
router.delete('/holidays/delete/:holidayId', verifyAdminToken, deleteHoliday);
//task
router.post('/add-task', verifyAdminToken, addTask);
router.put('/update-task/:taskId', verifyAdminToken, updateTask);
router.get('/project-task/:projectId', verifyAdminToken, getTasksByProject);
router.delete('/delete-task/:taskId', verifyAdminToken, deleteTask);
router.get('/all-tasks', verifyAdminToken, getAllTasks);
router.get('/task/:taskId', verifyAdminToken, getTaskById);
module.exports = router;
