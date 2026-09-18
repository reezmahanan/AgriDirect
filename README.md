# 🌾 AgriDirect — Farm-to-Business Daily Harvest Bidding Exchange

> **A Full-Stack B2B Agricultural Marketplace & Auction Engine powered by MongoDB, Express, and Node.js**

---

## 📌 Executive Summary & Problem Solved

Traditional fresh produce distribution in Sri Lanka is crippled by multi-layered brokerage networks and centralized wholesale intermediaries (e.g., predatory traders at regional commission markets). Smallholder and estate farmers routinely lose up to **40–60% of their produce value** due to opaque farmgate price manipulation, while commercial bulk buyers (supermarkets, luxury hotels, and industrial food processors) pay inflated rates for stale produce.

**AgriDirect** solves this systemic inefficiency by establishing a direct, transparent digital bidding exchange:
1. **Direct Farmgate Sourcing:** Farmers list freshly harvested morning lots with certified quality grading (Grade A, Organic, packaging specs).
2. **Competitive Commercial Bidding:** Verified commercial buyers (Keells, Hilton Colombo, Cargills) compete in real-time bidding windows.
3. **Daily Wholesale Benchmarking:** Real-time integration of Dambulla and Manning Market price indices prevents under-bidding.
4. **Escrow Protection & Logistics:** Awarding a deal automatically creates an escrow-backed commercial contract with Domex Agro-ColdChain dispatch and end-to-end milestone tracking.

---

## 🏗️ Architecture & Technology Stack

```
AgriDirect/
├── client/                     # Frontend Sensory Interface (Vanilla ES6+ & CSS3)
│   ├── index.html              # Marketplace, Bidding modal, Farmer listing, Order tracking
│   ├── style.css               # Agrarian modern theme (Emerald / Earth / Slate)
│   └── app.js                  # Dynamic Fetch Engine, Dual Role Switcher, Reactive Bids
├── server/                     # Backend Cognitive Engine
│   ├── config/
│   │   └── db.js               # Mongoose connection with error handling
│   ├── models/
│   │   ├── User.js             # Farmers & Commercial Buyers schema
│   │   ├── HarvestLot.js       # Produce lots, specifications, embedded bids
│   │   ├── Order.js            # Awarded deal contracts with logistics tracking
│   │   └── MarketPrice.js      # Daily wholesale benchmark rates
│   ├── middleware/
│   │   ├── validator.js        # Input validation for bids & lots
│   │   └── errorHandler.js     # Centralized error handler
│   ├── routes/
│   │   ├── lotRoutes.js        # GET /api/lots, POST /api/lots, POST /:id/bids, POST /:id/award
│   │   ├── orderRoutes.js      # GET /api/orders, GET /api/orders/:trackingNumber, PATCH status
│   │   ├── marketRoutes.js     # GET /api/market-prices, GET /api/market-prices/stats
│   │   └── userRoutes.js       # GET /api/users
│   ├── seed.js                 # Realistic Sri Lankan agricultural seed data
│   └── server.js               # Unified server hosting API & static web client
├── .env                        # Port and MongoDB connection configuration
├── .env.example
├── .gitignore
└── package.json
```

### Technology Highlights
- **Database:** **MongoDB** (Local instance `mongodb://127.0.0.1:27017/agridirect_db`) via **Mongoose ODM 8.x**.
- **Backend:** **Node.js** & **Express.js** REST API with centralized middleware and CORS.
- **Frontend:** Semantic **HTML5**, **CSS3**, and **Vanilla JavaScript** using `async/await` and the native `fetch()` API.
- **Zero Heavy Build Step:** Runs directly with a single `npm start` command without requiring complex multi-terminal bundlers.

---

## 📊 Core MongoDB Schemas (Mongoose)

### 1. `HarvestLot` Schema
```javascript
{
  crop: "Nuwara Eliya Leeks",
  category: "vegetables", // ['vegetables', 'fruits', 'spices', 'tubers', 'grains']
  variety: "Ambewela Long Crisp",
  quantityKg: 1200,
  basePricePerKg: 260,
  currentHighestBid: 295,
  highestBidderName: "Chef Jerome Rodrigo",
  highestBidderOrg: "Hilton Colombo Culinary Sourcing",
  status: "bidding_open", // ['bidding_open', 'awarded', 'in_transit', 'delivered']
  farmer: {
    name: "Sunil Bandara",
    farmName: "Pedro Estate High Farms",
    district: "Nuwara Eliya",
    village: "Kandapola",
    phone: "+94 77 220 1199"
  },
  specifications: {
    grade: "Grade A Premium Export Quality",
    organicCertified: true,
    packaging: "25kg Ventilated Eco Mesh Bags"
  },
  bids: [
    {
      bidderName: "Chef Jerome Rodrigo",
      buyerOrganization: "Hilton Colombo Culinary Sourcing",
      offeredPricePerKg: 295,
      totalBidAmount: 354000,
      placedAt: ISODate("2026-09-18T14:30:00Z")
    }
  ]
}
```

### 2. `Order` Schema (Escrow & Cold-Chain Logistics)
```javascript
{
  trackingNumber: "AGRI-EXP-77291",
  lotId: ObjectId("..."),
  crop: "Kandapola Carrots",
  quantityKg: 1500,
  winningPricePerKg: 320,
  totalContractValue: 480000,
  farmer: { ... },
  buyer: { ... },
  escrowStatus: "in_transit", // ['funds_escrowed', 'in_transit', 'delivered_and_released']
  logistics: {
    courier: "Domex Agro-ColdChain Express",
    vehicleNumber: "WP-AG-4912 (Refrigerated Truck)",
    driverContact: "+94 77 441 9922",
    estimatedDeliveryHours: 12
  },
  status: "in_transit"
}
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on default port `27017`

### 1. Clone the Repository
```bash
git clone https://github.com/reezmahanan/AgriDirect.git
cd AgriDirect
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Sample Database
Populates 7 agricultural users, 7 wholesale market benchmark indices, active harvest lots with bids, and an active logistics shipment:
```bash
npm run seed
```

### 4. Launch the Unified Server
```bash
npm start
```
The server will start on **port 5050**:
- 🌐 **Web Interface:** http://localhost:5050
- 📡 **REST API Base:** http://localhost:5050/api/lots
- 📊 **Dashboard Stats:** http://localhost:5050/api/market-prices/stats

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/lots` | Retrieve all harvest lots (supports `?category=`, `?status=`, `?search=`) |
| `GET` | `/api/lots/:id` | Get details and full bid history of a single lot |
| `POST` | `/api/lots` | Farmer publishes a new daily harvest lot |
| `POST` | `/api/lots/:id/bids` | Commercial buyer places a new bid (validates against highest bid) |
| `POST` | `/api/lots/:id/award` | Farmer awards lot to winning bidder, generating an Escrow Order |
| `GET` | `/api/orders` | List all awarded contracts and shipments |
| `GET` | `/api/orders/:trackingNumber` | Track shipment status by tracking ID (e.g. `AGRI-EXP-77291`) |
| `PATCH` | `/api/orders/:id/status` | Advance delivery milestone (`dispatched` ➔ `in_transit` ➔ `delivered`) |
| `GET` | `/api/market-prices` | Daily wholesale benchmark price feed (Dambulla vs. Manning) |
| `GET` | `/api/market-prices/stats` | Dashboard KPIs (active lots, total kg, bids, total transacted) |

---

## 🎯 Dual-Role User Experience

### 1. Commercial Buyer Mode (`🛍️`)
- Browse lots with instant search & category filtering (Vegetables, Fruits, Spices, Tubers).
- View certified quality badges (`🌱 100% Organic`, `Grade A Premium`).
- Click **"Place Commercial Bid"** to launch interactive bidding modal with live contract valuation and minimum increment safeguards.

### 2. Farmer Command Hub (`🚜`)
- Click **"List Harvest Lot"** to publish morning harvest directly to the exchange with quantity, reserve price, and packaging specifications.
- Click **"Review Bids & Award Deal"** to view ranked bids and lock a binding contract with the highest commercial buyer.
- Track cold-chain refrigerated pickup and escrow payout release upon delivery.

---

## 🛡️ License
ISC License &copy; 2026 AgriDirect Team.
