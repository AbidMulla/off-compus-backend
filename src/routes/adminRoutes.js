const express = require('express');
const router = express.Router();

// Import admin controllers (you can add these as needed)
// const { getAdminDashboard, manageUsers } = require('../controllers/admin/adminController');

// Admin Routes
// router.get('/dashboard', getAdminDashboard);
// router.get('/users', manageUsers);

// Basic route for testing
router.get('/', (req, res) => {
    res.json({ message: 'Admin routes are working' });
});

module.exports = router;
