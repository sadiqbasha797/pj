const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    applyForJob,
    updateApplicationStatus
} = require('../controllers/candidateController');
const verifyAdminHrToken = require('../middleware/verifyAdminHrToken');

// Configure multer for resume upload
const uploadFields = upload.fields([
    { name: 'resume', maxCount: 1 }
]);

// Create new candidate with job application
router.post('/', verifyAdminHrToken, uploadFields, createCandidate);

// Add new job application for existing candidate
router.post('/:candidateId/apply/:jobId', verifyAdminHrToken, applyForJob);

// Update application status
router.put('/:candidateId/application/:jobId/status', verifyAdminHrToken, updateApplicationStatus);

// Get all candidates (Both Admin and HR can view)
router.get('/', verifyAdminHrToken, getAllCandidates);

// Get candidate by ID (Both Admin and HR can view)
router.get('/:id', verifyAdminHrToken, getCandidateById);

// Update candidate (Both Admin and HR can update)
router.put('/:id', verifyAdminHrToken, uploadFields, updateCandidate);

// Delete candidate (Both Admin and HR can delete)
router.delete('/:id', verifyAdminHrToken, deleteCandidate);

module.exports = router; 