const { User } = require('../models/user.model');
const Notification = require('../models/notification.model');
const { sendEmail } = require('../services/emailServices');
//const { sendSMS } = require('../services/smsServices');

const sendHealthUpdateNotification = async (req, res) => {
  const { user_id, family_member_id, health_update_message } = req.body;

  try {
    // Ensure the user ID and family member ID are provided
    if (!user_id || !family_member_id || !health_update_message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the user
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the notification object (Corrected)
    const notification = new Notification({
      user_id: user._id,
      family_member_id,
      message: health_update_message,
    });

    await notification.save(); // Save the notification to the database

    // Send email notification
    if (user.email_notifications) {
      await sendEmail(user.email, health_update_message);
    }

    // Send SMS notification
    if (user.sms_notifications) {
      await sendSMS(user.phone_number, health_update_message); // Assuming user has phone_number field
    }

    return res.status(200).json({ message: 'Health update notification sent successfully' });

  } catch (error) {
    console.error('Error in sending health update notification:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { sendHealthUpdateNotification };
