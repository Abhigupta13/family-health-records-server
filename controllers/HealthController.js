const HealthRecord = require('../models/healthRecord.model');
const FamilyMember = require('../models/FamilyMember.model');

// Add Health Record
exports.addHealthRecord = async (req, res) => {
  try {
    const familyMemberId = req.params.id;
    const { illness, medications, doctor_name, doctor_notes, visit_date, follow_up_date } = req.body;

    // Check if the family member exists
    const familyMember = await FamilyMember.findById(familyMemberId);
    if (!familyMember) {
      return res.status(404).json({ message: 'Family member not found' });
    }

    // Create a new health record
    const newHealthRecord = new HealthRecord({
      family_member_id: familyMemberId,
      illness,
      medications,
      doctor_name,
      doctor_notes,
      visit_date,
      follow_up_date,
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


// Get Health Records
exports.getHealthRecords = async (req, res) => {
    try {
      const familyMemberId = req.params.id;
  
      // Check if the family member exists
      const familyMember = await FamilyMember.findById(familyMemberId);
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      // Retrieve all health records for the family member
      const healthRecords = await HealthRecord.find({ family_member_id: familyMemberId });
  
      // Check if any health records exist
      if (!healthRecords || healthRecords.length === 0) {
        return res.status(404).json({ success: false, message: 'No health records found' });
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


  // Update Health Record
exports.updateHealthRecord = async (req, res) => {
    try {
      const { id: familyMemberId, recordId } = req.params;
      const updates = req.body;
  
      // Check if the family member exists
      const familyMember = await FamilyMember.findById(familyMemberId);
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      // Find the health record to update
      const healthRecord = await HealthRecord.findOne({ _id: recordId, family_member_id: familyMemberId });
      if (!healthRecord) {
        return res.status(404).json({ success: false, message: 'Health record not found' });
      }
  
      // Update the health record
      Object.assign(healthRecord, updates);
      healthRecord.updated_at = new Date(); // Update the timestamp
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