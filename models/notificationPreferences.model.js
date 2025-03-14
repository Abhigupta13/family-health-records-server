const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  medication_reminders: {
    type: Boolean,
    default: false, // Enable Medication Reminders
  },
  health_alerts: {
    type: Boolean,
    default: false, // Receive Health Alerts
  },
  email_notifications: {
    type: Boolean,
    default: true, // Email Notifications
  },
  sms_notifications: {
    type: Boolean,
    default: true, // SMS Notifications
  },
  app_notifications: {
    type: Boolean,
    default: true, // In-App Notifications
  },
  updated_at: {
    type: Date,
    default: Date.now, // Timestamp for the last update
  },
});

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);
module.exports = NotificationPreferences;
