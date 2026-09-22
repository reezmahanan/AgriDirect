// AgriDirect API Service Wrapper
const API_BASE = '/api';

export const api = {
  // --- HARVEST LOTS ---
  async getLots(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);

    const url = `${API_BASE}/lots${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch harvest lots');
    return res.json();
  },

  async getLotById(id) {
    const res = await fetch(`${API_BASE}/lots/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lot details');
    return res.json();
  },

  async createLot(lotData) {
    const res = await fetch(`${API_BASE}/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lotData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to list harvest lot');
    return data;
  },

  async updateLot(id, lotData) {
    const res = await fetch(`${API_BASE}/lots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lotData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update harvest lot');
    return data;
  },

  async deleteLot(id) {
    const res = await fetch(`${API_BASE}/lots/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to remove harvest lot');
    return data;
  },

  async placeBid(lotId, bidData) {
    const res = await fetch(`${API_BASE}/lots/${lotId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bidData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place commercial bid');
    return data;
  },

  async awardLot(lotId, awardData) {
    const res = await fetch(`${API_BASE}/lots/${lotId}/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(awardData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to award contract');
    return data;
  },

  // --- MARKET PRICES & STATS ---
  async getMarketPrices() {
    const res = await fetch(`${API_BASE}/market-prices`);
    if (!res.ok) throw new Error('Failed to fetch wholesale benchmark prices');
    return res.json();
  },

  async getKPIStats() {
    const res = await fetch(`${API_BASE}/market-prices/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // --- ORDERS & SHIPMENTS ---
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderByTracking(trackingNumber) {
    const res = await fetch(`${API_BASE}/orders/${trackingNumber}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order not found');
    return data;
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  // --- AUTHENTICATION ---
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid login credentials');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  }
};
