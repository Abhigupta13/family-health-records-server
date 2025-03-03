const HealthRecord = require('../models/healthRecord.model');
const FamilyMember = require('../models/FamilyMember.model');

const uploadToCloudinary = require('../utils/cloudinary.js');

exports.addHealthRecord = async (req, res) => {
  try {
    const familyMemberId = req.params.id;
    const { illness, medications, doctor_name, doctor_notes, visit_date, follow_up_date } = req.body;

    const familyMember = await FamilyMember.findById(familyMemberId);
    if (!familyMember) {
      return res.status(404).json({ message: 'Family member not found' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.path);
        imageUrls.push(result.secure_url);
      }
    }

    const newHealthRecord = new HealthRecord({
      family_member_id: familyMemberId,
      illness,
      medications: JSON.parse(medications), // Parse JSON if sending array as string
      doctor_name,
      doctor_notes,
      visit_date,
      follow_up_date,
      images: imageUrls, // ✅ Store image URLs
    });

    await newHealthRecord.save();

    return res.status(201).json({
      success: true,
      message: 'Health record added successfully',
      data: newHealthRecord,
    });
  } catch (error) {
    console.error('Error adding health record:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.getAllHealthRecords = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Get user ID from auth token

    // ✅ Find all family members of this user
    const familyMembers = await FamilyMember.find({ user_id: userId }).select('_id name relation');

    if (familyMembers.length === 0) {
      return res.status(404).json({ success: false, message: 'No family members found' });
    }

    // ✅ Get all health records for these family members
    const healthRecords = await HealthRecord.find({
      family_member_id: { $in: familyMembers.map(member => member._id) }
    }).populate('family_member_id', 'name relation');

    if (healthRecords.length === 0) {
      return res.status(404).json({ success: false, message: 'No health records found' });
    }

    return res.status(200).json({
      success: true,
      message: 'All health records retrieved successfully',
      data: healthRecords,
    });
  } catch (error) {
    console.error('Error retrieving all health records:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.getHealthRecordsByMember = async (req, res) => {
  try {
    const { id: familyMemberId } = req.params;

    // ✅ Check if family member exists
    const familyMember = await FamilyMember.findById(familyMemberId);
    if (!familyMember) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    // ✅ Get all health records for this family member
    const healthRecords = await HealthRecord.find({ family_member_id: familyMemberId });

    if (healthRecords.length === 0) {
      return res.status(404).json({ success: false, message: 'No health records found for this member' });
    }

    return res.status(200).json({
      success: true,
      message: 'Health records retrieved successfully',
      data: healthRecords,
    });
  } catch (error) {
    console.error('Error retrieving health records:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



  exports.updateHealthRecord = async (req, res) => {
    try {
      const { id: familyMemberId, recordId } = req.params;
      const updates = req.body;
  
      const familyMember = await FamilyMember.findById(familyMemberId);
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      const healthRecord = await HealthRecord.findOne({ _id: recordId, family_member_id: familyMemberId });
      if (!healthRecord) {
        return res.status(404).json({ success: false, message: 'Health record not found' });
      }
  
      if (req.files && req.files.length > 0) {
        let imageUrls = [];
        for (let file of req.files) {
          const result = await uploadToCloudinary(file.path);
          imageUrls.push(result.secure_url);
        }
        updates.images = [...healthRecord.images, ...imageUrls]; // Append new images
      }
  
      Object.assign(healthRecord, updates);
      healthRecord.updated_at = new Date();
      await healthRecord.save();
  
      return res.status(200).json({
        success: true,
        message: 'Health record updated successfully',
        data: healthRecord,
      });
    } catch (error) {
      console.error('Error updating health record:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  

  
// Delete Health Record
exports.deleteHealthRecord = async (req, res) => {
    try {
      const { id: familyMemberId, recordId } = req.params;
  
      // Check if the family member exists
      const familyMember = await FamilyMember.findById(familyMemberId);
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      // Find and delete the health record
      const deletedHealthRecord = await HealthRecord.findOneAndDelete({
        _id: recordId,
        family_member_id: familyMemberId,
      });
  
      if (!deletedHealthRecord) {
        return res.status(404).json({ success: false, message: 'Health record not found' });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Health record deleted successfully',
        data: deletedHealthRecord,
      });
    } catch (error) {
      console.error('Error deleting health record:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };