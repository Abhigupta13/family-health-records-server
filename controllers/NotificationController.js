const Notification = require('../models/notification.model');
const NotificationPreferences = require('../models/notificationPreferences.model');
const nodemailer = require('nodemailer');

// Get Notification Preferences
exports.getNotificationsWithPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch notification preferences
    let preferences = await NotificationPreferences.findOne({ user_id: userId });
    
    // If no preferences exist yet, create default preferences
    if (!preferences) {
      preferences = await NotificationPreferences.create({
        user_id: userId,
        medication_reminders: false,
        health_alerts: false,
        email_notifications: false,
        sms_notifications: true,
        app_notifications: true
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: {
        medication_reminders: preferences.medication_reminders,
        health_alerts: preferences.health_alerts,
        email_notifications: preferences.email_notifications,
        sms_notifications: preferences.sms_notifications,
        app_notifications: preferences.app_notifications,
        updated_at: preferences.updated_at
      }
    });
  } catch (error) {
    console.error('Error retrieving notification preferences:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.createNotification = async (req, res) => {
    try {
      const { family_member_id, message } = req.body;
      const userId = req.user.id; // Get user ID from authentication middleware.
  
      const notification = new Notification({
        user_id: userId,
        family_member_id,
        message,
      });
  
      await notification.save();
  
      return res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      console.error('Error creating notification:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };

//Notification read
  exports.markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
  
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
  
      notification.status = 'read';
      notification.read_at = new Date();
      await notification.save();
  
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };

  // Update Notification Preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications } = req.body;

    // Validate the input
    if (!notifications) {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences are required'
      });
    }

    // Validate that all required fields are boolean
    const requiredFields = [
      'medication_reminders',
      'health_alerts',
      'email_notifications',
      'sms_notifications',
      'app_notifications'
    ];

    const invalidFields = requiredFields.filter(
      field => notifications[field] !== undefined && typeof notifications[field] !== 'boolean'
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid values for fields: ${invalidFields.join(', ')}. All preferences must be boolean.`
      });
    }

    // Update preferences in database
    const updatedPreferences = await NotificationPreferences.findOneAndUpdate(
      { user_id: userId },
      {
        $set: {
          medication_reminders: notifications.medication_reminders,
          health_alerts: notifications.health_alerts,
          email_notifications: notifications.email_notifications,
          sms_notifications: notifications.sms_notifications,
          app_notifications: notifications.app_notifications,
          updated_at: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};
