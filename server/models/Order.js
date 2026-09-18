const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'HarvestLot', required: true },
  crop: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  winningPricePerKg: { type: Number, required: true },
  totalContractValue: { type: Number, required: true },
  farmer: {
    name: { type: String, required: true },
    farmName: { type: String, required: true },
    phone: { type: String, required: true },
    district: { type: String, required: true },
    pickupAddress: { type: String, required: true }
  },
  buyer: {
    name: { type: String, required: true },
    organization: { type: String, required: true },
    phone: { type: String, required: true },
    deliveryAddress: { type: String, required: true }
  },
  escrowStatus: {
    type: String,
    enum: ['funds_escrowed', 'in_transit', 'delivered_and_released'],
    default: 'funds_escrowed'
  },
  logistics: {
    courier: { type: String, default: 'Domex Agro-ColdChain Express' },
    vehicleNumber: { type: String, default: 'WP-AG-8291' },
    driverContact: { type: String, default: '+94 77 123 9988' },
    estimatedDeliveryHours: { type: Number, default: 24 }
  },
  status: {
    type: String,
    enum: ['confirmed', 'dispatched', 'in_transit', 'delivered'],
    default: 'confirmed'
  },
  awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
