const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/auth');
const {
  createHealthRecord,
  updateHealthRecord,
  getHealthRecords,
  getHealthRecord,
  deleteHealthRecord,
} = require('../controllers/HealthController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Create a new health record
router.post(
  '/family/:familyMemberId/records',
  protect,
  upload.any(),
  createHealthRecord
);

// Update a health record
router.put(
  '/family/:familyMemberId/records/:id',
  protect,
  upload.any(),
  updateHealthRecord
);

// Get all health records for a family member
router.get('/family/:familyMemberId/records', protect, getHealthRecords);

// Get a single health record
router.get('/family/:familyMemberId/records/:id', protect, getHealthRecord);

// Delete a health record
router.delete('/family/:familyMemberId/records/:id', protect, deleteHealthRecord);

module.exports = router; 