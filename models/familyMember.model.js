const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  birth_date: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists
const FamilyMember = mongoose.models.FamilyMember || mongoose.model('FamilyMember', familyMemberSchema);

module.exports = FamilyMember;
