const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const HarvestLot = require('../models/HarvestLot');

// GET /api/orders - List all orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ awardedAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:trackingNumber - Lookup order by tracking number
router.get('/:trackingNumber', async (req, res, next) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found with specified tracking number' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status - Advance order status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'dispatched', 'in_transit', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    if (status === 'dispatched' || status === 'in_transit') {
      order.escrowStatus = 'in_transit';
    } else if (status === 'delivered') {
      order.escrowStatus = 'delivered_and_released';
    }

    await order.save();
    res.json({ success: true, message: `Order status advanced to ${status}`, data: order });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id - Cancel & remove exchange order, reopening harvest lot
router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // If order has an associated harvest lot, revert lot back to active bidding
    if (order.lotId) {
      await HarvestLot.findByIdAndUpdate(order.lotId, {
        status: 'bidding_open',
        awardedOrder: null
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Exchange contract #${order.trackingNumber} successfully removed. Associated harvest lot reopened on exchange.`,
      orderId: req.params.id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
