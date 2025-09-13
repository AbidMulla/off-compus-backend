const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Successful - FresherJobCampus',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset Successful</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-icon { font-size: 48px; color: #28a745; margin-bottom: 20px; }
                        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset Successful</h1>
                        </div>
                        <div class="content">
                            <div style="text-align: center;">
                                <div class="success-icon">✅</div>
                                <h2>Hello ${name}!</h2>
                            </div>
                            
                            <p>Great news! Your password has been successfully reset.</p>
                            
                            <p><strong>What happened:</strong></p>
                            <ul>
                                <li>✅ Your password was successfully changed</li>
                                <li>🔒 All existing login sessions have been terminated for security</li>
                                <li>🛡️ Your account is now protected with your new password</li>
                            </ul>
                            
                            <p><strong>Next steps:</strong></p>
                            <ul>
                                <li>You can now log in with your new password</li>
                                <li>Make sure to use a strong, unique password</li>
                                <li>If you didn't request this change, please contact support immediately</li>
                            </ul>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" class="button">Login to Your Account</a>
                            </div>
                            
                            <p><strong>Security Tips:</strong></p>
                            <ul>
                                <li>Never share your password with anyone</li>
                                <li>Use a different password for each account</li>
                                <li>Enable two-factor authentication if available</li>
                                <li>Log out from shared devices</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p>This email was sent from FresherJobCampus</p>
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Password reset success email sent to:', email);
    } catch (error) {
        console.error('Error sending password reset success email:', error);
        throw error;
    }
};

module.exports = {
    sendPasswordResetSuccessEmail
};
