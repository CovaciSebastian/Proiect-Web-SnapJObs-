const express = require('express');
const { applyToJob, getMyApplications, withdrawApplication, getApplicantsByJob, updateApplicationStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, applyToJob);
router.get('/my-applications', protect, getMyApplications);
router.delete('/:jobId', protect, withdrawApplication);

// Employer routes
router.get('/job/:jobId', protect, getApplicantsByJob);
router.patch('/:id/status', protect, updateApplicationStatus);

module.exports = router;
