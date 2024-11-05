const express = require('express');
const {
    getNonVerifiedDevelopers,
    getAllDevelopers,
    registerManager,
    managerLogin,
    getManagerProfile, 
    updateManagerProfile, 
    deleteDeveloper, 
    verifyDeveloper,
  } = require('../controllers/managerController');
const {registerDeveloper} = require('../controllers/developerController');
const router = express.Router();
const verifyAdminToken = require('../middleware/verifyAdminToken');
const verifyManagerToken = require('../middleware/verifyManagerToken');
const { addTask, updateTask, getTasksByProject, deleteTask, addTaskUpdate, addFinalResult, deleteTaskUpdate } = require('../controllers/taskController');
const { 
  getProjectsByStatus,
  addProject,
  fetchProjects,
  updateProject,
  deleteProject} = require('../controllers/projectController');
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
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Register a new manager
router.post('/register',verifyAdminToken, registerManager);
router.post('/register-dev', verifyAdminToken, registerDeveloper);
// Manager login
router.post('/login',managerLogin);

// Additional APIs like managing tasks/projects could be added here
router.get('/profile', verifyManagerToken, getManagerProfile);
router.put('/profile', verifyManagerToken, updateManagerProfile);
router.delete('/delete-dev/:developerId', verifyManagerToken, deleteDeveloper);
router.post('/verify-dev/:developerId', verifyManagerToken, verifyDeveloper);
router.get('/developers', verifyManagerToken, getAllDevelopers);  // New route to fetch all developers
router.get('/non-verified', verifyManagerToken, getNonVerifiedDevelopers); // New route to fetch non-verified developers
//projects api
router.post('/project', verifyManagerToken, addProject);
router.get('/projects', verifyManagerToken, fetchProjects);
router.put('/project/:projectId', verifyManagerToken, updateProject);
router.delete('/project/:projectId', verifyManagerToken, deleteProject);
router.get('/projects/status', verifyManagerToken, getProjectsByStatus); // New route for fetching projects by status
//calendar
router.post('/events', verifyManagerToken, addEvent);
router.put('/events/:eventId', verifyManagerToken, updateEvent);
router.delete('/events/:eventId', verifyManagerToken, deleteEvent);
router.get('/events', verifyManagerToken,fetchAllEvents);
router.get('/user-events', verifyManagerToken, fetchUserEvents);
// Routes for task operations
router.post('/add-task', verifyManagerToken, addTask);
router.put('/update-task/:taskId', verifyManagerToken, updateTask);
router.get('/project-task/:projectId', verifyManagerToken, getTasksByProject);
router.delete('/delete-task/:taskId', verifyManagerToken, deleteTask);

// Add these new routes
router.post(
    '/task/:taskId/update', 
    verifyManagerToken, 
    upload.array('media', 5), 
    addTaskUpdate
);

router.post(
    '/task/:taskId/final-result', 
    verifyManagerToken, 
    upload.array('resultImages', 5), 
    addFinalResult
);

router.delete(
    '/task/:taskId/update/:updateId', 
    verifyManagerToken, 
    deleteTaskUpdate
);

module.exports = router;
