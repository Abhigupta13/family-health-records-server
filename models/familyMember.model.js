const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, required: true },
  relation: { type: String},
  email: { type: String },
  birth_date: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  contact_info: { type: String },
  last_doctor_visit:{type:Date},
  address: { type: String },
  age:{type :String},
  image: { type: String, default: '' } // ✅ Added image field
});

// Prevent model from being re-registered if already defined
const FamilyMember = mongoose.models.FamilyMember || mongoose.model('FamilyMember', familyMemberSchema);

module.exports = FamilyMember;
