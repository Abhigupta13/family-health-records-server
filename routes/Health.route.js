const express = require('express');
const { addHealthRecord, getAllHealthRecords,getHealthRecordsByMember,
        updateHealthRecord,deleteHealthRecord
       } = require('../controllers/HealthController');

const { isAuthenticated } = require('../middlewares/auth.middleware');

const upload = require('../middlewares/multer.js');
const router = express.Router();

// POST route to add a health record
router.post('/family/:id/records', isAuthenticated, upload.array('images', 5), addHealthRecord);
router.get('/family/all',isAuthenticated, getAllHealthRecords); 
router.get('/family/:id', isAuthenticated, getHealthRecordsByMember);
router.put('/family/:id/records/:recordId', isAuthenticated,upload.array('images', 5), updateHealthRecord);
router.delete('/family/:id/records/:recordId', isAuthenticated, deleteHealthRecord);


module.exports = router;
