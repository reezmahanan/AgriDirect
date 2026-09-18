require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const HarvestLot = require('./models/HarvestLot');
const MarketPrice = require('./models/MarketPrice');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agridirect_db';
    await mongoose.connect(connUri);
    console.log('[AgriDirect Seeder] Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await HarvestLot.deleteMany({});
    await MarketPrice.deleteMany({});
    await Order.deleteMany({});
    console.log('[AgriDirect Seeder] Cleared old collections.');

    // 1. Seed Users (Farmers & Commercial Buyers)
    const users = await User.insertMany([
      {
        name: 'Sunil Bandara',
        role: 'farmer',
        organization: 'Pedro Estate High Farms',
        email: 'sunil.bandara@highlandfarms.lk',
        phone: '+94 77 220 1199',
        location: { district: 'Nuwara Eliya', cityOrVillage: 'Kandapola' },
        rating: 4.9
      },
      {
        name: 'Kithsiri Jayasinghe',
        role: 'farmer',
        organization: 'Dambulla Valley Harvest Co.',
        email: 'kithsiri.j@dambullaharvest.lk',
        phone: '+94 71 884 9021',
        location: { district: 'Matale', cityOrVillage: 'Dambulla' },
        rating: 4.8
      },
      {
        name: 'Nagaraja Thevathas',
        role: 'farmer',
        organization: 'Northern Spice & Chilli Growers',
        email: 'thevathas@jaffnagreen.lk',
        phone: '+94 76 331 4452',
        location: { district: 'Jaffna', cityOrVillage: 'Chavakachcheri' },
        rating: 4.9
      },
      {
        name: 'Dharmadasa Rajapaksha',
        role: 'farmer',
        organization: 'Badulla Highland Organics',
        email: 'dharmadasa@badullaorganics.lk',
        phone: '+94 72 443 8810',
        location: { district: 'Badulla', cityOrVillage: 'Welimada' },
        rating: 4.7
      },
      {
        name: 'Samantha Wickramasinghe',
        role: 'buyer',
        organization: 'Keells Supermarket Central Logistics',
        email: 'samantha.w@keells.lk',
        phone: '+94 11 230 3500',
        location: { district: 'Colombo', cityOrVillage: 'Peliyagoda' },
        rating: 5.0
      },
      {
        name: 'Chef Jerome Rodrigo',
        role: 'buyer',
        organization: 'Hilton Colombo Culinary Sourcing',
        email: 'jerome.r@hiltoncolombo.com',
        phone: '+94 11 249 2492',
        location: { district: 'Colombo', cityOrVillage: 'Fort' },
        rating: 4.9
      },
      {
        name: 'Dilshan Peiris',
        role: 'buyer',
        organization: 'Cargills Agrifoods Processing Ltd',
        email: 'dilshan.p@cargillsceylon.com',
        phone: '+94 11 242 7777',
        location: { district: 'Gampaha', cityOrVillage: 'Ja-Ela' },
        rating: 4.8
      }
    ]);
    console.log(`[AgriDirect Seeder] Seeded ${users.length} Users.`);

    // 2. Seed Daily Benchmark Market Prices (Sri Lanka Wholesale Indexes)
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
      }
    ]);
    console.log(`[AgriDirect Seeder] Seeded ${marketPrices.length} Wholesale Benchmark Indexes.`);

    const farmer1 = users[0];
    const farmer2 = users[1];
    const farmer3 = users[2];
    const farmer4 = users[3];

    const buyer1 = users[4]; // Keells
    const buyer2 = users[5]; // Hilton
    const buyer3 = users[6]; // Cargills

    // 3. Seed Harvest Lots with real-world bids
    const lots = await HarvestLot.insertMany([
      {
        crop: 'Nuwara Eliya Leeks',
        category: 'vegetables',
        variety: 'Ambewela Long Crisp',
        quantityKg: 1200,
        basePricePerKg: 260,
        currentHighestBid: 295,
        highestBidderName: buyer2.name,
        highestBidderOrg: buyer2.organization,
        highestBidderId: buyer2._id,
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
          description: 'Field-harvested this morning in Kandapola. Crisp white stems, trimmed roots, and zero chemical pesticide residue. Ready for cold chain dispatch.'
        },
        bids: [
          {
            bidderId: buyer1._id,
            bidderName: buyer1.name,
            buyerOrganization: buyer1.organization,
            offeredPricePerKg: 275,
            totalBidAmount: 275 * 1200,
            notes: 'Requires delivery to Peliyagoda central distribution by 6 AM.',
            placedAt: new Date(Date.now() - 3 * 3600 * 1000)
          },
          {
            bidderId: buyer2._id,
            bidderName: buyer2.name,
            buyerOrganization: buyer2.organization,
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
        quantityKg: 3500,
        basePricePerKg: 310,
        currentHighestBid: 335,
        highestBidderName: buyer3.name,
        highestBidderOrg: buyer3.organization,
        highestBidderId: buyer3._id,
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
          description: 'Naturally sun-cured over 5 days for long shelf-life. Uniform 60-70mm caliber bulbs with dry outer skin. Stored in ventilated dry shed.'
        },
        bids: [
          {
            bidderId: buyer1._id,
            bidderName: buyer1.name,
            buyerOrganization: buyer1.organization,
            offeredPricePerKg: 320,
            totalBidAmount: 320 * 3500,
            notes: 'Weekly supermarket staple replenishment.',
            placedAt: new Date(Date.now() - 5 * 3600 * 1000)
          },
          {
            bidderId: buyer3._id,
            bidderName: buyer3.name,
            buyerOrganization: buyer3.organization,
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
        quantityKg: 800,
        basePricePerKg: 620,
        currentHighestBid: 680,
        highestBidderName: buyer1.name,
        highestBidderOrg: buyer1.organization,
        highestBidderId: buyer1._id,
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
          description: 'Picked at peak firmness and glossy emerald dark color. Intense capsaicin aroma and long shelf stability under cold storage.'
        },
        bids: [
          {
            bidderId: buyer1._id,
            bidderName: buyer1.name,
            buyerOrganization: buyer1.organization,
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
        quantityKg: 2000,
        basePricePerKg: 270,
        currentHighestBid: 290,
        highestBidderName: buyer2.name,
        highestBidderOrg: buyer2.organization,
        highestBidderId: buyer2._id,
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
          description: 'Freshly dug from rich Welimada volcanic soil. Washed and dried, minimal skin damage, ideal for luxury restaurant roasting and chips.'
        },
        bids: [
          {
            bidderId: buyer2._id,
            bidderName: buyer2.name,
            buyerOrganization: buyer2.organization,
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
        quantityKg: 400,
        basePricePerKg: 2300,
        currentHighestBid: 2450,
        highestBidderName: buyer3.name,
        highestBidderOrg: buyer3.organization,
        highestBidderId: buyer3._id,
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
          description: 'Sun-dried pure black peppercorns, moisture content under 11%, high piperine content (5.8%). Zero mold, certified pesticide free.'
        },
        bids: [
          {
            bidderId: buyer3._id,
            bidderName: buyer3.name,
            buyerOrganization: buyer3.organization,
            offeredPricePerKg: 2450,
            totalBidAmount: 2450 * 400,
            notes: 'Export packaging required for spice processing.',
            placedAt: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ]
      }
    ]);
    console.log(`[AgriDirect Seeder] Seeded ${lots.length} active Harvest Lots.`);

    // 4. Seed an already Awarded Deal with an Order for instant demonstration
    const awardedLot = new HarvestLot({
      crop: 'Kandapola Carrots',
      category: 'vegetables',
      variety: 'Nantes Sweet Tender',
      quantityKg: 1500,
      basePricePerKg: 290,
      currentHighestBid: 320,
      highestBidderName: buyer1.name,
      highestBidderOrg: buyer1.organization,
      highestBidderId: buyer1._id,
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
          bidderId: buyer1._id,
          bidderName: buyer1.name,
          buyerOrganization: buyer1.organization,
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
        name: buyer1.name,
        organization: buyer1.organization,
        phone: buyer1.phone,
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
    process.exit(0);
  } catch (err) {
    console.error('[AgriDirect Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();
