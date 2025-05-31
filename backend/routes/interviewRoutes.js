const express = require('express');
const router = express.Router();
const {
    createInterview,
    getAllInterviews,
    getInterviewById,
    updateInterview,
    updateInterviewStatus,
    deleteInterview
} = require('../controllers/interviewController');
const verifyAdminHrToken = require('../middleware/verifyAdminHrToken');

// Create new interview
router.post('/', verifyAdminHrToken, createInterview);

// Get all interviews
router.get('/', verifyAdminHrToken, getAllInterviews);

// Get interview by ID
router.get('/:id', verifyAdminHrToken, getInterviewById);

// Update interview
router.put('/:id', verifyAdminHrToken, updateInterview);

// Update interview status
router.patch('/:id/status', verifyAdminHrToken, updateInterviewStatus);

// Delete interview (Both Admin and HR can delete)
router.delete('/:id', verifyAdminHrToken, deleteInterview);

module.exports = router; 