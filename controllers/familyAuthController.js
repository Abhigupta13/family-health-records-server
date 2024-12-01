const { User } = require('../models/user.model');
const { sendMail } = require('../utils/common');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const FamilyMember = require('../models/FamilyMember.model');

const bcrypt = require('bcrypt');


// Function to add a new family member
exports.addFamilyMembers = async (req, res) => {
    try {
      const { name, relation, age } = req.body;
      const user_id = req.user.id; // Assuming you are attaching the user to the request after authentication
  
      // Create a new family member
      const newFamilyMember = new FamilyMember({
        user_id,
        name,
        relation,
        birth_date: new Date().setFullYear(new Date().getFullYear() - age), // Estimate birth date from age
      });
  
      await newFamilyMember.save();
      return res.status(201).json({ message: 'Family member added successfully', data: newFamilyMember });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Get all family members for the authenticated user
  exports.getFamilyMembers = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming the user is added to the request object by the authentication middleware
      
      // Find all family members for the authenticated user
      const familyMembers = await FamilyMember.find({ user_id: userId }).select('name relation age'); // Select specific fields (name, relation, age)
  
      if (!familyMembers || familyMembers.length === 0) {
        return res.status(404).json({ success: false, message: 'No family members found' });
      }
  
      // Return the list of family members
      res.status(200).json({
        success: true,
        data: familyMembers
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: `Error retrieving family members: ${err.message}` });
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
  
  