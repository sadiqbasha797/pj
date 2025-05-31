const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
} = require('../controllers/jobController');
const verifyAdminHrToken = require('../middleware/verifyAdminHrToken');

// Configure multer for file uploads
const uploadFields = upload.fields([
    { name: 'attachments', maxCount: 5 }
]);

// Create new job (Both Admin and HR can create)
router.post('/', verifyAdminHrToken, uploadFields, createJob);

// Get all jobs with filters (Both Admin and HR can view)
router.get('/', verifyAdminHrToken, getAllJobs);

// Get job by ID (Both Admin and HR can view)
router.get('/:id', verifyAdminHrToken, getJobById);

// Update job (Both Admin and HR can update)
router.put('/:id', verifyAdminHrToken, uploadFields, updateJob);

// Delete job (Both Admin and HR can delete)
router.delete('/:id', verifyAdminHrToken, deleteJob);

module.exports = router; 