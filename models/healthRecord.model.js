const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  family_member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true
  },
  illness: {
    type: String,
    required: true
  },
  doctor_name: {
    type: String
  },
  doctor_notes: {
    type: String
  },
  medication: {
    type: String
  },
  visit_date: {
    type: Date,
    required: true
  },
  follow_up_date: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
module.exports = HealthRecord;
