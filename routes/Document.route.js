const express = require('express');
const { uploadMedicalDocument,getMedicalDocuments,downloadMedicalDocument,deleteMedicalDocument } = require('../controllers/DocumentController');
const upload = require('../middlewares/upload.middleware');
const { isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST route to upload a medical document
router.post(
  '/family/:id/records/:recordId/documents',
  isAuthenticated, // Middleware to check authentication
  upload.single('document'), // Multer middleware to handle single file upload
  uploadMedicalDocument // Controller function
);

//to retrive the data;
router.get('/family/:id/records/:recordId/documents', isAuthenticated, getMedicalDocuments);

// GET route to download a specific medical document
router.get(
    '/family/:id/records/:recordId/documents/:documentId',
    isAuthenticated, // Middleware to check authentication
    downloadMedicalDocument // Controller function
);

router.delete('/family/:id/records/:recordId/documents/:documentId', isAuthenticated, deleteMedicalDocument);

module.exports = router;


