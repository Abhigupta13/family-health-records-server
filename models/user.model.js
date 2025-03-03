const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['Admin', 'Doctor', 'User'],
    default: 'User'
  },
  addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  name: { type: String },
  image: { type: String, default: '' },  // ✅ New field for profile image
  resetPasswordToken: { type: String, default: '' }
}, { timestamps: true });

const virtual = userSchema.virtual('id');
virtual.get(function () {
  return this._id;
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.User = mongoose.model('User', userSchema);
