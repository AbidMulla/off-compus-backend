const { sendEmailWithTemplate } = require('../../../config/smtpConfig');

module.exports.sendRegisterOtpEmail = async (email, otp = '1234') => {
    try {
        console.log('Preparing to send OTP email to:', email);
    
        const mailSubject = "✅ Verify Your Email to Get Started ✨";
        const body = `
        <!doctype html>
        <html lang="en-US">
        <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Email Verification</title>
        <style type="text/css">
            body { font-family: 'Open Sans', sans-serif; background-color: #f2f3f8; margin: 0; }
            table { border-collapse: collapse; width: 100%; }
            .email-wrapper { max-width: 670px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
            .email-header { background-color: #0c5394; padding: 20px; text-align: center; color: #ffffff; }
            .email-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .email-content { padding: 40px 30px; color: #455056; font-size: 15px; line-height: 1.6; }
            .email-content h2 { color: #1d9bf0; font-size: 20px; margin-bottom: 10px; text-align: center; }
            .email-content p { margin: 0 0 20px; text-align: justify; }
            .otp-code { font-size: 20px; color: #0c5394; font-weight: bold; text-align: center; margin: 20px 0; }
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
                    <h1 id="heading">Account Activation</h1>
                    </td>
                </tr>
                <tr>
                    <td class="email-content">
                    <h2 id="topRegards">Hello,</h2>
                    <p id="firstContent">To activate your account, please use the One-Time Password (OTP) provided below. Kindly note that this OTP is valid for only 5 minutes.</p>
                    <div class="otp-code"><p style="font-weight: bolder; color:black; ">OTP: ${otp}</p></div>
                    <p id="lastContent">If you did not register for an account, please ignore this email or contact support.</p>
                    </td>
                </tr>
                <tr>
                    <td class="email-footer">
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        `;
    
        console.log('Attempting to send OTP email...');
        const result = await sendEmailWithTemplate(email, mailSubject, body);
        console.log('OTP email sent successfully!');
        console.log('Email result:', result);
        console.log('=== Register OTP Email Process Completed ===\n');
    
        return result;
    
    } catch (error) {
        console.error('Failed to send OTP email:');
        console.error('Error:', error);
        console.error('=== Register OTP Email Process Failed ===\n');
        return { success: false, message: "Failed to send email" };
    }
}
