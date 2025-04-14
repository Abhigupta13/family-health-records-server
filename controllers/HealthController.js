const HealthRecord = require('../models/healthRecord.model');
const FamilyMember = require('../models/familyMember.model');

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
        if (result.secure_url) {
          imageUrls.push(result.secure_url); // ✅ Store only valid URLs
        }
      }
    }
    

   // Ensure medications is always an array of strings
const medicationsArray = Array.isArray(medications)
? medications.filter(med => typeof med === "string" && med.trim() !== "")
: (typeof medications === "string" && medications.trim() !== "")
  ? medications.split(",").map(med => med.trim()) // Convert comma-separated string into an array
  : [];


    const newHealthRecord = new HealthRecord({
      family_member_id: familyMemberId,
      illness,
      medications: medicationsArray, // ✅ Store only names as an array of strings
      doctor_name,
      doctor_notes,
      visit_date,
      follow_up_date,
      images: imageUrls,
    });

    await newHealthRecord.save();
    await FamilyMember.updateOne({ _id: familyMemberId }, { last_doctor_visit: visit_date });

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

    // ✅ Get all health records for this family member and order by date
    const healthRecords = await HealthRecord.find({ family_member_id: familyMemberId }).sort({ visit_date: -1 });

    // Combine family member details with health records
    const responseData = {
      familyMember: {
        _id: familyMember._id,
        name: familyMember.name,
        relation: familyMember.relation,
        email: familyMember.email,
        age: familyMember.age,
        birth_date: familyMember.birth_date,
        last_doctor_visit:familyMember.last_doctor_visit,
        gender: familyMember.gender,
        contact_info: familyMember.contact_info,
        address: familyMember.address,
        image: familyMember.image,
      },
      healthRecords: healthRecords,
    };

    return res.status(200).json({
      success: true,
      message: 'Health records retrieved successfully',
      data: responseData,
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
      return res.status(404).json({ success: false, message: "Family member not found" });
    }

    const healthRecord = await HealthRecord.findOne({ _id: recordId, family_member_id: familyMemberId });
    if (!healthRecord) {
      return res.status(404).json({ success: false, message: "Health record not found" });
    }

    // Handle Images
    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      console.log(req.file)
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.path);
        if (result && result.secure_url) { // ✅ Ensure result exists and has a secure_url
          imageUrls.push(result.secure_url);
        }
      }
      if (imageUrls.length > 0) { // ✅ Only update images if valid URLs exist
        updates.images = [...(Array.isArray(healthRecord.images) ? healthRecord.images : []), ...imageUrls];
      }
    }
    

    // Handle Medications
    const medicationsArray = Array.isArray(updates.medications)
      ? updates.medications.filter(med => typeof med === "string" && med.trim() !== "")
      : (typeof updates.medications === "string" && updates.medications.trim() !== "")
        ? updates.medications.split(",").map(med => med.trim()) // Convert comma-separated string into an array
        : [];

    updates.medications = medicationsArray; // Ensure it's always an array

    // Apply updates
    Object.assign(healthRecord, updates);
    healthRecord.updated_at = new Date();
    await healthRecord.save();

    return res.status(200).json({
      success: true,
      message: "Health record updated successfully",
      data: healthRecord,
    });
  } catch (error) {
    console.error("Error updating health record:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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