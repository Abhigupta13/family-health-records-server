const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  email_notifications: {
    type: Boolean,
    default: true, // Enable email notifications by default
  },
  sms_notifications: {
    type: Boolean,
    default: true, // Enable SMS notifications by default
  },
  app_notifications: {
    type: Boolean,
    default: true, // Enable app notifications by default
  },
  updated_at: {
    type: Date,
    default: Date.now, // Timestamp for the last update
  },
});

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
module.exports = NotificationPreferences;
