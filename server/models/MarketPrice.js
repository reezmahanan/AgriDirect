const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  crop: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  dambullaWholesalePrice: { type: Number, required: true },
  manningWholesalePrice: { type: Number, required: true },
  supermarketRetailAvg: { type: Number, required: true },
  unit: { type: String, default: 'LKR / kg' },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  updatedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
