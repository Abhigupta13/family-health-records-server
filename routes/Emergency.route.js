const express = require('express');
const { generateEmergencyAccessLink,accessEmergencyHealthInfo } = require('../controllers/EmergencyController');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST route to generate an emergency access link
router.post('/family/:id/emergency-access', isAuthenticated, generateEmergencyAccessLink);
// GET route to access emergency health information
router.get('/family/:id/emergency-access/:token', accessEmergencyHealthInfo);

module.exports = router;
