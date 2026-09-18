const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register - Register as Farmer or Commercial Buyer
router.post('/register', async (req, res, next) => {
  try {
    const { name, role, organization, email, phone, district, cityOrVillage, password } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Full name is required.');
    if (!role || !['farmer', 'buyer'].includes(role)) errors.push('Role must be farmer or buyer.');
    if (!organization || organization.trim().length < 2) {
      errors.push(role === 'farmer' ? 'Farm / Estate name is required.' : 'Business / Organization name is required.');
    }
    if (!email || !email.includes('@')) errors.push('Valid email is required.');
    if (!phone || phone.trim().length < 7) errors.push('Phone number is required.');
    if (!district) errors.push('District is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Registration failed', errors });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = User.hashPassword(password);
    const user = new User({
      name: name.trim(),
      role,
      organization: organization.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      location: {
        district: district.trim(),
        cityOrVillage: (cityOrVillage || district).trim()
      },
      passwordHash,
      rating: 4.9
    });

    const savedUser = await user.save();
    const userResponse = savedUser.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      message: `Welcome to AgriDirect, ${savedUser.name}! Account created as a ${savedUser.role}.`,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Sign in
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (!user.verifyPassword(password)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      success: true,
      message: `Login successful! Signed in as ${user.name} (${user.role.toUpperCase()}).`,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/demo-users - Provide 1-click demo accounts for presentation
router.get('/demo-users', async (req, res, next) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ role: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
