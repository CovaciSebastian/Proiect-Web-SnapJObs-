const express = require('express');
const { applyToJob, getMyApplications, withdrawApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, applyToJob);
router.get('/my-applications', protect, getMyApplications);
router.delete('/:jobId', protect, withdrawApplication);

module.exports = router;
