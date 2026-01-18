const express = require('express');
const { applyToJob, getMyApplications, withdrawApplication, getApplicantsByJob, updateApplicationStatus } = require('../controllers/applicationController');
const { isAuthenticated, protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to get all applications for the logged-in user
router.get('/my', isAuthenticated, getMyApplications);

// Route to apply for a job
router.post('/', isAuthenticated, applyToJob);

// Route to withdraw an application
router.delete('/:jobId', isAuthenticated, withdrawApplication);

// Employer routes
router.get('/job/:jobId', protect, getApplicantsByJob);
router.patch('/:id/status', protect, updateApplicationStatus);

module.exports = router;
