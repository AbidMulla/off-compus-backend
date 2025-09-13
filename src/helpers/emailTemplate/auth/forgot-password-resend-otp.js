const { sendEmailWithTemplate } = require('../../../config/smtpConfig');

module.exports.sendForgotPasswordResendOtpEmail = async (email, otp = '1234') => {
    try {
        console.log('Preparing to send forgot password resend OTP email to:', email);

        const mailSubject = "🔄 New Password Reset OTP";
        const body = `
        <!doctype html>
        <html lang="en-US">
        <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Password Reset OTP Resend</title>
        <style type="text/css">
            body { font-family: 'Open Sans', sans-serif; background-color: #f2f3f8; margin: 0; }
            table { border-collapse: collapse; width: 100%; }
            .email-wrapper { max-width: 670px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
            .email-header { background-color: #ffc107; padding: 20px; text-align: center; color: #ffffff; }
            .email-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .email-content { padding: 40px 30px; color: #455056; font-size: 15px; line-height: 1.6; }
            .email-content h2 { color: #ffc107; font-size: 20px; margin-bottom: 10px; text-align: center; }
            .email-content p { margin: 0 0 20px; text-align: justify; }
            .otp-code { font-size: 20px; color: #ffc107; font-weight: bold; text-align: center; margin: 20px 0; }
            .email-footer { background-color: #f7f7f7; padding: 20px; text-align: center; color: #999; font-size: 14px; }
        </style>
        </head>
        <body>
        <table>
            <tr>
            <td align="center">
                <table class="email-wrapper">
                <tr>
                    <td class="email-header">
                    <h1>New Password Reset OTP</h1>
                    </td>
                </tr>
                <tr>
                    <td class="email-content">
                    <h2>Hello,</h2>
                    <p>You have requested a new One-Time Password (OTP) for password reset. Please use the OTP provided below to reset your password. This OTP is valid for only 5 minutes.</p>
                    <div class="otp-code"><p style="font-weight: bolder; color:black;">OTP: ${otp}</p></div>
                    <p>If you did not request this new OTP, please ignore this email or contact support immediately.</p>
                    </td>
                </tr>
                <tr>
                    <td class="email-footer">
                    <p>© 2024 FresherJobCampus. All rights reserved.</p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        `;

        console.log('Attempting to send forgot password resend OTP email...');
        const result = await sendEmailWithTemplate(email, mailSubject, body);
        console.log('Forgot password resend OTP email sent successfully!');
        console.log('Email result:', result);
        console.log('=== Forgot Password Resend OTP Email Process Completed ===\n');

        return result;

    } catch (error) {
        console.error('Failed to send forgot password resend OTP email:');
        console.error('Error:', error);
        console.error('=== Forgot Password Resend OTP Email Process Failed ===\n');
        return { success: false, message: "Failed to send email" };
    }
}
