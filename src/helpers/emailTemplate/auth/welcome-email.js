const { sendEmailWithTemplate } = require('../../../config/smtpConfig');

module.exports.sendWelcomeEmail = async (email, name = 'User') => {
    try {
        console.log('Preparing to send welcome email to:', email);

        const mailSubject = "🎉 Welcome to FresherJobCampus!";
        const body = `
        <!doctype html>
        <html lang="en-US">
        <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Welcome to FresherJobCampus</title>
        <style type="text/css">
            body { font-family: 'Open Sans', sans-serif; background-color: #f2f3f8; margin: 0; }
            table { border-collapse: collapse; width: 100%; }
            .email-wrapper { max-width: 670px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
            .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
            .email-header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .email-content { padding: 40px 30px; color: #455056; font-size: 15px; line-height: 1.6; }
            .email-content h2 { color: #667eea; font-size: 22px; margin-bottom: 15px; text-align: center; }
            .email-content p { margin: 0 0 20px; text-align: justify; }
            .welcome-features { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #667eea; }
            .email-footer { background-color: #f7f7f7; padding: 20px; text-align: center; color: #999; font-size: 14px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        </style>
        </head>
        <body>
        <table>
            <tr>
            <td align="center">
                <table class="email-wrapper">
                <tr>
                    <td class="email-header">
                    <h1>🎉 Welcome to FresherJobCampus!</h1>
                    </td>
                </tr>
                <tr>
                    <td class="email-content">
                    <h2>Hello ${name}!</h2>
                    <p>Welcome to FresherJobCampus! We're thrilled to have you join our community of job seekers and career builders. Your account has been successfully activated and you're now ready to explore amazing opportunities.</p>
                    
                    <div class="welcome-features">
                        <h3 style="color: #667eea; margin-top: 0;">What you can do now:</h3>
                        <div class="feature-item">
                            <strong>🔍 Browse Jobs:</strong> Explore thousands of job opportunities across various industries
                        </div>
                        <div class="feature-item">
                            <strong>📚 Access Courses:</strong> Enhance your skills with our comprehensive course library
                        </div>
                        <div class="feature-item">
                            <strong>📱 Get Notifications:</strong> Receive instant alerts for new job postings
                        </div>
                        <div class="feature-item">
                            <strong>💼 Build Profile:</strong> Create a professional profile to attract employers
                        </div>
                    </div>

                    <p>We're here to support your career journey every step of the way. If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                    
                    <div style="text-align: center;">
                        <a href="#" class="cta-button">Start Exploring Jobs</a>
                    </div>

                    <p>Thank you for choosing FresherJobCampus. We wish you the best of luck in your career journey!</p>
                    </td>
                </tr>
                <tr>
                    <td class="email-footer">
                    <p>© 2024 FresherJobCampus. All rights reserved.</p>
                    <p>Follow us on social media for the latest updates!</p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        `;

        console.log('Attempting to send welcome email...');
        const result = await sendEmailWithTemplate(email, mailSubject, body);
        console.log('Welcome email sent successfully!');
        console.log('Email result:', result);
        console.log('=== Welcome Email Process Completed ===\n');

        return result;

    } catch (error) {
        console.error('Failed to send welcome email:');
        console.error('Error:', error);
        console.error('=== Welcome Email Process Failed ===\n');
        return { success: false, message: "Failed to send email" };
    }
}
