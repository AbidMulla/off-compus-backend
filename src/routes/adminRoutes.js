const express = require('express');
const router = express.Router();

// Import admin controllers
const { addJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/admin/job-management');

// Admin Routes
// router.get('/dashboard', getAdminDashboard);
// router.get('/users', manageUsers);

// Job Management Routes
router.post('/add-job', addJob);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

// Basic route for testing
router.get('/', (req, res) => {
    res.json({ message: 'Admin routes are working' });
});

module.exports = router;
