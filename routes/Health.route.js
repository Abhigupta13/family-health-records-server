const express = require('express');
const { addHealthRecord, getHealthRecords,
        updateHealthRecord,deleteHealthRecord
       } = require('../controllers/HealthController');

const { isAuthenticated } = require('../middlewares/auth.middleware');


const router = express.Router();

// POST route to add a health record
router.post('/family/:id/records', isAuthenticated, addHealthRecord);
router.get('/family/:id/records', isAuthenticated, getHealthRecords);
router.put('/family/:id/records/:recordId', isAuthenticated, updateHealthRecord);
router.delete('/family/:id/records/:recordId', isAuthenticated, deleteHealthRecord);


module.exports = router;
