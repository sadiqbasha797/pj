const express = require('express');
const router = express.Router();
const {
    createOfferLetter,
    getAllOfferLetters,
    getOfferLetterById,
    updateOfferLetterStatus,
    deleteOfferLetter
} = require('../controllers/offerLetterController');
const verifyAdminHrToken = require('../middleware/verifyAdminHrToken');

// Create new offer letter
router.post('/', verifyAdminHrToken, createOfferLetter);

// Get all offer letters
router.get('/', verifyAdminHrToken, getAllOfferLetters);

// Get offer letter by ID
router.get('/:id', verifyAdminHrToken, getOfferLetterById);

// Update offer letter status
router.patch('/:id/status', verifyAdminHrToken, updateOfferLetterStatus);

// Delete offer letter (Both Admin and HR can delete)
router.delete('/:id', verifyAdminHrToken, deleteOfferLetter);

module.exports = router; 