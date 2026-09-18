
// Produce Image Verified Local Catalog
function getProduceImage(cropName, category, imageUrl) {
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    const trimmed = imageUrl.trim();
    if (!trimmed.includes('photo-1615485500704') && 
        !trimmed.includes('photo-1596547609652') && 
        !trimmed.includes('photo-1598170845058') && 
        !trimmed.includes('photo-1619566636858')) {
      return trimmed;
    }
  }

  const lower = (cropName || '').toLowerCase();
  if (lower.includes('leek')) return '/images/leeks.jpg';
  if (lower.includes('carrot')) return '/images/carrots.jpg';
  if (lower.includes('chilli') || lower.includes('chili')) return '/images/chillies.jpg';
  if (lower.includes('black pepper') || lower.includes('pepper')) return '/images/pepper.jpg';
  if (lower.includes('onion')) return '/images/onions.jpg';
  if (lower.includes('potato')) return '/images/potatoes.jpg';
  if (lower.includes('banana')) return '/images/bananas.jpg';
  if (lower.includes('papaya')) return '/images/papaya.jpg';
  if (lower.includes('mango')) return '/images/papaya.jpg';
  if (lower.includes('grain') || lower.includes('rice') || lower.includes('paddy') || lower.includes('samba') || lower.includes('corn') || lower.includes('maize') || lower.includes('wheat') || lower.includes('kurakkan')) return '/images/grains.jpg';

  const cat = (category || '').toLowerCase();
  if (cat === 'fruits') return '/images/bananas.jpg';
  if (cat === 'grains') return '/images/grains.jpg';
  if (cat === 'spices') return '/images/chillies.jpg';
  if (cat === 'tubers') return '/images/potatoes.jpg';
  return '/images/leeks.jpg';
}

// AgriDirect B2B Exchange Client Application
let currentRole = 'buyer'; // 'buyer' or 'farmer'
let currentUser = null;    // Logged in user object
let lotsData = [];
let marketPricesData = [];
let ordersData = [];
let activeCategory = 'all';

// DOM Elements
const lotsGrid = document.getElementById('lotsGrid');
const tickerTrack = document.getElementById('tickerTrack');
const ordersCountBadge = document.getElementById('ordersCountBadge');
const roleBuyerBtn = document.getElementById('roleBuyerBtn');
const roleFarmerBtn = document.getElementById('roleFarmerBtn');
const farmerPostBtn = document.getElementById('farmerPostBtn');
const farmerCallout = document.getElementById('farmerCallout');
const modeTag = document.getElementById('modeTag');
const heroHeadline = document.getElementById('heroHeadline');
const heroSubtitle = document.getElementById('heroSubtitle');
const marketplaceTitle = document.getElementById('marketplaceTitle');
const lotsCountText = document.getElementById('lotsCountText');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const sortFilter = document.getElementById('sortFilter');
const toastContainer = document.getElementById('toastContainer');

// KPI elements
const kpiActiveLots = document.getElementById('kpiActiveLots');
const kpiProduceKg = document.getElementById('kpiProduceKg');
const kpiTotalBids = document.getElementById('kpiTotalBids');
const kpiTransacted = document.getElementById('kpiTransacted');

// Modals
const authModalOverlay = document.getElementById('authModalOverlay');
const bidModalOverlay = document.getElementById('bidModalOverlay');
const postLotModalOverlay = document.getElementById('postLotModalOverlay');
const awardModalOverlay = document.getElementById('awardModalOverlay');
const ordersModalOverlay = document.getElementById('ordersModalOverlay');
const editLotModalOverlay = document.getElementById('editLotModalOverlay');

// Auth elements
const userProfileBadge = document.getElementById('userProfileBadge');
const authButtons = document.getElementById('authButtons');
const userAvatar = document.getElementById('userAvatar');
const userNameText = document.getElementById('userNameText');
const userOrgText = document.getElementById('userOrgText');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initAuthSession();
  initEventHandlers();
  loadMarketPrices();
  loadDashboardStats();
  loadLots();
  loadOrders();
});

// Restore saved user session if exists
function initAuthSession() {
  const saved = localStorage.getItem('agridirect_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      renderUserAuthUI();
    } catch (e) {
      localStorage.removeItem('agridirect_user');
    }
  }
}

// Update Topbar UI based on Auth state
function renderUserAuthUI() {
  if (currentUser) {
    authButtons.style.display = 'none';
    userProfileBadge.style.display = 'flex';
    userAvatar.innerHTML = currentUser.role === 'farmer' 
      ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' 
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/></svg>';
    userNameText.textContent = currentUser.name;
    userOrgText.textContent = `${currentUser.organization} • ${currentUser.role.toUpperCase()}`;

    // Auto-switch portal to matching role
    if (currentUser.role !== currentRole) {
      switchRole(currentUser.role);
    }
  } else {
    authButtons.style.display = 'flex';
    userProfileBadge.style.display = 'none';
  }
}

// Event Handlers
function initEventHandlers() {
  // Role Switcher
  roleBuyerBtn.addEventListener('click', () => switchRole('buyer'));
  roleFarmerBtn.addEventListener('click', () => switchRole('farmer'));

  // Auth Modals
  document.getElementById('openLoginBtn').addEventListener('click', () => {
    switchAuthTab('login');
    openModal(authModalOverlay);
  });
  document.getElementById('openRegisterBtn').addEventListener('click', () => {
    switchAuthTab('register');
    openModal(authModalOverlay);
  });
  document.getElementById('closeAuthModal').addEventListener('click', () => closeModal(authModalOverlay));
  document.getElementById('cancelLoginBtn').addEventListener('click', () => closeModal(authModalOverlay));
  document.getElementById('cancelRegBtn').addEventListener('click', () => closeModal(authModalOverlay));

  document.getElementById('tabLoginBtn').addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tabRegisterBtn').addEventListener('click', () => switchAuthTab('register'));

  // Registration role change label
  document.querySelectorAll('input[name="regRole"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const orgLabel = document.getElementById('regOrgLabel');
      const orgInput = document.getElementById('regOrg');
      if (e.target.value === 'farmer') {
        orgLabel.textContent = 'Farm / Estate Name *';
        orgInput.placeholder = 'e.g. Horton Valley Organics';
      } else {
        orgLabel.textContent = 'Business / Organization Name *';
        orgInput.placeholder = 'e.g. Shangri-La Procurement / Keells Supermarket';
      }
    });
  });

  // Auth Forms Submit
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  // Logout
  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('agridirect_user');
    renderUserAuthUI();
    showToast('Signed out successfully.');
    filterAndRenderLots();
  });

  // 1-Click Quick Demo Login Buttons in Hero
  document.querySelectorAll('.btn-demo-quick').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.email;
      await performQuickLogin(email, 'password123');
    });
  });

  // Farmer listing buttons
  farmerPostBtn.addEventListener('click', () => {
    prefillFarmerLotForm();
    openModal(postLotModalOverlay);
  });
  document.getElementById('calloutListBtn')?.addEventListener('click', () => {
    prefillFarmerLotForm();
    openModal(postLotModalOverlay);
  });

  // Orders button
  document.getElementById('viewOrdersBtn').addEventListener('click', () => {
    loadOrders();
    openModal(ordersModalOverlay);
  });
  document.getElementById('trackOrderNavBtn').addEventListener('click', () => {
    loadOrders();
    openModal(ordersModalOverlay);
  });

  // Modal Closers
  document.getElementById('closeBidModal').addEventListener('click', () => closeModal(bidModalOverlay));
  document.getElementById('cancelBidBtn').addEventListener('click', () => closeModal(bidModalOverlay));

  document.getElementById('closePostLotModal').addEventListener('click', () => closeModal(postLotModalOverlay));
  document.getElementById('cancelPostLotBtn').addEventListener('click', () => closeModal(postLotModalOverlay));

  document.getElementById('closeAwardModal').addEventListener('click', () => closeModal(awardModalOverlay));
  document.getElementById('cancelAwardBtn').addEventListener('click', () => closeModal(awardModalOverlay));

  document.getElementById('closeOrdersModal').addEventListener('click', () => closeModal(ordersModalOverlay));

  // Edit Lot Modal Closers
  document.getElementById('closeEditLotModal').addEventListener('click', () => closeModal(editLotModalOverlay));
  document.getElementById('cancelEditLotBtn').addEventListener('click', () => closeModal(editLotModalOverlay));

  // Edit Lot Form Submit
  document.getElementById('editLotForm').addEventListener('submit', handleSaveEditLot);

  // Delete from Edit Modal
  document.getElementById('deleteFromEditBtn').addEventListener('click', () => {
    const lotId = document.getElementById('editLotId').value;
    const lot = lotsData.find(l => l._id === lotId);
    handleDeleteLot(lotId, lot?.crop);
  });

  // Close when clicking overlay backdrop
  [authModalOverlay, bidModalOverlay, postLotModalOverlay, awardModalOverlay, ordersModalOverlay, editLotModalOverlay].forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Category Tabs
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      filterAndRenderLots();
    });
  });

  // Search & Filter Inputs
  searchInput.addEventListener('input', () => filterAndRenderLots());
  statusFilter.addEventListener('change', () => filterAndRenderLots());
  sortFilter.addEventListener('change', () => filterAndRenderLots());

  // Quick Bid Increment Buttons
  document.querySelectorAll('.btn-increment').forEach(btn => {
    btn.addEventListener('click', () => {
      const inc = Number(btn.dataset.inc);
      const minNext = Number(document.getElementById('bidOfferInput').min);
      const currentVal = Number(document.getElementById('bidOfferInput').value) || minNext;
      const newVal = Math.max(minNext, currentVal + inc);
      document.getElementById('bidOfferInput').value = newVal;
      updateContractCalc();
    });
  });

  document.getElementById('bidOfferInput').addEventListener('input', updateContractCalc);

  // Submit Bid Form
  document.getElementById('placeBidForm').addEventListener('submit', handlePlaceBid);

  // Submit Post Lot Form
  document.getElementById('postLotForm').addEventListener('submit', handlePostLot);

  // Confirm Award Button
  document.getElementById('confirmAwardBtn').addEventListener('click', handleAwardDeal);

  // Track Single Order Button in Modal
  document.getElementById('searchOrderBtn').addEventListener('click', handleSearchOrder);
}

// Switch Auth Modal Tabs
function switchAuthTab(tab) {
  const loginTab = document.getElementById('tabLoginBtn');
  const regTab = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');

  if (tab === 'login') {
    loginTab.classList.add('active');
    regTab.classList.remove('active');
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
  } else {
    regTab.classList.add('active');
    loginTab.classList.remove('active');
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
  }
}

// Perform Login API Call
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('submitLoginBtn');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      currentUser = json.data;
      localStorage.setItem('agridirect_user', JSON.stringify(currentUser));
      renderUserAuthUI();
      closeModal(authModalOverlay);
      showToast(json.message);
      filterAndRenderLots();
    } else {
      showToast(json.error || 'Invalid credentials', 'error');
    }
  } catch (err) {
    showToast('Failed to sign in. Server offline?', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In to Exchange';
  }
}

// Perform Registration API Call
async function handleRegister(e) {
  e.preventDefault();
  const role = document.querySelector('input[name="regRole"]:checked').value;
  const name = document.getElementById('regName').value.trim();
  const organization = document.getElementById('regOrg').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const district = document.getElementById('regDistrict').value;
  const password = document.getElementById('regPassword').value;

  const submitBtn = document.getElementById('submitRegisterBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, organization, email, phone, district, password })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      currentUser = json.data;
      localStorage.setItem('agridirect_user', JSON.stringify(currentUser));
      renderUserAuthUI();
      closeModal(authModalOverlay);
      showToast(json.message);
      filterAndRenderLots();
    } else {
      showToast(json.error || (json.errors ? json.errors.join(', ') : 'Registration failed'), 'error');
    }
  } catch (err) {
    showToast('Registration error. Please retry.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Registration';
  }
}

// Quick Demo Login (for presentations)
async function performQuickLogin(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      currentUser = json.data;
      localStorage.setItem('agridirect_user', JSON.stringify(currentUser));
      renderUserAuthUI();
      showToast(`Quick Logged In as ${currentUser.name} (${currentUser.organization})!`);
      filterAndRenderLots();
    }
  } catch (err) {
    showToast('Quick login failed', 'error');
  }
}

// Switch Role
function switchRole(role) {
  currentRole = role;
  if (role === 'buyer') {
    roleBuyerBtn.classList.add('active');
    roleFarmerBtn.classList.remove('active');
    farmerPostBtn.style.display = 'none';
    farmerCallout.style.display = 'none';
    modeTag.textContent = 'BUYER PROCUREMENT MODE';
    modeTag.className = 'badge-tag';
    heroHeadline.textContent = 'Direct Farm Gate Bidding & Daily Wholesale Procurement';
    heroSubtitle.textContent = 'Eliminate broker exploitation. Commercial kitchens, supermarkets, and food processors bid directly on freshly harvested farm lots across Sri Lanka with transparent price discovery and cold-chain escrow delivery.';
    marketplaceTitle.textContent = 'Live Harvest Exchange Lots (Buyer Bidding)';
  } else {
    roleFarmerBtn.classList.add('active');
    roleBuyerBtn.classList.remove('active');
    farmerPostBtn.style.display = 'inline-flex';
    farmerCallout.style.display = 'flex';
    modeTag.textContent = 'FARMER COMMAND HUB';
    modeTag.className = 'badge-tag bg-amber-tag';
    heroHeadline.textContent = 'Post Daily Morning Harvest & Award High-Value Commercial Deals';
    heroSubtitle.textContent = 'List fresh produce directly to verified commercial buyers. Receive instant competing bids from top hotels and supermarkets, and award deals with 100% escrow protection and direct farmgate pickup.';
    marketplaceTitle.textContent = 'Farmer Harvest Lots (Manage & Award Deals)';
  }
  filterAndRenderLots();
}

// Open / Close Modal
function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Show Toast
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' 
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Fetch Market Benchmark Prices
async function loadMarketPrices() {
  try {
    const res = await fetch('/api/market-prices');
    const json = await res.json();
    if (json.success) {
      marketPricesData = json.data;
      renderTicker(marketPricesData);
    }
  } catch (err) {
    console.error('Failed to load market prices:', err);
  }
}

function renderTicker(prices) {
  if (!prices || prices.length === 0) return;
  const itemsHtml = prices.map(p => {
    const trendIcon = p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '▬';
    const trendColor = p.trend === 'up' ? '#34d399' : p.trend === 'down' ? '#f87171' : '#94a3b8';
    return `<span class="ticker-item">
      <span class="crop-badge">${p.crop}</span>:
      Dambulla <span class="price-badge">Rs.${p.dambullaWholesalePrice}/kg</span> |
      Manning <span class="price-badge">Rs.${p.manningWholesalePrice}/kg</span>
      <small style="color: ${trendColor}">${trendIcon}</small>
    </span>`;
  }).join('&nbsp;&nbsp;•&nbsp;&nbsp;');

  tickerTrack.innerHTML = `${itemsHtml}&nbsp;&nbsp;•&nbsp;&nbsp;${itemsHtml}`;
}

// Fetch Dashboard Analytics
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/market-prices/stats');
    const json = await res.json();
    if (json.success) {
      const stats = json.data;
      kpiActiveLots.textContent = stats.activeLots || 0;
      kpiProduceKg.textContent = Number(stats.totalProduceKg || 0).toLocaleString() + ' kg';
      kpiTotalBids.textContent = stats.totalBids || 0;
      kpiTransacted.textContent = 'Rs. ' + Number(stats.totalTransactedLKR || 0).toLocaleString();
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Fetch Harvest Lots
async function loadLots() {
  try {
    const res = await fetch('/api/lots');
    const json = await res.json();
    if (json.success) {
      lotsData = json.data;
      filterAndRenderLots();
    }
  } catch (err) {
    lotsGrid.innerHTML = `<div class="empty-state">
      <h4>Failed to connect to AgriDirect API</h4>
      <p>Ensure backend is running on port 5050.</p>
    </div>`;
  }
}

// Filter and Render Lots
function filterAndRenderLots() {
  let filtered = [...lotsData];

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(l => l.category.toLowerCase() === activeCategory.toLowerCase());
  }

  // Status filter
  const statusVal = statusFilter.value;
  if (statusVal !== 'all') {
    filtered = filtered.filter(l => l.status === statusVal);
  }

  // Search keyword
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(l =>
      l.crop.toLowerCase().includes(query) ||
      (l.variety && l.variety.toLowerCase().includes(query)) ||
      (l.farmer && l.farmer.district && l.farmer.district.toLowerCase().includes(query)) ||
      (l.farmer && l.farmer.farmName && l.farmer.farmName.toLowerCase().includes(query))
    );
  }

  // Sort
  const sortVal = sortFilter.value;
  if (sortVal === 'highestBid') {
    filtered.sort((a, b) => b.currentHighestBid - a.currentHighestBid);
  } else if (sortVal === 'quantity') {
    filtered.sort((a, b) => b.quantityKg - a.quantityKg);
  } else if (sortVal === 'priceLow') {
    filtered.sort((a, b) => a.basePricePerKg - b.basePricePerKg);
  } else {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  lotsCountText.textContent = `Showing ${filtered.length} of ${lotsData.length} lots`;

  if (filtered.length === 0) {
    lotsGrid.innerHTML = `<div class="empty-state">
      <h4>No harvest lots match your criteria</h4>
      <p>Try resetting filters or search terms.</p>
    </div>`;
    return;
  }

  lotsGrid.innerHTML = filtered.map(lot => renderLotCard(lot)).join('');
  attachCardEvents();
}

// Render Single Card HTML
function renderLotCard(lot) {
  const isOpen = lot.status === 'bidding_open';
  const statusClass = isOpen ? 'status-open' : 'status-awarded';
  const statusLabel = isOpen 
      ? `<span class="status-dot-active"></span> Bidding Open` 
      : `<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2'><path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/><path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/><path d='M4 22h16'/><path d='M18 4H6v7a6 6 0 0 0 12 0V4Z'/></svg> Deal Awarded`;

  const highestBidDisplay = lot.currentHighestBid && lot.currentHighestBid > 0 
    ? `Rs. ${lot.currentHighestBid} / kg` 
    : `Rs. ${lot.basePricePerKg} / kg`;

  const leaderOrg = lot.highestBidderOrg || 'No commercial bids yet';
  const bidsCount = lot.bids ? lot.bids.length : 0;

  let actionButton = '';
  if (isOpen) {
    if (currentRole === 'buyer') {
      actionButton = `<button class="btn btn-primary lot-action-btn btn-place-bid" data-id="${lot._id}">
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg> Place Commercial Bid
      </button>`;
    } else {
      actionButton = `
      <div class="farmer-card-actions">
        <button class="btn btn-sm btn-outline btn-edit-lot" data-id="${lot._id}" title="Edit harvest lot specifications">
          <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'/></svg> Edit
        </button>
        <button class="btn btn-sm btn-outline-danger btn-delete-lot" data-id="${lot._id}" data-crop="${lot.crop}" title="Remove lot from exchange">
          <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><polyline points='3 6 5 6 21 6'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg> Remove
        </button>
        <button class="btn btn-sm btn-primary lot-action-btn btn-review-award" data-id="${lot._id}">
          <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M9 11l3 3L22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/></svg> Review (${bidsCount})
        </button>
      </div>`;
    }
  } else {
    if (currentRole === 'farmer') {
      actionButton = `
      <div class="farmer-card-actions">
        <button class="btn btn-sm btn-outline-danger btn-delete-lot" data-id="${lot._id}" data-crop="${lot.crop}" title="Remove lot and cancel contract">
          <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><polyline points='3 6 5 6 21 6'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg> Remove
        </button>
        <button class="btn btn-sm btn-outline lot-action-btn btn-view-order-deal" data-order="${lot.awardedOrder || ''}">
          <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='1' y='3' width='15' height='13'/><polygon points='16 8 20 8 23 11 23 16 16 16 16 8'/><circle cx='5.5' cy='18.5' r='2.5'/><circle cx='18.5' cy='18.5' r='2.5'/></svg> View Deal
        </button>
      </div>`;
    } else {
      actionButton = `<button class="btn btn-outline lot-action-btn btn-view-order-deal" data-order="${lot.awardedOrder || ''}">
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='1' y='3' width='15' height='13'/><polygon points='16 8 20 8 23 11 23 16 16 16 8'/><circle cx='5.5' cy='18.5' r='2.5'/><circle cx='18.5' cy='18.5' r='2.5'/></svg> View Deal & Tracking
      </button>`;
    }
  }

  return `
    <div class="lot-card" data-lot-id="${lot._id}">
      <div class="lot-image-wrap">
        <img src="${getProduceImage(lot.crop, lot.category, lot.imageUrl)}" alt="${lot.crop}" class="lot-image" loading="lazy" />
        <div class="lot-image-gradient"></div>
        <div class="lot-image-badges">
          <div class="lot-badge-row">
            <span class="category-tag ${lot.category}">${lot.category}</span>
            ${lot.specifications?.organicCertified ? '<span class="organic-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg> Organic</span>' : ''}
          </div>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
      </div>

      <div class="lot-card-body">
        <h4 class="crop-name">${lot.crop}</h4>
        <div class="crop-variety">${lot.variety || 'Standard Harvest'}</div>

        <div class="farm-location-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span><strong>${lot.farmer?.district || 'Central Province'}</strong> (${lot.farmer?.village || 'Highlands'}) • ${lot.farmer?.farmName || 'Verified Farm'}</span>
        </div>

        <div class="specs-strip">
          <span class="spec-entry">Packaging: <strong>${lot.specifications?.packaging || 'Standard Crates'}</strong></span>
          ${lot.specifications?.description ? `<p style="width: 100%; font-size: 0.76rem; color: #475569; margin-top: 4px;">"${lot.specifications.description}"</p>` : ''}
        </div>

        <div class="financial-box">
          <div class="financial-item">
            <span class="financial-lbl">Available Quantity</span>
            <span class="financial-val">${Number(lot.quantityKg).toLocaleString()} kg</span>
          </div>
          <div class="financial-item">
            <span class="financial-lbl">Reserve Base Price</span>
            <span class="financial-val">Rs. ${lot.basePricePerKg} / kg</span>
          </div>
          <div class="financial-item primary-highlight">
            <span class="financial-lbl">Current Highest Commercial Bid</span>
            <span class="financial-val">${highestBidDisplay}</span>
            <span class="leader-name">Leader: ${leaderOrg}</span>
          </div>
        </div>
      </div>

      <div class="lot-card-footer">
        <div class="bids-counter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${bidsCount} Bids Placed</span>
        </div>
        <div style="flex: 1; max-width: ${currentRole === 'farmer' ? '280px' : '210px'};">
          ${actionButton}
        </div>
      </div>
    </div>
  `;
}

// Attach Event Listeners to Card Buttons
function attachCardEvents() {
  document.querySelectorAll('.btn-place-bid').forEach(btn => {
    btn.addEventListener('click', () => openBidModal(btn.dataset.id));
  });

  document.querySelectorAll('.btn-review-award').forEach(btn => {
    btn.addEventListener('click', () => openAwardModal(btn.dataset.id));
  });

  document.querySelectorAll('.btn-edit-lot').forEach(btn => {
    btn.addEventListener('click', () => openEditLotModal(btn.dataset.id));
  });

  document.querySelectorAll('.btn-delete-lot').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteLot(btn.dataset.id, btn.dataset.crop));
  });

  document.querySelectorAll('.btn-view-order-deal').forEach(btn => {
    btn.addEventListener('click', () => {
      loadOrders();
      openModal(ordersModalOverlay);
    });
  });
}

// Open Place Bid Modal
let activeBidLot = null;
function openBidModal(lotId) {
  if (!currentUser) {
    showToast('Please sign in or select a demo profile to place commercial bids.', 'error');
    switchAuthTab('login');
    openModal(authModalOverlay);
    return;
  }

  const lot = lotsData.find(l => l._id === lotId);
  if (!lot) return;
  activeBidLot = lot;

  document.getElementById('bidLotId').value = lot._id;
  document.getElementById('bidModalCropName').textContent = lot.crop;
  document.getElementById('bidModalLotSub').textContent = `Variety: ${lot.variety} • Total Lot: ${Number(lot.quantityKg).toLocaleString()} kg`;
  document.getElementById('bidModalBasePrice').textContent = `Rs. ${lot.basePricePerKg} / kg`;

  const currentHighest = lot.currentHighestBid || lot.basePricePerKg;
  document.getElementById('bidModalCurrentHighest').textContent = `Rs. ${currentHighest} / kg`;

  const minNext = currentHighest + 1;
  document.getElementById('bidModalMinNext').textContent = `Rs. ${minNext} / kg`;

  const bidOfferInput = document.getElementById('bidOfferInput');
  bidOfferInput.min = minNext;
  bidOfferInput.value = minNext + 5;
  updateContractCalc();

  document.getElementById('bidderOrgDisplay').textContent = currentUser.organization;
  document.getElementById('bidderContactDisplay').textContent = `Representative: ${currentUser.name} (${currentUser.phone})`;

  openModal(bidModalOverlay);
}

function updateContractCalc() {
  if (!activeBidLot) return;
  const offer = Number(document.getElementById('bidOfferInput').value) || 0;
  const total = Math.round(offer * activeBidLot.quantityKg);
  document.getElementById('bidTotalContractCalc').textContent = `Rs. ${total.toLocaleString()}`;
  document.getElementById('bidLotWeightSummary').textContent = `(@ ${Number(activeBidLot.quantityKg).toLocaleString()} kg)`;
}

// Submit Bid
async function handlePlaceBid(e) {
  e.preventDefault();
  if (!currentUser) {
    showToast('Please sign in to submit a bid', 'error');
    return;
  }

  const lotId = document.getElementById('bidLotId').value;
  const offer = Number(document.getElementById('bidOfferInput').value);
  const notes = document.getElementById('bidNotes').value.trim();

  const submitBtn = document.getElementById('submitBidBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting Bid to Exchange...';

  try {
    const res = await fetch(`/api/lots/${lotId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offeredPricePerKg: offer,
        bidderName: currentUser.name,
        buyerOrganization: currentUser.organization,
        bidderId: currentUser._id,
        notes
      })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      showToast(`Bid Placed Successfully! Your offer of Rs. ${offer}/kg is now leading on ${activeBidLot.crop}!`);
      closeModal(bidModalOverlay);
      await loadLots();
      await loadDashboardStats();
    } else {
      showToast(json.error || json.message || 'Bid rejected.', 'error');
    }
  } catch (err) {
    showToast('Failed to submit bid. Please check network connection.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Place Official Bid';
  }
}

// Pre-fill Farmer form with logged-in farmer details
function prefillFarmerLotForm() {
  if (currentUser && currentUser.role === 'farmer') {
    document.getElementById('farmerName').value = currentUser.name;
    document.getElementById('farmerEstate').value = currentUser.organization;
    document.getElementById('farmerPhone').value = currentUser.phone;
    if (currentUser.location && currentUser.location.district) {
      document.getElementById('farmerDistrict').value = currentUser.location.district;
    }
    if (currentUser.location && currentUser.location.cityOrVillage) {
      document.getElementById('farmerVillage').value = currentUser.location.cityOrVillage;
    }
  }
}

// Submit Post Harvest Lot Form (Farmer)
async function handlePostLot(e) {
  e.preventDefault();
  const crop = document.getElementById('lotCrop').value.trim();
  const category = document.getElementById('lotCategory').value;
  const variety = document.getElementById('lotVariety').value.trim();
  const imageUrl = document.getElementById('lotImageUrl') ? document.getElementById('lotImageUrl').value.trim() : '';
  const quantityKg = Number(document.getElementById('lotQuantity').value);
  const basePricePerKg = Number(document.getElementById('lotBasePrice').value);

  const farmerName = document.getElementById('farmerName').value.trim();
  const farmName = document.getElementById('farmerEstate').value.trim();
  const phone = document.getElementById('farmerPhone').value.trim();
  const district = document.getElementById('farmerDistrict').value;
  const village = document.getElementById('farmerVillage').value.trim();

  const grade = document.getElementById('lotGrade').value;
  const packaging = document.getElementById('lotPackaging').value.trim();
  const organicCertified = document.getElementById('lotOrganic').checked;
  const description = document.getElementById('lotDescription').value.trim();

  const submitBtn = document.getElementById('submitPostLotBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Listing Lot on MongoDB...';

  try {
    const res = await fetch('/api/lots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop,
        category,
        variety,
        imageUrl,
        quantityKg,
        basePricePerKg,
        farmer: {
          farmerId: currentUser ? currentUser._id : null,
          name: farmerName,
          farmName,
          phone,
          district,
          village
        },
        specifications: { grade, packaging, organicCertified, description }
      })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      showToast(`New Lot Listed! ${crop} (${quantityKg} kg) is now live on the exchange.`);
      closeModal(postLotModalOverlay);
      document.getElementById('postLotForm').reset();
      await loadLots();
      await loadDashboardStats();
    } else {
      showToast(json.error || 'Failed to list harvest lot.', 'error');
    }
  } catch (err) {
    showToast('Error listing lot. Backend offline?', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publish Lot to Exchange (48h Bidding Window)';
  }
}

// Open Award Modal (Farmer)
let activeAwardLot = null;
function openAwardModal(lotId) {
  const lot = lotsData.find(l => l._id === lotId);
  if (!lot) return;
  activeAwardLot = lot;

  document.getElementById('awardLotId').value = lot._id;
  document.getElementById('awardLotCropName').textContent = lot.crop;
  document.getElementById('awardLotQuantity').textContent = `Variety: ${lot.variety || 'Standard'} • Total: ${Number(lot.quantityKg).toLocaleString()} kg`;

  const topPrice = lot.currentHighestBid || lot.basePricePerKg;
  const totalVal = Math.round(topPrice * lot.quantityKg);
  document.getElementById('awardTopPrice').textContent = `Rs. ${topPrice} / kg`;
  document.getElementById('awardTopTotal').textContent = `Total Contract: Rs. ${totalVal.toLocaleString()}`;

  const bids = lot.bids || [];
  document.getElementById('awardBidsCount').textContent = bids.length;

  const sortedBids = [...bids].sort((a, b) => b.offeredPricePerKg - a.offeredPricePerKg);
  const bidsListEl = document.getElementById('awardBidsList');
  const confirmAwardBtn = document.getElementById('confirmAwardBtn');
  const deleteFromAwardBtn = document.getElementById('deleteFromAwardBtn');

  if (deleteFromAwardBtn) {
    deleteFromAwardBtn.onclick = () => handleDeleteLot(lot._id, lot.crop);
  }

  if (sortedBids.length === 0) {
    bidsListEl.innerHTML = `
      <div class="no-bids-notice">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" style="margin-bottom: 8px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="font-weight: 700; color: #475569; margin-bottom: 4px;">No Commercial Bids Placed Yet</p>
        <p style="font-size: 0.82rem; color: #64748b; max-width: 360px; margin: 0 auto; line-height: 1.4;">
          Commercial buyers must place competing bids before you can award an escrow contract. Switch to Buyer Mode to submit an offer or wait for commercial buyers to bid.
        </p>
      </div>`;
    confirmAwardBtn.disabled = true;
    confirmAwardBtn.textContent = 'Cannot Award — Awaiting Buyer Bids (0 Bids)';
  } else {
    confirmAwardBtn.disabled = false;
    const topBid = sortedBids[0];
    confirmAwardBtn.textContent = `Accept Highest Bid (Rs. ${topBid.offeredPricePerKg}/kg) & Award Contract`;
    bidsListEl.innerHTML = sortedBids.map((b, idx) => `
      <div class="bid-row-item ${idx === 0 ? 'winning' : ''}">
        <div style="display: flex; align-items: center;">
          <span class="bid-rank-pill">#${idx + 1}</span>
          <div class="bidder-info">
            <strong>${b.buyerOrganization}</strong>
            <small>Contact: ${b.bidderName} • ${new Date(b.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
            ${b.notes ? `<small style="display: block; color: #047857;">"${b.notes}"</small>` : ''}
          </div>
        </div>
        <div class="bid-row-financials">
          <div class="bid-row-price">Rs. ${b.offeredPricePerKg} / kg</div>
          <small>Total: Rs. ${Number(b.totalBidAmount).toLocaleString()}</small>
        </div>
      </div>
    `).join('');
  }

  openModal(awardModalOverlay);
}

// Handle Award Deal
async function handleAwardDeal() {
  if (!activeAwardLot) return;
  const lotId = activeAwardLot._id;
  const awardBtn = document.getElementById('confirmAwardBtn');

  awardBtn.disabled = true;
  awardBtn.textContent = 'Generating Escrow Contract...';

  try {
    const res = await fetch(`/api/lots/${lotId}/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const json = await res.json();
    if (res.ok && json.success) {
      showToast(`Deal Awarded! Tracking number: ${json.data.order.trackingNumber}`);
      closeModal(awardModalOverlay);
      await loadLots();
      await loadOrders();
      await loadDashboardStats();
    } else {
      showToast(json.error || 'Failed to award deal.', 'error');
    }
  } catch (err) {
    showToast('Network error while awarding deal.', 'error');
  } finally {
    awardBtn.disabled = false;
    awardBtn.textContent = 'Accept Highest Bid & Award Contract';
  }
}

// Open Edit Lot Modal (Farmer)
let activeEditLot = null;
function openEditLotModal(lotId) {
  const lot = lotsData.find(l => l._id === lotId);
  if (!lot) return;
  activeEditLot = lot;

  document.getElementById('editLotId').value = lot._id;
  document.getElementById('editLotCrop').value = lot.crop;
  document.getElementById('editLotCategory').value = lot.category;
  document.getElementById('editLotVariety').value = lot.variety || '';
  document.getElementById('editLotQuantity').value = lot.quantityKg;
  document.getElementById('editLotBasePrice').value = lot.basePricePerKg;
  document.getElementById('editLotGrade').value = lot.specifications?.grade || 'Grade A Premium Export Quality';
  document.getElementById('editLotPackaging').value = lot.specifications?.packaging || '';
  document.getElementById('editLotOrganic').checked = Boolean(lot.specifications?.organicCertified);
  document.getElementById('editLotDescription').value = lot.specifications?.description || '';

  openModal(editLotModalOverlay);
}

// Handle Save Edit Lot
async function handleSaveEditLot(e) {
  e.preventDefault();
  const lotId = document.getElementById('editLotId').value;
  const crop = document.getElementById('editLotCrop').value.trim();
  const category = document.getElementById('editLotCategory').value;
  const variety = document.getElementById('editLotVariety').value.trim();
  const quantityKg = Number(document.getElementById('editLotQuantity').value);
  const basePricePerKg = Number(document.getElementById('editLotBasePrice').value);
  const grade = document.getElementById('editLotGrade').value;
  const packaging = document.getElementById('editLotPackaging').value.trim();
  const organicCertified = document.getElementById('editLotOrganic').checked;
  const description = document.getElementById('editLotDescription').value.trim();

  const saveBtn = document.getElementById('saveEditLotBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Changes...';

  try {
    const res = await fetch(`/api/lots/${lotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop,
        category,
        variety,
        quantityKg,
        basePricePerKg,
        specifications: { grade, packaging, organicCertified, description }
      })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      showToast(`Lot '${crop}' updated successfully!`);
      closeModal(editLotModalOverlay);
      await loadLots();
      await loadDashboardStats();
    } else {
      showToast(json.error || 'Failed to update harvest lot.', 'error');
    }
  } catch (err) {
    showToast('Error updating lot. Please retry.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

// Handle Delete / Remove Lot
async function handleDeleteLot(lotId, cropName) {
  const confirmed = confirm(`Are you sure you want to remove '${cropName || 'this lot'}' from the exchange? This action cannot be undone.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/lots/${lotId}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (res.ok && json.success) {
      showToast(json.message || `Lot '${cropName || ''}' successfully removed from exchange!`);
      if (editLotModalOverlay && editLotModalOverlay.classList.contains('active')) {
        closeModal(editLotModalOverlay);
      }
      if (awardModalOverlay && awardModalOverlay.classList.contains('active')) {
        closeModal(awardModalOverlay);
      }
      await loadLots();
      await loadDashboardStats();
      await loadOrders();
    } else {
      showToast(json.error || 'Failed to remove lot.', 'error');
    }
  } catch (err) {
    showToast('Error removing lot. Please retry.', 'error');
  }
}

// Load Orders & Logistics
async function loadOrders() {
  try {
    const res = await fetch('/api/orders');
    const json = await res.json();
    if (json.success) {
      ordersData = json.data;
      ordersCountBadge.textContent = ordersData.length;
      renderOrdersList(ordersData);
    }
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

function renderOrdersList(orders) {
  const container = document.getElementById('ordersListContainer');
  if (!orders || orders.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <h4>No orders awarded yet</h4>
      <p>When a farmer accepts a deal, contract details will appear here.</p>
    </div>`;
    return;
  }

  container.innerHTML = orders.map(ord => {
    const statuses = ['confirmed', 'dispatched', 'in_transit', 'delivered'];
    const currentIdx = statuses.indexOf(ord.status);

    return `
      <div class="order-card" data-order-id="${ord._id}">
        <div class="order-card-header">
          <div>
            <span class="order-tracking-badge">${ord.trackingNumber}</span>
            <strong style="margin-left: 12px; font-size: 1.05rem;">${ord.crop} (${Number(ord.quantityKg).toLocaleString()} kg)</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="status-pill status-open">Escrow: ${ord.escrowStatus.replace(/_/g, ' ').toUpperCase()}</span>
            <button class="btn btn-sm btn-danger btn-delete-order" data-id="${ord._id}" data-tracking="${ord.trackingNumber}" title="Cancel & Remove Order">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Remove Order
            </button>
          </div>
        </div>

        <div class="shipment-stepper">
          <div class="step-item ${currentIdx >= 0 ? 'completed' : ''} ${currentIdx === 0 ? 'current' : ''}">
            <div class="step-node">1</div>
            <span class="step-lbl">Funds in Escrow</span>
          </div>
          <div class="step-item ${currentIdx >= 1 ? 'completed' : ''} ${currentIdx === 1 ? 'current' : ''}">
            <div class="step-node">2</div>
            <span class="step-lbl">Cold-Chain Pickup</span>
          </div>
          <div class="step-item ${currentIdx >= 2 ? 'completed' : ''} ${currentIdx === 2 ? 'current' : ''}">
            <div class="step-node">3</div>
            <span class="step-lbl">In Transit</span>
          </div>
          <div class="step-item ${currentIdx >= 3 ? 'completed' : ''} ${currentIdx === 3 ? 'current' : ''}">
            <div class="step-node">4</div>
            <span class="step-lbl">Delivered & Released</span>
          </div>
        </div>

        <div class="order-details-grid">
          <div>
            <strong>Farmer Origin:</strong> ${ord.farmer.farmName} (${ord.farmer.district})<br>
            <small>Pickup: ${ord.farmer.pickupAddress} • ${ord.farmer.phone}</small>
          </div>
          <div>
            <strong>Commercial Buyer:</strong> ${ord.buyer.organization}<br>
            <small>Contact: ${ord.buyer.name} • Delivery: ${ord.buyer.deliveryAddress}</small>
          </div>
          <div>
            <strong>Logistics Partner:</strong> ${ord.logistics?.courier || 'Domex Agro Express'}<br>
            <small>Vehicle: ${ord.logistics?.vehicleNumber || 'WP-AG-8291'} • Driver: ${ord.logistics?.driverContact || '+94 77 123 9988'}</small>
          </div>
          <div>
            <strong>Contract Total Value:</strong> Rs. ${Number(ord.totalContractValue).toLocaleString()}<br>
            <small>Winning Rate: Rs. ${ord.winningPricePerKg} / kg</small>
          </div>
        </div>

        <div class="order-status-actions">
          <small style="margin-right: auto; color: #64748b;">Simulate Logistics Update:</small>
          ${ord.status !== 'in_transit' && ord.status !== 'delivered' ? `
            <button class="btn btn-sm btn-outline btn-step-status" data-id="${ord._id}" data-status="in_transit">
              Mark In-Transit
            </button>
          ` : ''}
          ${ord.status !== 'delivered' ? `
            <button class="btn btn-sm btn-primary btn-step-status" data-id="${ord._id}" data-status="delivered">
              Confirm Delivery & Release Escrow
            </button>
          ` : '<span style="color: #047857; font-weight: 700; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 5px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Delivered & Escrow Released to Farmer</span>'}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.btn-step-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.dataset.id;
      const nextStatus = btn.dataset.status;
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(`Order status updated to: ${nextStatus}`);
          await loadOrders();
          await loadDashboardStats();
        }
      } catch (err) {
        showToast('Failed to update status', 'error');
      }
    });
  });

  // Delete / Cancel Exchange Order Listener
  document.querySelectorAll('.btn-delete-order').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const orderId = btn.dataset.id;
      const tracking = btn.dataset.tracking;
      if (!confirm(`Are you sure you want to remove exchange order ${tracking}? The associated harvest lot will be reopened on the exchange.`)) {
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast(`Order #${tracking} removed. Associated harvest lot reopened!`);
          await loadOrders();
          await loadLots();
          await loadDashboardStats();
        } else {
          showToast(json.error || 'Failed to remove order.', 'error');
        }
      } catch (err) {
        showToast('Failed to remove order. Please try again.', 'error');
      }
    });
  });
}

// Search Order by Tracking Number
async function handleSearchOrder() {
  const term = document.getElementById('orderSearchInput').value.trim().toUpperCase();
  if (!term) {
    renderOrdersList(ordersData);
    return;
  }

  try {
    const res = await fetch(`/api/orders/${term}`);
    const json = await res.json();
    if (res.ok && json.success) {
      renderOrdersList([json.data]);
    } else {
      document.getElementById('ordersListContainer').innerHTML = `
        <div class="empty-state">
          <h4>No shipment found with tracking #${term}</h4>
          <p>Please double-check the tracking ID.</p>
        </div>
      `;
    }
  } catch (err) {
    showToast('Failed to fetch tracking details.', 'error');
  }
}
