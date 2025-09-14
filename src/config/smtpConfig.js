const nodemailer = require('nodemailer');
require('dotenv').config(); // To load SMTP credentials from .env file

// SMTP Configuration
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

// Check if SMTP configuration is available
const isSmtpConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

let transporter = null;

// Create an SMTP transport only if configuration is available
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // Use SSL for 465, TLS for others
    requireTLS: true, // Forces the use of TLS/STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
} else {
  console.log('SMTP configuration not found. Email functionality will be disabled.');
  console.log('To enable email functionality, please set the following environment variables:');
  console.log('- SMTP_HOST');
  console.log('- SMTP_PORT');
  console.log('- SMTP_USER');
  console.log('- SMTP_PASS');
}

// Test SMTP connection
const testSmtpConnection = async () => {
  if (!isSmtpConfigured) {
    console.log('Skipping SMTP connection test - configuration not available');
    return;
  }
  
  try {
    await transporter.verify(); // Verifies if SMTP connection is valid
    console.log('SMTP server is ready to take messages.');
  } catch (error) {
    console.error('SMTP connection test failed:', error);
  }
};

// 1. Send plain text email
const sendEmailWithText = async (to, subject, textContent) => {
  if (!isSmtpConfigured) {
    console.log('SMTP not configured. Email not sent:', { to, subject });
    return null;
  }
  
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Subject of the email
      text: textContent // Plain text body of the email
    });
    console.log('Plain text email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending plain text email:', error);
    return null;
  }
};

// 2. Send HTML email (template)
const sendEmailWithTemplate = async (to, subject, htmlContent) => {
  if (!isSmtpConfigured) {
    console.log('SMTP not configured. Email not sent:', { to, subject });
    return null;
  }
  
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
    return null;
  }
};

// 3. Send email with attachments
const sendEmailWithAttachment = async (to, subject, textContent, attachments) => {
  if (!isSmtpConfigured) {
    console.log('SMTP not configured. Email not sent:', { to, subject });
    return null;
  }
  
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER, // Sender's email address
      to, // Recipient's email address
      subject, // Subject of the email
      text: textContent, // Plain text body of the email
      attachments: attachments // Array of attachments
    });
    console.log('Email with attachments sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending email with attachments:', error);
    return null;
  }
};

// Test the SMTP connection when the script runs
testSmtpConnection();

// Export the functions for use in other parts of your application
module.exports = { sendEmailWithText, sendEmailWithTemplate, sendEmailWithAttachment };
