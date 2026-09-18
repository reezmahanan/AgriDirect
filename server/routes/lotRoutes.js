const express = require('express');
const router = express.Router();
const HarvestLot = require('../models/HarvestLot');
const Order = require('../models/Order');
const { validateLot, validateBid } = require('../middleware/validator');

// GET /api/lots - List all lots with optional query filters
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, district, sortBy } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (district) {
      query['farmer.district'] = new RegExp(district, 'i');
    }

    if (search) {
      query.$or = [
        { crop: new RegExp(search, 'i') },
        { variety: new RegExp(search, 'i') },
        { 'farmer.farmName': new RegExp(search, 'i') },
        { 'farmer.district': new RegExp(search, 'i') }
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'highestBid') sort = { currentHighestBid: -1 };
    if (sortBy === 'quantity') sort = { quantityKg: -1 };
    if (sortBy === 'priceLow') sort = { basePricePerKg: 1 };

    const lots = await HarvestLot.find(query).sort(sort);
    res.json({ success: true, count: lots.length, data: lots });
  } catch (error) {
    next(error);
  }
});

// GET /api/lots/:id - Details of a single lot
router.get('/:id', async (req, res, next) => {
  try {
    const lot = await HarvestLot.findById(req.params.id);
    if (!lot) {
      return res.status(404).json({ success: false, error: 'Harvest lot not found' });
    }
    res.json({ success: true, data: lot });
  } catch (error) {
    next(error);
  }
});

// POST /api/lots - Farmer lists a new harvest lot
router.post('/', validateLot, async (req, res, next) => {
  try {
    const {
      crop,
      category,
      variety,
      quantityKg,
      basePricePerKg,
      harvestDate,
      farmer,
      specifications
    } = req.body;

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48); // 48-hour bidding window

    const newLot = new HarvestLot({
      crop: crop.trim(),
      category: category.toLowerCase(),
      variety: variety || 'Standard Harvest',
      quantityKg: Number(quantityKg),
      basePricePerKg: Number(basePricePerKg),
      currentHighestBid: Number(basePricePerKg),
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      biddingDeadline: deadline,
      farmer: {
        name: farmer?.name || 'Local Farmer',
        farmName: farmer?.farmName || 'Green Valley Estate',
        district: farmer?.district || 'Nuwara Eliya',
        village: farmer?.village || 'Highlands',
        phone: farmer?.phone || '+94 77 123 4567'
      },
      specifications: {
        grade: specifications?.grade || 'Grade A Premium',
        organicCertified: Boolean(specifications?.organicCertified),
        packaging: specifications?.packaging || 'Standard Crates/Sacks',
        description: specifications?.description || ''
      },
      bids: []
    });

    const savedLot = await newLot.save();
    res.status(201).json({
      success: true,
      message: 'Harvest lot listed successfully on AgriDirect exchange',
      data: savedLot
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/lots/:id/bids - Commercial buyer submits a bid
router.post('/:id/bids', validateBid, async (req, res, next) => {
  try {
    const { offeredPricePerKg, bidderName, buyerOrganization, notes, bidderId } = req.body;
    const lot = await HarvestLot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ success: false, error: 'Harvest lot not found' });
    }

    if (lot.status !== 'bidding_open') {
      return res.status(400).json({
        success: false,
        error: `Bidding closed: Lot is currently '${lot.status}'.`
      });
    }

    const offer = Number(offeredPricePerKg);
    const minRequiredBid = Math.max(lot.basePricePerKg, (lot.currentHighestBid || 0) + 1);

    if (offer < minRequiredBid) {
      return res.status(400).json({
        success: false,
        error: `Bid rejected: Your offer of LKR ${offer}/kg is below the minimum required bid of LKR ${minRequiredBid}/kg.`
      });
    }

    const totalBidAmount = Math.round(offer * lot.quantityKg);

    const newBid = {
      bidderId: bidderId || null,
      bidderName: bidderName.trim(),
      buyerOrganization: buyerOrganization.trim(),
      offeredPricePerKg: offer,
      totalBidAmount: totalBidAmount,
      notes: notes || '',
      placedAt: new Date()
    };

    lot.bids.push(newBid);
    lot.currentHighestBid = offer;
    lot.highestBidderName = bidderName.trim();
    lot.highestBidderOrg = buyerOrganization.trim();
    if (bidderId) lot.highestBidderId = bidderId;

    await lot.save();

    res.status(201).json({
      success: true,
      message: 'Bid successfully placed and recorded on the live exchange',
      data: {
        lotId: lot._id,
        highestBid: lot.currentHighestBid,
        highestBidderOrg: lot.highestBidderOrg,
        totalBids: lot.bids.length,
        placedBid: newBid
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/lots/:id/award - Farmer awards lot to highest bidder & creates order
router.post('/:id/award', async (req, res, next) => {
  try {
    const lot = await HarvestLot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ success: false, error: 'Harvest lot not found' });
    }

    if (lot.status !== 'bidding_open') {
      return res.status(400).json({
        success: false,
        error: `Cannot award: Lot status is already '${lot.status}'.`
      });
    }

    if (!lot.bids || lot.bids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot award deal: No commercial bids have been placed on this harvest lot yet.'
      });
    }

    // Sort bids descending to get highest
    const sortedBids = [...lot.bids].sort((a, b) => b.offeredPricePerKg - a.offeredPricePerKg);
    const winningBid = sortedBids[0];

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `AGRI-EXP-${randomSuffix}`;

    const totalContractValue = Math.round(winningBid.offeredPricePerKg * lot.quantityKg);

    // Create Order with Escrow
    const order = new Order({
      trackingNumber,
      lotId: lot._id,
      crop: lot.crop,
      quantityKg: lot.quantityKg,
      winningPricePerKg: winningBid.offeredPricePerKg,
      totalContractValue,
      farmer: {
        name: lot.farmer.name,
        farmName: lot.farmer.farmName,
        phone: lot.farmer.phone,
        district: lot.farmer.district,
        pickupAddress: `${lot.farmer.farmName}, ${lot.farmer.village}, ${lot.farmer.district}`
      },
      buyer: {
        name: winningBid.bidderName,
        organization: winningBid.buyerOrganization,
        phone: '+94 11 234 5678',
        deliveryAddress: `${winningBid.buyerOrganization} Central Logistics Hub, Colombo`
      },
      escrowStatus: 'funds_escrowed',
      logistics: {
        courier: 'Domex Agro-ColdChain Express',
        vehicleNumber: `WP-AG-${Math.floor(1000 + Math.random() * 9000)}`,
        driverContact: '+94 77 987 6543',
        estimatedDeliveryHours: 18
      },
      status: 'confirmed'
    });

    const savedOrder = await order.save();

    // Update lot
    lot.status = 'awarded';
    lot.awardedOrder = savedOrder._id;
    await lot.save();

    res.json({
      success: true,
      message: `Deal awarded! Contract created under tracking #${trackingNumber}`,
      data: {
        lot,
        order: savedOrder
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
