const twilio = require('twilio');

// Twilio credentials
const client = new twilio('your-account-sid', 'your-auth-token');

async function sendSMS(to, message) {
  try {
    await client.messages.create({
      body: message,
      to: to,  // User's phone number
      from: 'your-twilio-number' // Replace with your Twilio number
    });
    console.log('SMS sent to', to);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

module.exports = { sendSMS };
