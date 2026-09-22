# 🌾 AgriDirect — Farm-to-Business Daily Harvest Bidding Exchange
### Full-Stack B2B Agricultural Marketplace & Real-Time Auction Engine
**React 18 (Vite SPA) · Node.js · Express.js · MongoDB · Mongoose ODM**

---

## 📌 1. Executive Summary & Problem Solved

Traditional fresh produce distribution in Sri Lanka is crippled by multi-layered brokerage networks and unregulated commission middlemen at regional wholesale markets (e.g., Dambulla Economic Centre and Manning Market in Colombo). Smallholder and estate farmers routinely lose up to **40% to 60% of their crop value** due to opaque farmgate price manipulation, while commercial bulk buyers (supermarket chains, 5-star hotel kitchens, food processors) pay inflated rates for produce degraded by slow, non-refrigerated transport.

**AgriDirect** resolves this systemic inefficiency by establishing a direct, transparent digital auction exchange:

1. **Direct Farmgate Sourcing:** Farmers publish freshly harvested morning lots with certified quality grading (Grade A Premium, 100% Organic, packaging specifications).
2. **Competitive Commercial Bidding:** Verified commercial buyers (Keells, Hilton Colombo, Cargills) compete in real-time bidding windows with automated minimum increment safeguards.
3. **Daily Wholesale Benchmarking:** Real-time integration of Dambulla and Manning Market wholesale price feeds prevents predatory under-bidding.
4. **Escrow Protection & Cold-Chain Logistics:** Awarding a deal automatically locks an escrow-backed commercial contract with Domex Agro-ColdChain refrigerated dispatch and 3-stage milestone telemetry (`dispatched` ➔ `in_transit` ➔ `delivered`).

---

## 📐 2. System Architecture

The application is architected as a decoupled, production-grade **3-Tier Client-Server-Database System**:

```text
[ CLIENT TIER — React 18 Single Page Application (Vite) ]
  ├── React Components (Navbar, TickerBar, HeroKPI, FilterPanel, LotCard, LotsGrid, Toast)
  ├── Interactive Modals (BiddingModal, PostLotModal, EditLotModal, AwardModal, OrdersModal, AuthModal)
  ├── AuthContext (Dual-Role Switcher: Commercial Buyer ⇄ Farmer Hub)
  └── Centralized Async API Service (api.js)
               │
               ▼  HTTP / REST (JSON Payloads via Port 5050 / Proxy Port 5173)
[ APPLICATION TIER — Express.js & Node.js Server ]
  ├── Static Server: Serves compiled React production bundle (client/dist)
  ├── Request Validation Middleware (validator.js) & Centralized Error Handler (errorHandler.js)
  ├── REST Routers: /api/lots, /api/orders, /api/market-prices, /api/auth, /api/users
  └── Self-Seeding Database Initializer (seed.js)
               │
               ▼  Mongoose ODM 8.x (Connection Pool)
[ PERSISTENCE TIER — MongoDB NoSQL Database ]
  ├── harvestlots Collection (Crops, Volume, Reserve Price, Embedded Bids Array)
  ├── orders Collection (Escrow Contracts, Logistics Telemetry, Tracking IDs)
  ├── marketprices Collection (Dambulla & Manning Wholesale Benchmark Rates)
  └── users Collection (Farmers & Commercial Procurement Profiles)
```

---

## 🔄 3. End-to-End System Workflow

```text
 🚜 FARMER (e.g. Nuwara Eliya)              💻 AGRIDIRECT PLATFORM                 🛍️ COMMERCIAL BUYER (e.g. Keells)
      │                                              │                                              │
      │ 1. Publishes Harvest Lot                     │                                              │
      │    (Crop, Qty in kg, Reserve Rs/kg)          │                                              │
      ├─────────────────────────────────────────────>│                                              │
      │                                              │ 2. Publishes on Live Exchange                │
      │                                              │    (Categorized & Benchmarked)               │
      │                                              ├─────────────────────────────────────────────>│
      │                                              │                                              │
      │                                              │ 3. Compares with Live Dambulla               │
      │                                              │    & Manning Wholesale Price Indices         │
      │                                              │                                              │
      │                                              │ 4. Submits Commercial Bid (Rs/kg)            │
      │                                              │<─────────────────────────────────────────────┤
      │                                              │                                              │
      │ 5. Inspects Ranked Bid Ladder                │                                              │
      │<─────────────────────────────────────────────┤                                              │
      │                                              │                                              │
      │ 6. Clicks "Award Deal" to Top Bidder         │                                              │
      ├─────────────────────────────────────────────>│                                              │
      │                                              │                                              │
      │                                              │ 7. Generates Escrow Contract &               │
      │                                              │    Dispatches Domex Cold-Chain Truck         │
      │                                              │    (Tracking ID: AGRI-EXP-XXXXX)             │
      │                                              ├─────────────────────────────────────────────>│
      │ 8. Receives Farmgate Pickup Confirmation     │                                              │
      │<─────────────────────────────────────────────┤ 9. Tracks Refrigerated Transit & Releases    │
      │                                              │    Escrow Payout Upon Quality Acceptance     │
```

---

## 📂 4. Project Directory Structure

```text
AgriDirect/
├── client/                              # Presentation Tier (React 18 + Vite)
│   ├── public/
│   │   └── images/                      # Verified local produce photography catalog
│   ├── src/
│   │   ├── components/                  # Modular React UI components
│   │   │   ├── modals/
│   │   │   │   ├── AuthModal.jsx        # Dual-role authentication modal
│   │   │   │   ├── AwardModal.jsx       # Ranked bid review & contract lock modal
│   │   │   │   ├── BiddingModal.jsx     # Live contract valuation bidding modal
│   │   │   │   ├── EditLotModal.jsx     # Farmer lot modification modal
│   │   │   │   ├── OrdersModal.jsx      # Logistics & cold-chain telemetry modal
│   │   │   │   └── PostLotModal.jsx     # Harvest lot publishing modal
│   │   │   ├── FilterPanel.jsx          # Category tabs, live search, status & sort
│   │   │   ├── HeroKPI.jsx              # Role-aware hero banner & 4 KPI metrics
│   │   │   ├── LotCard.jsx              # Individual produce auction card
│   │   │   ├── LotsGrid.jsx             # Responsive lot grid container
│   │   │   ├── Navbar.jsx               # Navigation & portal role toggle
│   │   │   ├── TickerBar.jsx            # Wholesale benchmark marquee ticker
│   │   │   └── Toast.jsx                # Notification toast alert system
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # User session & portal role state
│   │   ├── services/
│   │   │   └── api.js                   # Async client for all /api endpoints
│   │   ├── styles/
│   │   │   └── index.css                # Agrarian theme tokens (Emerald / Slate / Earth)
│   │   ├── utils/
│   │   │   └── imageHelper.js           # Produce photo resolver utility
│   │   ├── App.jsx                      # Root application layout & state orchestrator
│   │   └── main.jsx                     # React DOM root entry point
│   ├── dist/                            # Compiled production bundle (served by Express)
│   ├── index.html                       # Vite HTML template
│   ├── package.json                     # Client dependencies (React, Lucide-React, Vite)
│   └── vite.config.js                   # Vite config with API proxy to port 5050
├── server/                              # Logic & Persistence Tiers (Backend)
│   ├── config/
│   │   └── db.js                        # Multi-cloud MongoDB connection pool
│   ├── middleware/
│   │   ├── errorHandler.js              # Centralized 404 & 500 error handler
│   │   └── validator.js                 # Input validation rules
│   ├── models/
│   │   ├── HarvestLot.js                # Produce schema with embedded bids array
│   │   ├── MarketPrice.js               # Wholesale benchmark rates schema
│   │   ├── Order.js                     # Escrow contracts & logistics schema
│   │   └── User.js                      # Farmers & Commercial Buyers schema
│   ├── routes/
│   │   ├── authRoutes.js                # Authentication endpoints
│   │   ├── lotRoutes.js                 # Harvest lot management & bidding
│   │   ├── marketRoutes.js              # Wholesale index & KPI statistics
│   │   ├── orderRoutes.js               # Escrow orders & shipment tracking
│   │   └── userRoutes.js                # Registered users directory
│   ├── seed.js                          # Self-seeding database engine
│   └── server.js                        # Unified Express server
├── .env.example                         # Environment template
├── .gitignore                           # Git exclusion rules
└── package.json                         # Root metadata, dependencies & run scripts
```

---

## 🗄️ 5. MongoDB Database Schemas (Mongoose ODM)

### 1. `HarvestLot` Schema (Produce Lots with Embedded Bids)
```javascript
{
  crop: "Kandapola Grade-A Carrots",
  category: "vegetables", // ['vegetables', 'fruits', 'grains', 'spices', 'tubers']
  quantityKg: 1500,
  reservePricePerKg: 280,
  qualityGrade: "Grade A Premium",
  packagingSpecs: "50kg Ventilated Plastic Crates",
  isOrganic: true,
  status: "bidding_open", // ['bidding_open', 'awarded']
  farmer: {
    name: "Sunil Bandara",
    organization: "Pedro Estate High Farms",
    phone: "+94 77 220 1199",
    location: { district: "Nuwara Eliya", cityOrVillage: "Kandapola" }
  },
  bids: [
    {
      bidPricePerKg: 320,
      buyer: {
        name: "Keells Procurement Division",
        organization: "Keells Supermarkets",
        phone: "+94 11 230 3500",
        notes: "Requires delivery to Peliyagoda distribution hub."
      },
      createdAt: ISODate("2026-09-22T08:30:00Z")
    }
  ]
}
```

### 2. `Order` Schema (Escrow Contract & Cold-Chain Logistics)
```javascript
{
  trackingNumber: "AGRI-EXP-77291",
  lotId: ObjectId("..."),
  crop: "Kandapola Grade-A Carrots",
  quantityKg: 1500,
  winningPricePerKg: 320,
  totalContractValue: 480000,
  farmer: { ... },
  buyer: { ... },
  escrowStatus: "in_transit",
  logistics: {
    courier: "Domex Agro-ColdChain Express",
    vehicleNumber: "WP-AG-4912 (Refrigerated Truck)",
    driverContact: "+94 77 441 9922",
    estimatedDeliveryHours: 12
  },
  status: "in_transit" // ['dispatched', 'in_transit', 'delivered']
}
```

---

## 📡 6. RESTful API Endpoint Specifications

| HTTP Method | Endpoint URI | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System status, frontend build mode, database health | `200 OK` |
| `GET` | `/api/lots` | Retrieve lots (supports `?category=`, `?status=`, `?search=`, `?sort=`) | `200 OK`, `500 Error` |
| `GET` | `/api/lots/:id` | Fetch specific lot with complete bid ladder | `200 OK`, `404 Not Found` |
| `POST` | `/api/lots` | Farmer publishes a new daily harvest lot | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/lots/:id` | Farmer updates quantity, reserve price, or specifications | `200 OK`, `404 Not Found` |
| `DELETE` | `/api/lots/:id` | Farmer removes an unsold harvest lot | `200 OK`, `404 Not Found` |
| `POST` | `/api/lots/:id/bids` | Commercial buyer places a new competitive bid | `201 Created`, `400 Bad Request` |
| `POST` | `/api/lots/:id/award` | Farmer awards lot to top bidder, generating an Escrow Order | `200 OK`, `400 Bad Request` |
| `GET` | `/api/orders` | Query all active contracts and cold-chain shipments | `200 OK`, `500 Error` |
| `GET` | `/api/orders/:trackingNumber` | Look up cold-chain delivery telemetry by tracking ID | `200 OK`, `404 Not Found` |
| `PATCH` | `/api/orders/:id/status` | Advance delivery milestone (`dispatched` ➔ `in_transit` ➔ `delivered`) | `200 OK`, `400 Bad Request` |
| `GET` | `/api/market-prices` | Fetch daily Dambulla & Manning wholesale benchmark price feeds | `200 OK`, `500 Error` |
| `GET` | `/api/market-prices/stats` | High-level exchange KPIs (Active Lots, Total Kg, Total Bids) | `200 OK`, `500 Error` |
| `POST` | `/api/auth/login` | Authenticate farmer or commercial buyer credentials | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/register` | Register a new agricultural profile with role assignment | `201 Created`, `400 Bad Request` |

---

## 🚀 7. Step-by-Step Installation & Local Setup

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **MongoDB:** Community Server running locally on port `27017` (or a MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/reezmahanan/AgriDirect.git
cd AgriDirect
```

### 2. Install Dependencies
Install server and client packages:
```bash
npm install
npm run build
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/agridirect_db
```
*(When deploying to MongoDB Atlas, paste your cloud connection string into `MONGO_URI`).*

### 4. Run the Application

#### Option A: Unified Production Mode (Recommended)
```bash
npm start
```
* Serves the compiled React application and Express REST API together at:  
  👉 **[http://localhost:5050](http://localhost:5050)**

#### Option B: React Vite Hot-Reload Development Mode
* **Terminal 1 (Backend API):**
  ```bash
  npm run server:dev
  ```
* **Terminal 2 (Frontend React HMR):**
  ```bash
  npm run client:dev
  ```
* Access the interactive React dev environment at:  
  👉 **[http://localhost:5173](http://localhost:5173)**

---

## ☁️ 8. Cloud Deployment (Render.com / Railway.app)

The project is pre-configured with **Cloud MongoDB URI detection** and **automatic self-seeding**:

1. **Database (MongoDB Atlas):**
   * Create a free **M0 Cluster** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   * In **Network Access**, allow access from anywhere (`0.0.0.0/0`).
   * Copy the connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/agridirect_db?retryWrites=true&w=majority
     ```
2. **Deploy Service (Render / Railway):**
   * Connect your GitHub repository: `reezmahanan/AgriDirect`.
   * **Build Command:** `npm run build`
   * **Start Command:** `npm start`
   * **Environment Variable:** Set `MONGO_URI` to your Atlas connection string.
3. The server connects to MongoDB, auto-seeds initial produce lots and market benchmark prices, and launches live!

---

## 🧪 9. Testing & Quality Assurance Verification

| Test ID | Test Scenario | Input Data | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Dual Portal Switching | Click "Commercial Buyer" ⇄ "Farmer Hub" | Active UI, buttons, and hero messaging toggle instantly | **PASS** |
| **TC-02** | Category Filtering | Click "Grains" category tab | Grid displays only rice and grain harvest lots | **PASS** |
| **TC-03** | Live Valuation Calculation | Enter bid of Rs. 320 on 1,500 kg lot | Modal calculates: `1,500 × 320 = Rs. 480,000` | **PASS** |
| **TC-04** | Bid Validation Safeguard | Enter bid lower than current high | Rejected with toast: `"Bid must be higher than current top bid"` | **PASS** |
| **TC-05** | Deal Awarding | Farmer clicks "Award Contract" | Status transitions to `awarded`; bidding window locks | **PASS** |
| **TC-06** | Escrow Milestone Stepper | Advance shipment status | Milestone updates from `dispatched` ➔ `in_transit` ➔ `delivered` | **PASS** |
| **TC-07** | Local Produce Photos | Render lot cards | Correct high-res images load for leeks, carrots, grains, chillies | **PASS** |

---

*AgriDirect © 2026. Farm-to-Business Daily Harvest Bidding Exchange.*
