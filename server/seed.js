require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const HarvestLot = require('./models/HarvestLot');
const MarketPrice = require('./models/MarketPrice');
const Order = require('./models/Order');

const seedData = async (options = { exitOnComplete: true, clearExisting: true }) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const connUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/agridirect_db';
      await mongoose.connect(connUri);
      console.log('[AgriDirect Seeder] Connected to MongoDB.');
    }

    if (options.clearExisting !== false) {
      // Clear existing collections
      await User.deleteMany({});
      await HarvestLot.deleteMany({});
      await MarketPrice.deleteMany({});
      await Order.deleteMany({});
      console.log('[AgriDirect Seeder] Cleared old collections.');
    }

    const defaultPasswordHash = User.hashPassword('password123');

    // 1. Seed Users (Farmers & Commercial Buyers)
    const users = await User.insertMany([
      {
        name: 'Sunil Bandara',
        role: 'farmer',
        organization: 'Pedro Estate High Farms',
        email: 'sunil@farmer.lk',
        phone: '+94 77 220 1199',
        location: { district: 'Nuwara Eliya', cityOrVillage: 'Kandapola' },
        passwordHash: defaultPasswordHash,
        rating: 4.9
      },
      {
        name: 'Kithsiri Jayasinghe',
        role: 'farmer',
        organization: 'Dambulla Valley Harvest Co.',
        email: 'kithsiri@farmer.lk',
        phone: '+94 71 884 9021',
        location: { district: 'Matale', cityOrVillage: 'Dambulla' },
        passwordHash: defaultPasswordHash,
        rating: 4.8
      },
      {
        name: 'Nagaraja Thevathas',
        role: 'farmer',
        organization: 'Northern Spice & Chilli Growers',
        email: 'thevathas@farmer.lk',
        phone: '+94 76 331 4452',
        location: { district: 'Jaffna', cityOrVillage: 'Chavakachcheri' },
        passwordHash: defaultPasswordHash,
        rating: 4.9
      },
      {
        name: 'Dharmadasa Rajapaksha',
        role: 'farmer',
        organization: 'Badulla Highland Organics',
        email: 'dharmadasa@farmer.lk',
        phone: '+94 72 443 8810',
        location: { district: 'Badulla', cityOrVillage: 'Welimada' },
        passwordHash: defaultPasswordHash,
        rating: 4.7
      },
      {
        name: 'Chef Jerome Rodrigo',
        role: 'buyer',
        organization: 'Hilton Colombo Culinary Sourcing',
        email: 'jerome@hilton.lk',
        phone: '+94 11 249 2492',
        location: { district: 'Colombo', cityOrVillage: 'Fort' },
        passwordHash: defaultPasswordHash,
        rating: 4.9
      },
      {
        name: 'Samantha Wickramasinghe',
        role: 'buyer',
        organization: 'Keells Supermarket Central Logistics',
        email: 'samantha@keells.lk',
        phone: '+94 11 230 3500',
        location: { district: 'Colombo', cityOrVillage: 'Peliyagoda' },
        passwordHash: defaultPasswordHash,
        rating: 5.0
      },
      {
        name: 'Dilshan Peiris',
        role: 'buyer',
        organization: 'Cargills Agrifoods Processing Ltd',
        email: 'dilshan@cargills.lk',
        phone: '+94 11 242 7777',
        location: { district: 'Gampaha', cityOrVillage: 'Ja-Ela' },
        passwordHash: defaultPasswordHash,
        rating: 4.8
      }
    ]);
    console.log(`[AgriDirect Seeder] Seeded ${users.length} Users with login credentials (password: 'password123').`);

    // 2. Seed Daily Benchmark Market Prices
    const marketPrices = await MarketPrice.insertMany([
      {
        crop: 'Nuwara Eliya Leeks',
        category: 'vegetables',
        dambullaWholesalePrice: 280,
        manningWholesalePrice: 310,
        supermarketRetailAvg: 460,
        trend: 'up'
      },
      {
        crop: 'Dambulla Big Onions',
        category: 'vegetables',
        dambullaWholesalePrice: 340,
        manningWholesalePrice: 375,
        supermarketRetailAvg: 520,
        trend: 'down'
      },
      {
        crop: 'Jaffna Green Chillies',
        category: 'spices',
        dambullaWholesalePrice: 650,
        manningWholesalePrice: 720,
        supermarketRetailAvg: 950,
        trend: 'up'
      },
      {
        crop: 'Welimada Red Potatoes',
        category: 'tubers',
        dambullaWholesalePrice: 290,
        manningWholesalePrice: 325,
        supermarketRetailAvg: 440,
        trend: 'stable'
      },
      {
        crop: 'Kandapola Carrots',
        category: 'vegetables',
        dambullaWholesalePrice: 310,
        manningWholesalePrice: 350,
        supermarketRetailAvg: 490,
        trend: 'stable'
      },
      {
        crop: 'Embilipitiya Cavendish Bananas',
        category: 'fruits',
        dambullaWholesalePrice: 180,
        manningWholesalePrice: 210,
        supermarketRetailAvg: 320,
        trend: 'up'
      },
      {
        crop: 'Matale Grade-1 Black Pepper',
        category: 'spices',
        dambullaWholesalePrice: 2400,
        manningWholesalePrice: 2650,
        supermarketRetailAvg: 3400,
        trend: 'up'
      },
      {
        crop: 'Polonnaruwa Keeri Samba Rice',
        category: 'grains',
        dambullaWholesalePrice: 240,
        manningWholesalePrice: 265,
        supermarketRetailAvg: 340,
        trend: 'up'
      }
    ]);
    console.log(`[AgriDirect Seeder] Seeded ${marketPrices.length} Wholesale Benchmark Indexes.`);

    const farmer1 = users[0];
    const farmer2 = users[1];
    const farmer3 = users[2];
    const farmer4 = users[3];

    const buyerHilton = users[4];
    const buyerKeells = users[5];
    const buyerCargills = users[6];

    // 3. Seed Harvest Lots with real-world bids
    const lots = await HarvestLot.insertMany([
      {
        crop: 'Nuwara Eliya Leeks',
        category: 'vegetables',
        variety: 'Ambewela Long Crisp',
        imageUrl: '/images/leeks.jpg',
        quantityKg: 1200,
        basePricePerKg: 260,
        currentHighestBid: 295,
        highestBidderName: buyerHilton.name,
        highestBidderOrg: buyerHilton.organization,
        highestBidderId: buyerHilton._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 36 * 3600 * 1000),
        farmer: {
          farmerId: farmer1._id,
          name: farmer1.name,
          farmName: farmer1.organization,
          district: farmer1.location.district,
          village: farmer1.location.cityOrVillage,
          phone: farmer1.phone
        },
        specifications: {
          grade: 'Grade A Premium Export Quality',
          organicCertified: true,
          packaging: '25kg Ventilated Eco Mesh Bags',
          description: 'Field-harvested this morning in Kandapola. Crisp white stems, trimmed roots, and zero chemical pesticide residue.'
        },
        bids: [
          {
            bidderId: buyerKeells._id,
            bidderName: buyerKeells.name,
            buyerOrganization: buyerKeells.organization,
            offeredPricePerKg: 275,
            totalBidAmount: 275 * 1200,
            notes: 'Requires delivery to Peliyagoda central distribution by 6 AM.',
            placedAt: new Date(Date.now() - 3 * 3600 * 1000)
          },
          {
            bidderId: buyerHilton._id,
            bidderName: buyerHilton.name,
            buyerOrganization: buyerHilton.organization,
            offeredPricePerKg: 295,
            totalBidAmount: 295 * 1200,
            notes: 'For luxury hotel banqueting kitchens. Need immediate morning refrigerated pickup.',
            placedAt: new Date(Date.now() - 1 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Dambulla Big Onions',
        category: 'vegetables',
        variety: 'Dry Cured Golden Globe',
        imageUrl: '/images/onions.jpg',
        quantityKg: 3500,
        basePricePerKg: 310,
        currentHighestBid: 335,
        highestBidderName: buyerCargills.name,
        highestBidderOrg: buyerCargills.organization,
        highestBidderId: buyerCargills._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 42 * 3600 * 1000),
        farmer: {
          farmerId: farmer2._id,
          name: farmer2.name,
          farmName: farmer2.organization,
          district: farmer2.location.district,
          village: farmer2.location.cityOrVillage,
          phone: farmer2.phone
        },
        specifications: {
          grade: 'Grade A Commercial',
          organicCertified: false,
          packaging: '50kg Jute Sacks',
          description: 'Naturally sun-cured over 5 days for long shelf-life. Uniform 60-70mm caliber bulbs with dry outer skin.'
        },
        bids: [
          {
            bidderId: buyerKeells._id,
            bidderName: buyerKeells.name,
            buyerOrganization: buyerKeells.organization,
            offeredPricePerKg: 320,
            totalBidAmount: 320 * 3500,
            notes: 'Weekly supermarket staple replenishment.',
            placedAt: new Date(Date.now() - 5 * 3600 * 1000)
          },
          {
            bidderId: buyerCargills._id,
            bidderName: buyerCargills.name,
            buyerOrganization: buyerCargills.organization,
            offeredPricePerKg: 335,
            totalBidAmount: 335 * 3500,
            notes: 'Direct bulk acquisition for food processing and retail distribution.',
            placedAt: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Jaffna Green Chillies',
        category: 'spices',
        variety: 'MI-2 High Heat Pungent',
        imageUrl: '/images/chillies.jpg',
        quantityKg: 800,
        basePricePerKg: 620,
        currentHighestBid: 680,
        highestBidderName: buyerKeells.name,
        highestBidderOrg: buyerKeells.organization,
        highestBidderId: buyerKeells._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 24 * 3600 * 1000),
        farmer: {
          farmerId: farmer3._id,
          name: farmer3.name,
          farmName: farmer3.organization,
          district: farmer3.location.district,
          village: farmer3.location.cityOrVillage,
          phone: farmer3.phone
        },
        specifications: {
          grade: 'Grade A First Pick',
          organicCertified: true,
          packaging: '10kg Perforated Plastic Crates',
          description: 'Picked at peak firmness and glossy emerald dark color. Intense capsaicin aroma and long shelf stability.'
        },
        bids: [
          {
            bidderId: buyerKeells._id,
            bidderName: buyerKeells.name,
            buyerOrganization: buyerKeells.organization,
            offeredPricePerKg: 680,
            totalBidAmount: 680 * 800,
            notes: 'Full volume lock for retail supermarket chain.',
            placedAt: new Date(Date.now() - 30 * 60 * 1000)
          }
        ]
      },
      {
        crop: 'Welimada Red Potatoes',
        category: 'tubers',
        variety: 'Granola High Starch',
        imageUrl: '/images/potatoes.jpg',
        quantityKg: 2000,
        basePricePerKg: 270,
        currentHighestBid: 290,
        highestBidderName: buyerHilton.name,
        highestBidderOrg: buyerHilton.organization,
        highestBidderId: buyerHilton._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 40 * 3600 * 1000),
        farmer: {
          farmerId: farmer4._id,
          name: farmer4.name,
          farmName: farmer4.organization,
          district: farmer4.location.district,
          village: farmer4.location.cityOrVillage,
          phone: farmer4.phone
        },
        specifications: {
          grade: 'Grade A Table Quality',
          organicCertified: false,
          packaging: '40kg Reinforced Sacks',
          description: 'Freshly dug from rich Welimada volcanic soil. Washed and dried, minimal skin damage.'
        },
        bids: [
          {
            bidderId: buyerHilton._id,
            bidderName: buyerHilton.name,
            buyerOrganization: buyerHilton.organization,
            offeredPricePerKg: 290,
            totalBidAmount: 290 * 2000,
            notes: 'High-volume purchase for seasonal hotel menu.',
            placedAt: new Date(Date.now() - 4 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Matale Grade-1 Black Pepper',
        category: 'spices',
        variety: 'Panniyur Heavy Berry',
        imageUrl: '/images/pepper.jpg',
        quantityKg: 400,
        basePricePerKg: 2300,
        currentHighestBid: 2450,
        highestBidderName: buyerCargills.name,
        highestBidderOrg: buyerCargills.organization,
        highestBidderId: buyerCargills._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 48 * 3600 * 1000),
        farmer: {
          farmerId: farmer2._id,
          name: farmer2.name,
          farmName: farmer2.organization,
          district: 'Matale',
          village: 'Ukuwela',
          phone: farmer2.phone
        },
        specifications: {
          grade: 'Export Grade 550g/l Bulk Density',
          organicCertified: true,
          packaging: 'Hermetic Poly-Lined Sacks',
          description: 'Sun-dried pure black peppercorns, moisture content under 11%, high piperine content (5.8%).'
        },
        bids: [
          {
            bidderId: buyerCargills._id,
            bidderName: buyerCargills.name,
            buyerOrganization: buyerCargills.organization,
            offeredPricePerKg: 2450,
            totalBidAmount: 2450 * 400,
            notes: 'Export packaging required for spice processing.',
            placedAt: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Embilipitiya Cavendish Bananas',
        category: 'fruits',
        variety: 'Grande Naine Commercial Export',
        imageUrl: '/images/bananas.jpg',
        quantityKg: 2500,
        basePricePerKg: 180,
        currentHighestBid: 205,
        highestBidderName: buyerHilton.name,
        highestBidderOrg: buyerHilton.organization,
        highestBidderId: buyerHilton._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 36 * 3600 * 1000),
        farmer: {
          farmerId: farmer3._id,
          name: farmer3.name,
          farmName: farmer3.organization,
          district: 'Hambantota',
          village: 'Embilipitiya',
          phone: farmer3.phone
        },
        specifications: {
          grade: 'Grade A Export Hands',
          organicCertified: true,
          packaging: '20kg Ventilated Corrugated Cartons',
          description: 'Uniform 7-8 inch fingers harvested at mature green stage with high brix ripening potential.'
        },
        bids: [
          {
            bidderId: buyerKeells._id,
            bidderName: buyerKeells.name,
            buyerOrganization: buyerKeells.organization,
            offeredPricePerKg: 195,
            totalBidAmount: 195 * 2500,
            notes: 'Weekly fresh fruit section replenishment for retail supermarket outlets.',
            placedAt: new Date(Date.now() - 3 * 3600 * 1000)
          },
          {
            bidderId: buyerHilton._id,
            bidderName: buyerHilton.name,
            buyerOrganization: buyerHilton.organization,
            offeredPricePerKg: 205,
            totalBidAmount: 205 * 2500,
            notes: 'Breakfast buffet and banquet hospitality fresh fruit allocation.',
            placedAt: new Date(Date.now() - 1 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Dambulla Red Lady Papaya',
        category: 'fruits',
        variety: 'F1 Red Flesh Sweet',
        imageUrl: '/images/papaya.jpg',
        quantityKg: 1600,
        basePricePerKg: 150,
        currentHighestBid: 170,
        highestBidderName: buyerCargills.name,
        highestBidderOrg: buyerCargills.organization,
        highestBidderId: buyerCargills._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 48 * 3600 * 1000),
        farmer: {
          farmerId: farmer2._id,
          name: farmer2.name,
          farmName: farmer2.organization,
          district: farmer2.location.district,
          village: farmer2.location.cityOrVillage,
          phone: farmer2.phone
        },
        specifications: {
          grade: 'Grade A Premium Fruit',
          organicCertified: true,
          packaging: 'Foam Net Sleeves in 15kg Crates',
          description: 'Deep red succulent sweet flesh, average weight 1.2-1.5kg, picked with 25% color break for optimal cold-chain transit.'
        },
        bids: [
          {
            bidderId: buyerCargills._id,
            bidderName: buyerCargills.name,
            buyerOrganization: buyerCargills.organization,
            offeredPricePerKg: 170,
            totalBidAmount: 170 * 1600,
            notes: 'Direct supermarket fresh counter procurement.',
            placedAt: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Polonnaruwa Golden Keeri Samba Rice',
        category: 'grains',
        variety: 'BG 360 Parboiled Whole Grain',
        imageUrl: '/images/grains.jpg',
        quantityKg: 4500,
        basePricePerKg: 230,
        currentHighestBid: 255,
        highestBidderName: buyerKeells.name,
        highestBidderOrg: buyerKeells.organization,
        highestBidderId: buyerKeells._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 48 * 3600 * 1000),
        farmer: {
          farmerId: farmer4._id,
          name: farmer4.name,
          farmName: 'Rajarata Agri Mills & Paddy Farms',
          district: 'Polonnaruwa',
          village: 'Hingurakgoda',
          phone: farmer4.phone
        },
        specifications: {
          grade: 'Grade A Polished Premium Grain',
          organicCertified: true,
          packaging: '50kg Moisture-Proof Poly-Woven Sacks',
          description: 'Freshly harvested prime keeri samba paddy milled under hygienic conditions. Moisture under 12%, broken grains under 2%.'
        },
        bids: [
          {
            bidderId: buyerCargills._id,
            bidderName: buyerCargills.name,
            buyerOrganization: buyerCargills.organization,
            offeredPricePerKg: 245,
            totalBidAmount: 245 * 4500,
            notes: 'Wholesale batch acquisition for dry goods supply.',
            placedAt: new Date(Date.now() - 4 * 3600 * 1000)
          },
          {
            bidderId: buyerKeells._id,
            bidderName: buyerKeells.name,
            buyerOrganization: buyerKeells.organization,
            offeredPricePerKg: 255,
            totalBidAmount: 255 * 4500,
            notes: 'Central logistics procurement for island-wide retail supermarket shelves.',
            placedAt: new Date(Date.now() - 1 * 3600 * 1000)
          }
        ]
      },
      {
        crop: 'Ampara Traditional Red Raw Rice',
        category: 'grains',
        variety: 'Suwandel Traditional Heirloom',
        imageUrl: '/images/grains.jpg',
        quantityKg: 3000,
        basePricePerKg: 250,
        currentHighestBid: 280,
        highestBidderName: buyerHilton.name,
        highestBidderOrg: buyerHilton.organization,
        highestBidderId: buyerHilton._id,
        status: 'bidding_open',
        harvestDate: new Date(),
        biddingDeadline: new Date(Date.now() + 36 * 3600 * 1000),
        farmer: {
          farmerId: farmer2._id,
          name: farmer2.name,
          farmName: 'Eastern Organic Rice Producers',
          district: 'Ampara',
          village: 'Uhana',
          phone: farmer2.phone
        },
        specifications: {
          grade: 'Premium Unpolished Red Grain',
          organicCertified: true,
          packaging: '25kg Eco Burlap Sacks',
          description: 'Nutrient-rich traditional unpolished red raw rice, high dietary fiber and antioxidants. Cleaned with optical color sorters.'
        },
        bids: [
          {
            bidderId: buyerHilton._id,
            bidderName: buyerHilton.name,
            buyerOrganization: buyerHilton.organization,
            offeredPricePerKg: 280,
            totalBidAmount: 280 * 3000,
            notes: 'Heirloom rice selection for luxury dining buffet.',
            placedAt: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ]
      }
    ]);
    console.log(`[AgriDirect Seeder] Seeded ${lots.length} active Harvest Lots.`);

    // 4. Seed an already Awarded Deal with an Order
    const awardedLot = new HarvestLot({
      crop: 'Kandapola Carrots',
      category: 'vegetables',
      variety: 'Nantes Sweet Tender',
      imageUrl: '/images/carrots.jpg',
      quantityKg: 1500,
      basePricePerKg: 290,
      currentHighestBid: 320,
      highestBidderName: buyerKeells.name,
      highestBidderOrg: buyerKeells.organization,
      highestBidderId: buyerKeells._id,
      status: 'awarded',
      harvestDate: new Date(Date.now() - 24 * 3600 * 1000),
      farmer: {
        farmerId: farmer1._id,
        name: farmer1.name,
        farmName: farmer1.organization,
        district: farmer1.location.district,
        village: farmer1.location.cityOrVillage,
        phone: farmer1.phone
      },
      specifications: {
        grade: 'Grade A Washed & Graded',
        organicCertified: true,
        packaging: '20kg Ventilated Crates',
        description: 'Sweet, deep-orange tender carrots washed in mountain spring water.'
      },
      bids: [
        {
          bidderId: buyerKeells._id,
          bidderName: buyerKeells.name,
          buyerOrganization: buyerKeells.organization,
          offeredPricePerKg: 320,
          totalBidAmount: 320 * 1500,
          notes: 'Awarded by farmer Sunil Bandara. Domex ColdChain in transit.',
          placedAt: new Date(Date.now() - 12 * 3600 * 1000)
        }
      ]
    });
    const savedAwardedLot = await awardedLot.save();

    const sampleOrder = new Order({
      trackingNumber: 'AGRI-EXP-77291',
      lotId: savedAwardedLot._id,
      crop: 'Kandapola Carrots',
      quantityKg: 1500,
      winningPricePerKg: 320,
      totalContractValue: 320 * 1500,
      farmer: {
        name: farmer1.name,
        farmName: farmer1.organization,
        phone: farmer1.phone,
        district: farmer1.location.district,
        pickupAddress: 'Pedro Estate High Farms, Kandapola, Nuwara Eliya'
      },
      buyer: {
        name: buyerKeells.name,
        organization: buyerKeells.organization,
        phone: buyerKeells.phone,
        deliveryAddress: 'Keells Supermarkets Central Warehouse, Peliyagoda'
      },
      escrowStatus: 'in_transit',
      logistics: {
        courier: 'Domex Agro-ColdChain Express',
        vehicleNumber: 'WP-AG-4912 (Refrigerated Truck)',
        driverContact: '+94 77 441 9922',
        estimatedDeliveryHours: 12
      },
      status: 'in_transit'
    });

    const savedOrder = await sampleOrder.save();
    savedAwardedLot.awardedOrder = savedOrder._id;
    await savedAwardedLot.save();

    console.log('[AgriDirect Seeder] Seeded 1 in-transit Order (#AGRI-EXP-77291).');
    console.log('[AgriDirect Seeder] Database population completed successfully!');
    if (options.exitOnComplete !== false) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[AgriDirect Seeder Error]:', err);
    if (options.exitOnComplete !== false) {
      process.exit(1);
    }
    throw err;
  }
};

const autoSeedIfEmpty = async () => {
  try {
    const lotCount = await HarvestLot.countDocuments();
    if (lotCount === 0) {
      console.log('[AgriDirect] Empty database detected. Auto-seeding initial harvest lots and market prices...');
      await seedData({ exitOnComplete: false, clearExisting: false });
    }
  } catch (err) {
    console.warn('[AgriDirect] Auto-seed warning:', err.message);
  }
};

if (require.main === module) {
  seedData({ exitOnComplete: true, clearExisting: true });
}

module.exports = { seedData, autoSeedIfEmpty };
