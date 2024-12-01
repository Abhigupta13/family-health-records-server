const express = require('express');
const { getHealthOverview, getHealthTimeline  } = require('../controllers/DashboardController');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET route for health overview
router.get('/dashboard', isAuthenticated, getHealthOverview);
// GET route for health timeline of a family member
router.get('/family/:id/timeline', isAuthenticated, getHealthTimeline);

module.exports = router;
