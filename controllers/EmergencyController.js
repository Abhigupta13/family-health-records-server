const EmergencyAccess = require('../models/emergencyAccess.model');
const FamilyMember = require('../models/familyMember.model');
const crypto = require('crypto');
const HealthRecord = require('../models/healthRecord.model');
const PDFDocument = require('pdfkit');
const { uploadPDFToS3 } = require('../utils/s3');

const mongoose = require('mongoose');

exports.generateEmergencyAccessLink = async (req, res) => {
    try {
      const { id } = req.params; // Family Member ID
      const userId = req.user.id; // User ID from authenticated user
  
      // Validate the ID format
      if (!mongoose.Types.ObjectId.isValid(id.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid family member ID format' });
      }
  
      // Check if the family member exists
      const familyMember = await FamilyMember.findById(id.trim());
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      // Generate a unique token
      const token = crypto.randomBytes(32).toString('hex');
  
      // Set expiration time (e.g., 24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
  
      // Create a new emergency access entry
      const emergencyAccess = new EmergencyAccess({
        family_member_id: id.trim(),
        token,
        expires_at: expiresAt,
        created_by: userId, // Set the user ID here
      });
  
      await emergencyAccess.save();
  
      // Generate the access link
      const accessLink = `${req.protocol}://${req.get('host')}/emergency-access/${token}`;
  
      return res.status(201).json({
        success: true,
        message: 'Emergency access link generated successfully',
        data: {
          link: accessLink,
          expires_at: expiresAt,
        },
      });
    } catch (error) {
      console.error('Error generating emergency access link:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  

  // Access Emergency Health Information
  exports.accessEmergencyHealthInfo = async (req, res) => {
    try {
      const { id, token } = req.params;
  
      // Validate the token and family member
      const emergencyAccess = await EmergencyAccess.findOne({ family_member_id: id, token });
      if (!emergencyAccess) {
        return res.status(404).json({ success: false, message: 'Invalid or expired access token' });
      }
  
      // Check if the access token is expired
      if (new Date() > emergencyAccess.expires_at) {
        return res.status(403).json({ success: false, message: 'Access token has expired' });
      }
  
      // Fetch the family member's details
      const familyMember = await FamilyMember.findById(id);
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      // Fetch the health records associated with the family member
      const healthRecords = await HealthRecord.find({ family_member_id: id })
        .select('diagnosis medications doctor_name doctor_notes visit_date follow_up_date');
  
      return res.status(200).json({
        success: true,
        message: 'Emergency health information retrieved successfully',
        data: {
          familyMember: {
            id: familyMember._id,
            name: familyMember.name,
            relation: familyMember.relation,
          },
          healthRecords,
        },
      });
    } catch (error) {
      console.error('Error accessing emergency health information:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  
  exports.generateEmergencyPDFURL = async (req, res) => {
    try {
      const { memberId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is required'
        });
      }

      const filename = `health_record_${memberId}_${Date.now()}.pdf`;
      const pdfBuffer = req.file.buffer;

      // Upload to S3 and get signed URL
      const result = await uploadPDFToS3(pdfBuffer, filename);

      if (!result || !result.SignedUrl) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload PDF to S3'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'PDF uploaded successfully',
        data: {
          pdfUrl: result.SignedUrl,
          contentType: 'application/pdf'
        }
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };

exports.uploadPDFToCloudinary = async (req, res) => {
  try {
    const { pdfBase64, memberId } = req.body;

    if (!pdfBase64 || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'PDF data and member ID are required'
      });
    }

    // Remove the data URL prefix
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Upload to S3
    const filename = `health_record_${memberId}_${Date.now()}.pdf`;
    const result = await uploadPDFToS3(pdfBuffer, filename);

    if (!result || !result.SignedUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload PDF to S3',
        error: 'Upload failed'
      });
    }

    // Return the S3 URL
    return res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        pdfUrl: result.SignedUrl
      }
    });

  } catch (error) {
    console.error('Error uploading PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
  