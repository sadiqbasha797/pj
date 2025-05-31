const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const verifyHrToken = require('../middleware/verifyHrToken');

// All routes require HR authentication
router.use(verifyHrToken);

// Create new payslip
router.post('/create', payslipController.createPayslip);

// Get all payslips
router.get('/all', payslipController.getAllPayslips);

// Get payslips by employee
router.get('/employee/:employeeId/:role', payslipController.getPayslipsByEmployee);

// Update payslip
router.put('/:payslipId', payslipController.updatePayslip);

// Delete payslip
router.delete('/:payslipId', payslipController.deletePayslip);

// Get payslip statistics
router.get('/stats', payslipController.getPayslipStats);

module.exports = router; 