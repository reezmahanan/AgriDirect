const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - List users
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ name: 1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
