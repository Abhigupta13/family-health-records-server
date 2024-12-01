const express = require('express');
const { getNotificationsWithPreferences, createNotification,markNotificationAsRead,updateNotificationPreferences, } = require('../controllers/NotificationController');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();


// Update notification preferences
router.put('/preferences', isAuthenticated, updateNotificationPreferences);


// GET route for notification preferences and notifications
router.get('/preferences', isAuthenticated, getNotificationsWithPreferences);

//POST route to create a notification
router.post('/', isAuthenticated, createNotification);

// PUT route to mark a notification as read
router.put('/:notificationId/read', isAuthenticated, markNotificationAsRead);

module.exports = router;
