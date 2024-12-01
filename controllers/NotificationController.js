const Notification = require('../models/notification.model');
const NotificationPreferences = require('../models/notificationPreferences.model');
const nodemailer = require('nodemailer');

// Get Notification Preferences and Notifications
exports.getNotificationsWithPreferences = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is populated by authentication middleware.

    // Fetch notification preferences
    const preferences = await NotificationPreferences.findOne({ user_id: userId });
    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Notification preferences not found',
      });
    }

    // Fetch notifications for the user
    const notifications = await Notification.find({ user_id: userId }).sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      message: 'Notification preferences and notifications retrieved successfully',
      data: {
        preferences,
        notifications,
      },
    });
  } catch (error) {
    console.error('Error retrieving notifications:', error.message);
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
      const userId = req.user.id; // Get user ID from the authentication middleware
      const { email_notifications, sms_notifications, app_notifications } = req.body;
  
      // Validate input (optional: add stricter validation as needed)
      if (
        typeof email_notifications !== 'boolean' &&
        typeof sms_notifications !== 'boolean' &&
        typeof app_notifications !== 'boolean'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input: preferences must be boolean values',
        });
      }
  
      // Find and update the user's notification preferences
      const preferences = await NotificationPreferences.findOneAndUpdate(
        { user_id: userId },
        { email_notifications, sms_notifications, app_notifications, updated_at: Date.now() },
        { new: true, upsert: true } // Create if not found
      );
  
      return res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: preferences,
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
