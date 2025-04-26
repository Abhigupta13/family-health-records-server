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
          imageUrls.push(result.secure_url);
        }
      }
    }

    const newHealthRecord = new HealthRecord({
      family_member_id: familyMemberId,
      illness,
      medications: medications || "", // Store as string
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
  console.log("update health record")
  try {
    const { id: familyMemberId, recordId } = req.params;
    const {
      illness,
      doctor_name,
      doctor_notes,
      medications,
      blood_pressure,
      heart_rate,
      visit_date,
      follow_up_date,
      existingImages,
      imagesToDelete,
    } = req.body;

    // Check if family member exists
    const familyMember = await FamilyMember.findById(familyMemberId);
    if (!familyMember) {
      return res.status(404).json({ success: false, message: "Family member not found" });
    }

    // Get current health record
    const healthRecord = await HealthRecord.findOne({ _id: recordId, family_member_id: familyMemberId });
    if (!healthRecord) {
      return res.status(404).json({ success: false, message: "Health record not found" });
    }

    // Parse blood pressure
    let parsedBloodPressure = null;
    if (blood_pressure) {
      try {
        let bp = blood_pressure;
        if (typeof bp === 'string') {
          bp = JSON.parse(bp);
        }
        if (bp && typeof bp === 'object') {
          parsedBloodPressure = {
            systolic: bp.systolic ? Number(bp.systolic) : null,
            diastolic: bp.diastolic ? Number(bp.diastolic) : null
          };
        }
      } catch (e) {
        console.error('Error parsing blood pressure:', e);
      }
    }

    // Parse existing images
    let parsedExistingImages = [];
    if (existingImages) {
      try {
        let images = existingImages;
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            images = images
              .replace(/[\[\]"]/g, '')
              .split(',')
              .map(url => url.trim())
              .filter(url => url.length > 0);
          }
        }
        if (Array.isArray(images)) {
          parsedExistingImages = images.filter(url => typeof url === 'string' && url.startsWith('http'));
        }
      } catch (e) {
        console.error('Error parsing existing images:', e);
      }
    }

    // Parse images to delete
    let parsedImagesToDelete = [];
    if (imagesToDelete) {
      try {
        let images = imagesToDelete;
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            images = images
              .replace(/[\[\]"]/g, '')
              .split(',')
              .map(url => url.trim())
              .filter(url => url.length > 0);
          }
        }
        if (Array.isArray(images)) {
          parsedImagesToDelete = images.filter(url => typeof url === 'string' && url.startsWith('http'));
        }
      } catch (e) {
        console.error('Error parsing images to delete:', e);
      }
    }

    // Handle new image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.path);
        if (result.secure_url) {
          imageUrls.push(result.secure_url);
        }
      }
    }

    // Start with existing images
    let finalImages = parsedExistingImages;

    // Remove images that are marked for deletion
    finalImages = finalImages.filter(img => !parsedImagesToDelete.includes(img));

    // Add new images
    finalImages = [...finalImages, ...imageUrls];

    // Validate heart rate
    let validatedHeartRate = null;
    if (heart_rate !== undefined && heart_rate !== null) {
      const parsedHeartRate = Number(heart_rate);
      if (!isNaN(parsedHeartRate)) {
        validatedHeartRate = parsedHeartRate;
      }
    }

    // Prepare update data
    const updateData = {
      illness,
      doctor_name,
      doctor_notes,
      medications: medications || "", // Store as string
      blood_pressure: parsedBloodPressure,
      heart_rate: validatedHeartRate,
      visit_date: visit_date ? new Date(visit_date) : undefined,
      follow_up_date: follow_up_date ? new Date(follow_up_date) : undefined,
      images: finalImages,
      // updated_at: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update the health record
    const updatedRecord = await HealthRecord.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Health record updated successfully",
      data: updatedRecord,
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