const nodemailer = require('nodemailer');
require('dotenv').config(); // To load SMTP credentials from .env file

// SMTP Configuration
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

// Create an SMTP transport
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // Use SSL for 465, TLS for others
  requireTLS: true, // Forces the use of TLS/STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});


// Test SMTP connection
const testSmtpConnection = async () => {
  try {
    await transporter.verify(); // Verifies if SMTP connection is valid
    console.log('SMTP server is ready to take messages.');
  } catch (error) {
    console.error('SMTP connection test failed:', error);
  }
};

// 1. Send plain text email
const sendEmailWithText = async (to, subject, textContent) => {
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Subject of the email
      text: textContent // Plain text body of the email
    });
    console.log('Plain text email sent successfully:', info);
  } catch (error) {
    console.error('Error sending plain text email:', error);
  }
};

// 2. Send HTML email (template)
const sendEmailWithTemplate = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to,
      subject,
      html: htmlContent
    });
    console.log('HTML template email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending HTML template email:', error);
  }
};

// 3. Send email with attachments
const sendEmailWithAttachment = async (to, subject, textContent, attachments) => {
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Subject of the email
      text: textContent, // Plain text body of the email
      attachments: attachments // Array of attachments
    });
    console.log('Email with attachments sent successfully:', info);
  } catch (error) {
    console.error('Error sending email with attachments:', error);
  }
};

// Test the SMTP connection when the script runs
testSmtpConnection();

// Export the functions for use in other parts of your application
module.exports = { sendEmailWithText, sendEmailWithTemplate, sendEmailWithAttachment };
