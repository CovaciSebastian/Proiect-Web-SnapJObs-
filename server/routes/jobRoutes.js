const express = require('express');
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', isAuthenticated, createJob);
router.put('/:id', isAuthenticated, updateJob);
router.delete('/:id', isAuthenticated, deleteJob);

module.exports = router;
