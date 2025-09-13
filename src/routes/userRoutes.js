const express = require('express');
const router = express.Router();

// Import user controllers (you can add these as needed)
// const { getUserProfile, updateUserProfile } = require('../controllers/user/userController');

// User Routes
// router.get('/profile', getUserProfile);
// router.put('/profile', updateUserProfile);

// Basic route for testing
router.get('/', (req, res) => {
    res.json({ message: 'User routes are working' });
});

module.exports = router;