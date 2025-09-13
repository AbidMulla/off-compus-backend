const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole, Token } = require('../../models/auth/auth');
// Import all email templates with kebab-case naming
const { sendRegisterOtpEmail } = require('../../helpers/emailTemplate/auth/register-otp');
const { sendRegisterResendOtpEmail } = require('../../helpers/emailTemplate/auth/register-resend-otp');
const { sendForgotPasswordOtpEmail } = require('../../helpers/emailTemplate/auth/forgot-password-otp');
const { sendForgotPasswordResendOtpEmail } = require('../../helpers/emailTemplate/auth/forgot-password-resend-otp');
const { sendActivateAccountOtpEmail } = require('../../helpers/emailTemplate/auth/activate-account-otp');
const { sendActivateAccountResendOtpEmail } = require('../../helpers/emailTemplate/auth/activate-account-resend-otp');
const { sendWelcomeEmail } = require('../../helpers/emailTemplate/auth/welcome-email');
const { sendPasswordResetSuccessEmail } = require('../../helpers/emailTemplate/auth/password-reset-success');

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Hash Password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};


// 1. REGISTER USER
const register = async (req, res) => {
    try {
        console.log('=== REGISTER USER START ===');
        console.log('Request body:', { name: req.body.name, email: req.body.email, mobile_no: req.body.mobile_no, password: '[HIDDEN]' });
        
        const { name, email, mobile_no, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        console.log('Checking if user already exists for email:', email.toLowerCase());
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await hashPassword(password);

        // Generate OTP
        const otp = generateOTP();
        const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        console.log('Generated OTP:', otp, 'Expires at:', otpExpireAt);

        // Create user
        console.log('Creating new user...');
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            mobile_no: mobile_no || '',
            password: hashedPassword,
            otp_code: otp,
            otp_expire_at: otpExpireAt,
            is_email_verified: false,
            is_active: false
        });

        await user.save();
        console.log('User created successfully with ID:', user._id);

        // Send OTP email
        console.log('Sending registration OTP email to:', email);
        try {
            await sendRegisterOtpEmail(email, otp);
            console.log('Registration OTP email sent successfully');
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        // Assign default user role
        console.log('Assigning default user role...');
        const userRole = await Role.findOne({ name: 'user' });
        if (userRole) {
            await UserRole.create({
                user_id: user._id,
                role_id: userRole._id
            });
            console.log('Default user role assigned successfully');
        } else {
            console.log('Warning: Default user role not found');
        }

        console.log('=== REGISTER USER SUCCESS ===');
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email with the OTP sent.',
            data: {
                userId: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('=== REGISTER USER ERROR ===');
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: error.message
        });
    }
};

// 2. REGISTER OTP VERIFICATION
const registerOTP = async (req, res) => {
    try {
        console.log('=== REGISTER OTP VERIFICATION START ===');
        console.log('Request body:', { email: req.body.email, otp: req.body.otp });
        
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Check OTP
        if (user.otp_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiration
        if (new Date() > user.otp_expire_at) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Activate user
        user.is_email_verified = true;
        user.is_active = true;
        user.otp_code = undefined;
        user.otp_expire_at = undefined;
        await user.save();

        // Send welcome email
        try {
            await sendWelcomeEmail(email, user.name);
        } catch (emailError) {
            console.error('Welcome email sending failed:', emailError);
            // Don't fail activation if welcome email fails
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Save token to database
        await Token.create({
            user_id: user._id,
            token: token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. Account activated.',
            data: {
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    is_email_verified: user.is_email_verified,
                    is_active: user.is_active
                }
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP verification',
            error: error.message
        });
    }
};

// 3. LOGIN
const login = async (req, res) => {
    try {
        console.log('=== LOGIN START ===');
        console.log('Request body:', { email: req.body.email, password: '[HIDDEN]' });
        
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        console.log('Looking for user with email:', email.toLowerCase());
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        console.log('User found:', { id: user._id, email: user.email, is_active: user.is_active, is_blocked: user.is_blocked });

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is not active. Please verify your email first.'
            });
        }

        // Check if user is blocked
        if (user.is_blocked) {
            return res.status(401).json({
                success: false,
                message: 'Account is blocked. Please contact support.'
            });
        }

        // Check if user is deleted
        if (user.is_deleted) {
            return res.status(401).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Verify password
        console.log('Verifying password...');
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        console.log('Password verified successfully');

        // Generate JWT token
        console.log('Generating JWT token...');
        const token = generateToken(user._id);

        // Save token to database
        console.log('Saving token to database...');
        await Token.create({
            user_id: user._id,
            token: token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        console.log('Token saved successfully');

        console.log('=== LOGIN SUCCESS ===');
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile_no: user.mobile_no,
                    is_email_verified: user.is_email_verified,
                    is_active: user.is_active
                }
            }
        });

    } catch (error) {
        console.error('=== LOGIN ERROR ===');
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: error.message
        });
    }
};

// 4. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    try {
        console.log('=== FORGOT PASSWORD START ===');
        console.log('Request body:', { email: req.body.email });
        
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Account is not active. Please verify your email first.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user with OTP
        user.otp_code = otp;
        user.otp_expire_at = otpExpireAt;
        await user.save();

        // Send OTP email
        try {
            await sendForgotPasswordOtpEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email for password reset'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during forgot password',
            error: error.message
        });
    }
};

// 5. FORGOT PASSWORD OTP VERIFICATION
const forgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check OTP
        if (user.otp_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiration
        if (new Date() > user.otp_expire_at) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.'
        });

    } catch (error) {
        console.error('Forgot password OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP verification',
            error: error.message
        });
    }
};

// 6. RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        console.log('=== RESET PASSWORD START ===');
        console.log('Request body:', { email: req.body.email, otp: req.body.otp, newPassword: '[HIDDEN]' });
        
        const { email, otp, newPassword } = req.body;

        // Validation
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Password validation
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check OTP
        if (user.otp_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiration
        if (new Date() > user.otp_expire_at) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.otp_code = undefined;
        user.otp_expire_at = undefined;
        await user.save();

        // Send password reset success email
        try {
            await sendPasswordResetSuccessEmail(email, user.name);
        } catch (emailError) {
            console.error('Password reset success email sending failed:', emailError);
            // Don't fail password reset if email fails
        }

        // Invalidate all existing tokens for security
        await Token.deleteMany({ user_id: user._id });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during password reset',
            error: error.message
        });
    }
};

// 7. ACTIVATE ACCOUNT (Resend OTP)
const activateAccount = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user with new OTP
        user.otp_code = otp;
        user.otp_expire_at = otpExpireAt;
        await user.save();

        // Send OTP email
        try {
            await sendActivateAccountOtpEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email for account activation'
        });

    } catch (error) {
        console.error('Activate account error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during account activation',
            error: error.message
        });
    }
};

// 8. REGISTER RESEND OTP
const registerResendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user with new OTP
        user.otp_code = otp;
        user.otp_expire_at = otpExpireAt;
        await user.save();

        // Send OTP email
        try {
            await sendRegisterResendOtpEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email for account activation'
        });

    } catch (error) {
        console.error('Register resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP resend',
            error: error.message
        });
    }
};

// 9. FORGOT PASSWORD RESEND OTP
const forgotPasswordResendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Account is not active. Please verify your email first.'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user with new OTP
        user.otp_code = otp;
        user.otp_expire_at = otpExpireAt;
        await user.save();

        // Send OTP email
        try {
            await sendForgotPasswordResendOtpEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email for password reset'
        });

    } catch (error) {
        console.error('Forgot password resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP resend',
            error: error.message
        });
    }
};

// 10. ACTIVATE ACCOUNT RESEND OTP (Same as register resend but with different naming)
const activateAccountResendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user with new OTP
        user.otp_code = otp;
        user.otp_expire_at = otpExpireAt;
        await user.save();

        // Send OTP email
        try {
            await sendActivateAccountResendOtpEmail(email, otp);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email for account activation'
        });

    } catch (error) {
        console.error('Activate account resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP resend',
            error: error.message
        });
    }
};

// 11. ACTIVATE ACCOUNT OTP VERIFICATION
const activateAccountOTP = async (req, res) => {
    try {
        console.log('=== ACTIVATE ACCOUNT OTP VERIFICATION START ===');
        console.log('Request body:', { email: req.body.email, otp: req.body.otp });
        
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Check OTP
        if (user.otp_code !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiration
        if (new Date() > user.otp_expire_at) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Activate user
        user.is_email_verified = true;
        user.is_active = true;
        user.otp_code = undefined;
        user.otp_expire_at = undefined;
        await user.save();

        // Send welcome email
        try {
            await sendWelcomeEmail(email, user.name);
        } catch (emailError) {
            console.error('Welcome email sending failed:', emailError);
            // Don't fail activation if welcome email fails
        }

        console.log('=== ACTIVATE ACCOUNT OTP VERIFICATION SUCCESS ===');
        res.status(200).json({
            success: true,
            message: 'Account activated successfully. You can now login.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    is_email_verified: user.is_email_verified,
                    is_active: user.is_active
                }
            }
        });

    } catch (error) {
        console.error('=== ACTIVATE ACCOUNT OTP VERIFICATION ERROR ===');
        console.error('Activate account OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP verification',
            error: error.message
        });
    }
};

// 12. LOGOUT
const logout = async (req, res) => {
    try {
        console.log('=== LOGOUT START ===');
        const token = req.header('Authorization')?.split(' ')[1];
        console.log('Token to logout:', token ? '[PRESENT]' : '[NOT FOUND]');
        
        if (token) {
            // Remove token from database
            console.log('Removing token from database...');
            await Token.findOneAndDelete({ token: token });
            console.log('Token removed successfully');
        }

        console.log('=== LOGOUT SUCCESS ===');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('=== LOGOUT ERROR ===');
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
            error: error.message
        });
    }
};

module.exports = {
    register,
    registerOTP,
    login,
    forgotPassword,
    forgotPasswordOTP,
    resetPassword,
    activateAccount,
    activateAccountOTP,
    registerResendOTP,
    forgotPasswordResendOTP,
    activateAccountResendOTP,
    logout
};
