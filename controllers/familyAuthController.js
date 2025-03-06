const { User } = require('../models/user.model');
const { sendMail } = require('../utils/common');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const FamilyMember = require('../models/FamilyMember.model');
const uploadToCloudinary = require('../utils/cloudinary.js');
const HealthRecord = require('../models/HealthRecord.model');

const bcrypt = require('bcrypt');


// Function to add a new family member
exports.addFamilyMembers = async (req, res) => {
  try {
    const { name, relation, email } = req.body;
    const userId = req.user.id; // ✅ Get user ID from authenticated request

    if (!name || !relation) {
      return res.status(400).json({ success: false, message: 'Name and relation are required' });
    }

    // ✅ Prevent duplicate email for different users
    if (email) {
      const existingMember = await FamilyMember.findOne({ email, user_id: userId });
      if (existingMember) {
        return res.status(400).json({ success: false, message: 'Email already exists for this user' });
      }
    }

    const newMember = new FamilyMember({
      user_id: userId, // ✅ Associate family member with the user
      name,
      relation,
      email: email || null,
    });

    await newMember.save();

    return res.status(201).json({ success: true, message: 'Family member added successfully', data: newMember });
  } catch (error) {
    console.error('Error adding family member:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

  
  // Get all family members for the authenticated user
  exports.getFamilyMembers = async (req, res) => {
    try {
      const userId = req.user.id; // ✅ Get user ID from token
  
      const familyMembers = await FamilyMember.find({ user_id: userId });
  
      if (!familyMembers.length) {
        return res.status(404).json({ success: false, message: 'No family members found' });
      }
  
      return res.status(200).json({ success: true, data: familyMembers });
    } catch (error) {
      console.error('Error retrieving family members:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  };
  // Get all health records for the authenticated user's family member
  exports.getMemberDetails = async (req, res) => {
    try {
      const userId = req.user.id; // ✅ Get user ID from token
      const memberId = req.params.id;
      const healthRecords = await HealthRecord.find({ family_member_id: memberId });

      if (!healthRecords.length) {
        return res.status(404).json({ success: false, message: 'No health records found' });
      }

      return res.status(200).json({ success: true, data: healthRecords });
    } catch (error) {
      console.error('Error retrieving health records:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  };
  
  
  exports.updateFamilyMembers = async (req, res) => {
    try {
      const familyMemberId = req.params.id;
      const updatedData = req.body;
      
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.path);
        updatedData.image = uploadResult.secure_url;
      }
  
      const familyMember = await FamilyMember.findByIdAndUpdate(familyMemberId, updatedData, { new: true });
  
      if (!familyMember) {
        return res.status(404).json({ message: 'Family member not found' });
      }
  
      res.status(200).json({ message: 'Family member updated successfully', data: familyMember });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating family member', error: err.message });
    }
  };
  
  
  // Update Family Member details
  exports.updateFamilyMembers = async (req, res) => {
    try {
      // Extract family member ID from the URL parameter
      const familyMemberId = req.params.id;
  
      // Extract the updated data from the request body
      const updatedData = req.body;
  
      // Find the family member by ID
      const familyMember = await FamilyMember.findById(familyMemberId);
      if (!familyMember) {
        return res.status(404).json({ message: 'Family member not found' });
      }
  
      // Update all attributes in the family member object with the new data
      Object.assign(familyMember, updatedData);
  
      // Save the updated family member to the database
      await familyMember.save();
  
      // Return the updated family member details
      res.status(200).json({
        message: 'Family member updated successfully',
        data: familyMember
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating family member', error: err.message });
    }
  };
  
  // Delete Family Member
  exports.deleteFamilyMembers = async (req, res) => {
    try {
      // Extract family member ID from the URL parameter
      const familyMemberId = req.params.id;
  
      // Find and delete the family member by ID
      const deletedFamilyMember = await FamilyMember.findByIdAndDelete(familyMemberId);
      
      // If the family member does not exist, return an error
      if (!deletedFamilyMember) {
        return res.status(404).json({ message: 'Family member not found' });
      }
  
      // Return a success message
      res.status(200).json({
        message: 'Family member deleted successfully',
        data: deletedFamilyMember
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting family member', error: err.message });
    }
  };
  
  