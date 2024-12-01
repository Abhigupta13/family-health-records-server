const express = require('express');
const router = express.Router();
const { sendHealthUpdateNotification } = require('../controllers/healthUpdateController');

// Route to send health update notifications
router.post('/send-health-update', sendHealthUpdateNotification);

module.exports = router;
