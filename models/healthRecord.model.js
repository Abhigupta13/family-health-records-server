const mongoose = require('mongoose');

const bloodPressureSchema = new mongoose.Schema({
  systolic: {
    type: Number,
    min: 60,
    max: 250
  },
  diastolic: {
    type: Number,
    min: 40,
    max: 150
  }
}, { _id: false });

const healthRecordSchema = new mongoose.Schema({
  family_member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  doctor_name: {
    type: String,
  },
  doctor_notes: {
    type: String,
  },
  medications: {
    type: String,
    default: ""
  },
  blood_pressure: {
    type: bloodPressureSchema,
  },
  heart_rate: {
    type: Number,
    min: 40,
    max: 200,
    default: null
  },
  visit_date: {
    type: Date,
    required: true,
  },
  follow_up_date: {
    type: Date,
  },
  images: [{ type: String }], 
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);

module.exports = HealthRecord;
