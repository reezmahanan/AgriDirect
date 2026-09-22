// AgriDirect API Service Wrapper
const API_BASE = '/api';

export const api = {
  // --- HARVEST LOTS ---
  async getLots(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sortBy', params.sort);

    const url = `${API_BASE}/lots${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch harvest lots');
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  },

  async getLotById(id) {
    const res = await fetch(`${API_BASE}/lots/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lot details');
    const json = await res.json();
    return json.data || json;
  },

  async createLot(lotData) {
    const payload = {
      crop: lotData.crop,
      category: lotData.category,
      quantityKg: Number(lotData.quantityKg),
      basePricePerKg: Number(lotData.basePricePerKg || lotData.reservePricePerKg),
      variety: lotData.variety || 'Fresh Morning Harvest',
      farmer: {
        name: lotData.farmer?.name || 'Local Farmer',
        farmName: lotData.farmer?.organization || lotData.farmer?.farmName || 'Estate Harvest Co.',
        district: lotData.location?.district || lotData.farmer?.district || 'Nuwara Eliya',
        village: lotData.location?.cityOrVillage || 'Farm Gate',
        phone: lotData.farmer?.phone || '+94 77 123 4567'
      },
      specifications: {
        grade: lotData.qualityGrade || lotData.specifications?.grade || 'Grade A Premium',
        organicCertified: Boolean(lotData.isOrganic || lotData.specifications?.organicCertified),
        packaging: lotData.packagingSpecs || lotData.specifications?.packaging || 'Standard Crates'
      }
    };

    const res = await fetch(`${API_BASE}/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || (data.errors && data.errors[0]) || 'Failed to list harvest lot');
    return data.data || data;
  },

  async updateLot(id, lotData) {
    const payload = {
      quantityKg: Number(lotData.quantityKg),
      basePricePerKg: Number(lotData.basePricePerKg || lotData.reservePricePerKg),
      specifications: {
        grade: lotData.qualityGrade || 'Grade A Premium',
        organicCertified: Boolean(lotData.isOrganic),
        packaging: lotData.packagingSpecs || 'Standard Crates'
      }
    };

    const res = await fetch(`${API_BASE}/lots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to update harvest lot');
    return data.data || data;
  },

  async deleteLot(id) {
    const res = await fetch(`${API_BASE}/lots/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to remove harvest lot');
    return data;
  },

  async placeBid(lotId, bidData) {
    const payload = {
      offeredPricePerKg: Number(bidData.bidPricePerKg || bidData.offeredPricePerKg),
      bidderName: bidData.buyer?.name || bidData.bidderName || 'Commercial Buyer',
      buyerOrganization: bidData.buyer?.organization || bidData.buyerOrganization || 'Procurement Group',
      notes: bidData.buyer?.notes || bidData.notes || ''
    };

    const res = await fetch(`${API_BASE}/lots/${lotId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || (data.errors && data.errors[0]) || 'Failed to place commercial bid');
    return data.data || data;
  },

  async awardLot(lotId, awardData) {
    const res = await fetch(`${API_BASE}/lots/${lotId}/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(awardData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to award contract');
    return data.data || data;
  },

  // --- MARKET PRICES & STATS ---
  async getMarketPrices() {
    const res = await fetch(`${API_BASE}/market-prices`);
    if (!res.ok) throw new Error('Failed to fetch wholesale benchmark prices');
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  },

  async getKPIStats() {
    const res = await fetch(`${API_BASE}/market-prices/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    const json = await res.json();
    return json.data || json;
  },

  // --- ORDERS & SHIPMENTS ---
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  },

  async getOrderByTracking(trackingNumber) {
    const res = await fetch(`${API_BASE}/orders/${trackingNumber}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Order not found');
    return data.data || data;
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to update order status');
    return data.data || data;
  },

  // --- AUTHENTICATION ---
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Invalid login credentials');
    const userObj = data.data || data.user || data;
    return { ...data, user: userObj, data: userObj };
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || (data.errors && data.errors[0]) || 'Registration failed');
    const userObj = data.data || data.user || data;
    return { ...data, user: userObj, data: userObj };
  }
};
