const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // 🔗 Reference to User model
    required: true 
  },
  name: { type: String, required: true },
  relation: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // ✅ Allow unique emails but ignore `null` values
  birth_date: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  contact_info: { type: String },
  address: { type: String },
});

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
module.exports = FamilyMember;
