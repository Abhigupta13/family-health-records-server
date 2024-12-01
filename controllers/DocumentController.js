const Document = require('../models/document.model');
const HealthRecord = require('../models/healthRecord.model');
const path = require('path');
const fs = require('fs');

// Upload Medical Document
exports.uploadMedicalDocument = async (req, res) => {
  try {
    const { recordId } = req.params;

    // Check if the health record exists
    const healthRecord = await HealthRecord.findById(recordId);
    if (!healthRecord) {
      return res.status(404).json({ success: false, message: 'Health record not found' });
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Create a new document entry
    const document = new Document({
      health_record_id: recordId,
      file_url: `/uploads/${req.file.filename}`, // Assuming local storage
      file_type: req.file.mimetype,
      document_name: req.file.originalname,
    });

    // Save the document to the database
    await document.save();

    return res.status(201).json({
      success: true,
      message: 'Medical document uploaded successfully',
      data: document,
    });
  } catch (error) {
    console.error('Error uploading medical document:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


// Get Medical Documents for a Health Record
exports.getMedicalDocuments = async (req, res) => {
    try {
      const { recordId } = req.params;
  
      // Check if the health record exists
      const healthRecord = await HealthRecord.findById(recordId);
      if (!healthRecord) {
        return res.status(404).json({ success: false, message: 'Health record not found' });
      }
  
      // Find all documents associated with the health record
      const documents = await Document.find({ health_record_id: recordId });
  
      if (documents.length === 0) {
        return res.status(404).json({ success: false, message: 'No documents found for this health record' });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: documents,
      });
    } catch (error) {
      console.error('Error retrieving medical documents:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };

  // Download Medical Document
exports.downloadMedicalDocument = async (req, res) => {
    try {
      const { documentId } = req.params;
  
      // Check if the document exists
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
  
      // Construct the file path
      const filePath = path.join(__dirname, '../uploads', document.file_url.split('/uploads/')[1]);
  
      // Check if the file exists on the server
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found on server' });
      }
  
      // Send the file for download
      return res.download(filePath, document.document_name, (err) => {
        if (err) {
          console.error('Error sending file:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: err.message,
          });
        }
      });
    } catch (error) {
      console.error('Error downloading medical document:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };

 // Delete Medical Document
exports.deleteMedicalDocument = async (req, res) => {
    try {
      const { documentId } = req.params;
  
      // Check if the document exists
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
  
      // Construct the file path
      const filePath = path.join(__dirname, '../uploads', document.file_url.split('/uploads/')[1]);
  
      // Delete the file from the file system
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
      } else {
        console.warn('File not found on server, but removing the document record');
      }
  
      // Remove the document entry from the database
      await Document.findByIdAndDelete(documentId);
  
      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting medical document:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  