const express = require('express');
const { applyToJob, getMyApplications } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, applyToJob);
router.get('/my-applications', protect, getMyApplications);

module.exports = router;
