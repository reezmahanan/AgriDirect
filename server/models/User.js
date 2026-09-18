const mongoose = require('mongoose');

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
  rating: { type: Number, default: 4.8, min: 1, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
