const express = require('express');
const { generateEmergencyAccessLink, accessEmergencyHealthInfo, generateEmergencyPDFURL } = require('../controllers/EmergencyController');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const router = express.Router();

// POST route to generate an emergency access link
router.post('/family/:id/emergency-access', isAuthenticated, generateEmergencyAccessLink);
// GET route to access emergency health information
router.get('/family/:id/emergency-access/:token', accessEmergencyHealthInfo);
// GET route to download emergency health record as PDF
router.post('/download/:memberId',isAuthenticated, generateEmergencyPDFURL);

// POST route to generate and upload PDF
router.post('/download/:memberId', isAuthenticated, upload.single('pdf'), generateEmergencyPDFURL);

module.exports = router;
