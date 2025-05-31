const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const payslipController = require('../controllers/payslipController');
const verifyHrToken = require('../middleware/verifyHrToken');
const { getAllDevelopers, deleteDeveloper, getPendingRequests, handleTeamRequest, getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require('../controllers/adminController');
const { getAllMembers, register, adminDeleteUser } = require('../controllers/digitalMarketingController');
const { getAllContentCreatorMembers, registerContentCreator, adminDeleteContentCreator } = require('../controllers/contentCreatorController');
const { registerDeveloper } = require('../controllers/developerController');
const { approveOrDenyHoliday, getAllHolidays } = require('../controllers/calendarController');

// Public routes
router.post('/register', hrController.register);
router.post('/login', hrController.login);

// Protected routes - require HR authentication
router.use(verifyHrToken);

// HR Profile routes
router.get('/profile', hrController.getProfile);
router.put('/profile', hrController.updateProfile);

// Employee listing routes
router.get('/developers', getAllDevelopers);
router.get('/digital-marketers', getAllMembers);
router.get('/content-creators', getAllContentCreatorMembers);

// Employee registration routes
router.post('/register-developer', registerDeveloper);
router.post('/register-digital-marketer', register);
router.post('/register-content-creator', registerContentCreator);

// Employee deletion routes
router.delete('/delete-developer/:developerId', deleteDeveloper);
router.delete('/delete-digital-marketer/:userId', adminDeleteUser);
router.delete('/delete-content-creator/:userId', adminDeleteContentCreator);

// Team request routes
router.get('/pending-requests', getPendingRequests);
router.put('/team-request/:requestId', handleTeamRequest);

// Payslip routes
router.post('/payslip/create', payslipController.createPayslip);
router.get('/payslips', payslipController.getAllPayslips);
router.get('/payslip/employee/:employeeId/:role', payslipController.getPayslipsByEmployee);
router.put('/payslip/:payslipId', payslipController.updatePayslip);
router.delete('/payslip/:payslipId', payslipController.deletePayslip);
router.get('/payslip/stats', payslipController.getPayslipStats);

// Holiday management routes
router.get('/holidays', getAllHolidays);
router.put('/holiday/:holidayId', approveOrDenyHoliday);

// Notification routes
router.get('/notifications', getAllNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);

module.exports = router; 