const mongoose = require('mongoose');

const emergencyAccessSchema = new mongoose.Schema({
  family_member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const EmergencyAccess = mongoose.model('EmergencyAccess', emergencyAccessSchema);
module.exports = EmergencyAccess;
