require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lots', require('./routes/lotRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/market-prices', require('./routes/marketRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AgriDirect Farm-to-Business Daily Harvest Bidding Exchange API',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Fallback to client/index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 AgriDirect B2B Exchange Server is running!`);
  console.log(`🚀 Access Web Application : http://localhost:${PORT}`);
  console.log(`🔑 Authentication API    : http://localhost:${PORT}/api/auth`);
  console.log(`📡 Harvest Lots API      : http://localhost:${PORT}/api/lots`);
  console.log(`📦 Orders & Logistics    : http://localhost:${PORT}/api/orders`);
  console.log(`📊 Wholesale Index       : http://localhost:${PORT}/api/market-prices`);
  console.log(`=======================================================`);
});
