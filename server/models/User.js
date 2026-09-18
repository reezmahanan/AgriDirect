const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['farmer', 'buyer'], required: true },
  organization: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  location: {
    district: { type: String, required: true },
    cityOrVillage: { type: String, required: true }
  },
  passwordHash: { type: String, required: true },
  rating: { type: Number, default: 4.8, min: 1, max: 5 }
}, { timestamps: true });

// Static helper to hash password using SHA256
userSchema.statics.hashPassword = function(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
};

userSchema.methods.verifyPassword = function(password) {
  return this.passwordHash === crypto.createHash('sha256').update(password).digest('hex');
};

module.exports = mongoose.model('User', userSchema);
