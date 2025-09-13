const express = require('express');
const router = express.Router();

// Import controllers from our new auth controllers
const { 
    register, 
    registerOTP, 
    login, 
    forgotPassword, 
    forgotPasswordOTP, 
    resetPassword, 
    activateAccount, 
    registerResendOTP, 
    forgotPasswordResendOTP, 
    activateAccountResendOTP, 
    logout 
} = require('../controllers/user/auth.contollers');

// Auth public Routes
router.post('/register', register);
router.post('/register-otp', registerOTP);
router.post('/register-resend-otp', registerResendOTP);

router.post('/activate-account', activateAccount);
router.post('/activate-account-resend-otp', activateAccountResendOTP);

router.post('/login', login);
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/forgot-password-otp', forgotPasswordOTP);
router.post('/forgot-password-resend-otp', forgotPasswordResendOTP);
router.post('/reset-password', resetPassword);
 
module.exports = router; 
