const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Accessing email from .env
    pass: process.env.EMAIL_PASS   // Accessing password from .env
  }
});

async function sendEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',  // Replace with your email
      to: to,
      subject: subject,
      text: message
    });
    console.log('Email sent to', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendEmail };
