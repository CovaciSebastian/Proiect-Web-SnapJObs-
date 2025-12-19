const express = require('express');
const { getJobs, getJobById, createJob, updateJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);

module.exports = router;
