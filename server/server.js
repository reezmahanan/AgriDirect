require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize database & auto-seed if empty
connectDB().then(async () => {
  const { autoSeedIfEmpty } = require('./seed');
  await autoSeedIfEmpty();
}).catch(err => {
  console.error('[AgriDirect] Database connection warning:', err.message);
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');

// Serve static frontend files (prefers compiled React app in client/dist)
const clientDistPath = path.join(__dirname, '../client/dist');
const clientStaticPath = fs.existsSync(clientDistPath) ? clientDistPath : path.join(__dirname, '../client');
app.use(express.static(clientStaticPath));

// Also serve images statically if requested from public/images
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use('/images', express.static(path.join(__dirname, '../client/images')));

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
    frontend: fs.existsSync(clientDistPath) ? 'React SPA (Vite)' : 'Static HTML',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for Single Page Application routing
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(path.join(clientDistPath, 'index.html'))
    ? path.join(clientDistPath, 'index.html')
    : path.join(clientStaticPath, 'index.html');
  res.sendFile(indexPath);
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
