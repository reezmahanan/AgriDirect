const express = require('express');
const router = express.Router();
const MarketPrice = require('../models/MarketPrice');
const HarvestLot = require('../models/HarvestLot');
const Order = require('../models/Order');

// GET /api/market-prices - Daily wholesale benchmark prices
router.get('/', async (req, res, next) => {
  try {
    const prices = await MarketPrice.find().sort({ crop: 1 });
    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    next(error);
  }
});

// GET /api/market-prices/stats - Dashboard analytics summary
router.get('/stats', async (req, res, next) => {
  try {
    const totalLots = await HarvestLot.countDocuments();
    const activeLots = await HarvestLot.countDocuments({ status: 'bidding_open' });
    const awardedLots = await HarvestLot.countDocuments({ status: 'awarded' });

    // Sum volume in kg
    const volumeAgg = await HarvestLot.aggregate([
      { $group: { _id: null, totalKg: { $sum: '$quantityKg' } } }
    ]);
    const totalProduceKg = volumeAgg.length > 0 ? volumeAgg[0].totalKg : 0;

    // Total bids placed
    const bidsAgg = await HarvestLot.aggregate([
      { $unwind: '$bids' },
      { $group: { _id: null, totalBids: { $sum: 1 } } }
    ]);
    const totalBids = bidsAgg.length > 0 ? bidsAgg[0].totalBids : 0;

    // Total transacted value
    const ordersAgg = await Order.aggregate([
      { $group: { _id: null, totalLKR: { $sum: '$totalContractValue' } } }
    ]);
    const totalTransactedLKR = ordersAgg.length > 0 ? ordersAgg[0].totalLKR : 0;

    res.json({
      success: true,
      data: {
        totalLots,
        activeLots,
        awardedLots,
        totalProduceKg,
        totalBids,
        totalTransactedLKR
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
