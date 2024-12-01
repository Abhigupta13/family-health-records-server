const FamilyMember = require('../models/FamilyMember.model');
const HealthRecord = require('../models/healthRecord.model');

exports.getHealthOverview = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Get all family members
      const familyMembers = await FamilyMember.find({ user_id: userId });
  
      if (familyMembers.length === 0) {
        return res.status(404).json({ success: false, message: 'No family members found' });
      }
  
      // Fetch ongoing treatments
      const healthOverview = await Promise.all(
        familyMembers.map(async (member) => {
          const healthRecords = await HealthRecord.find({
            family_member_id: member._id,
            $or: [
              { follow_up_date: { $gte: new Date() } },
              { visit_date: { $lte: new Date() } },
            ],
          }).select('illness medications doctor_name doctor_notes visit_date follow_up_date');
  
          return {
            familyMember: {
              id: member._id,
              name: member.name,
              relation: member.relation,
            },
            ongoingTreatments: healthRecords,
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        message: 'Health overview retrieved successfully',
        data: healthOverview,
      });
    } catch (error) {
      console.error('Error fetching health overview:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  

// Get Family Member Health Timeline
exports.getHealthTimeline = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the family member exists
      const familyMember = await FamilyMember.findById(id);
      if (!familyMember) {
        return res.status(404).json({ success: false, message: 'Family member not found' });
      }
  
      // Fetch all health records for the family member
      const healthTimeline = await HealthRecord.find({ family_member_id: id })
        .sort({ visit_date: 1 }) // Sort by visit_date in ascending order
        .select('illness medications doctor_name doctor_notes visit_date follow_up_date');
  
      if (healthTimeline.length === 0) {
        return res.status(404).json({ success: false, message: 'No health records found for this family member' });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Health timeline retrieved successfully',
        data: {
          familyMember: {
            id: familyMember._id,
            name: familyMember.name,
            relation: familyMember.relation,
            age: familyMember.age,
          },
          timeline: healthTimeline,
        },
      });
    } catch (error) {
      console.error('Error fetching health timeline:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
