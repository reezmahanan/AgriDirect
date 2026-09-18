const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bidderName: { type: String, required: true },
  buyerOrganization: { type: String, required: true },
  offeredPricePerKg: { type: Number, required: true, min: 1 },
  totalBidAmount: { type: Number, required: true },
  notes: { type: String, default: '' },
  placedAt: { type: Date, default: Date.now }
});

const harvestLotSchema = new mongoose.Schema({
  crop: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['vegetables', 'fruits', 'spices', 'tubers', 'grains'] 
  },
  variety: { type: String, default: 'Standard Harvest' },
  quantityKg: { type: Number, required: true, min: 1 },
  basePricePerKg: { type: Number, required: true, min: 1 },
  currentHighestBid: { type: Number, default: 0 },
  highestBidderName: { type: String, default: null },
  highestBidderOrg: { type: String, default: null },
  highestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['bidding_open', 'awarded', 'in_transit', 'delivered', 'cancelled'],
    default: 'bidding_open'
  },
  harvestDate: { type: Date, default: Date.now },
  biddingDeadline: { type: Date },
  farmer: {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    farmName: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
    phone: { type: String, required: true }
  },
  specifications: {
    grade: { type: String, default: 'Grade A Premium' },
    organicCertified: { type: Boolean, default: false },
    packaging: { type: String, default: 'Standard Mesh Bags' },
    description: { type: String, default: '' }
  },
  bids: [bidSchema],
  awardedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

module.exports = mongoose.model('HarvestLot', harvestLotSchema);
