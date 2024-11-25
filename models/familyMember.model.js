const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  relation: {
    type: String,
    required: true
  },
  birth_date: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  profile_image: {
    type: String
  },
  contact_info: {
    type: String
  },
  address: {
    type: String
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

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
module.exports = FamilyMember;
