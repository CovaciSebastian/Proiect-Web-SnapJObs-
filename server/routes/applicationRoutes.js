const express = require('express');
const { applyToJob, getMyApplications, withdrawApplication } = require('../controllers/applicationController');
const { isAuthenticated } = require('../middleware/authMiddleware'); // Using the new middleware
const router = express.Router();

// Route to get all applications for the logged-in user
router.get('/my', isAuthenticated, getMyApplications);

// Route to apply for a job
router.post('/', isAuthenticated, applyToJob);

// Route to withdraw an application
router.delete('/:jobId', isAuthenticated, withdrawApplication);

module.exports = router;
