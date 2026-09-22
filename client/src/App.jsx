import React, { useState, useEffect, useCallback } from 'react';
import TickerBar from './components/TickerBar';
import Navbar from './components/Navbar';
import HeroKPI from './components/HeroKPI';
import FilterPanel from './components/FilterPanel';
import LotsGrid from './components/LotsGrid';
import Toast from './components/Toast';

import AuthModal from './components/modals/AuthModal';
import BiddingModal from './components/modals/BiddingModal';
import PostLotModal from './components/modals/PostLotModal';
import EditLotModal from './components/modals/EditLotModal';
import AwardModal from './components/modals/AwardModal';
import OrdersModal from './components/modals/OrdersModal';

import { api } from './services/api';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { currentRole } = useAuth();

  // Data states
  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [marketPrices, setMarketPrices] = useState([]);
  const [kpiStats, setKpiStats] = useState({
    activeLots: 0,
    totalKg: 0,
    totalBids: 0,
    transactedRs: 480000
  });
  const [orders, setOrders] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('bidding_open');
  const [sortFilter, setSortFilter] = useState('newest');

  // Modal states
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [bidModal, setBidModal] = useState({ open: false, lot: null });
  const [postLotModalOpen, setPostLotModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, lot: null });
  const [awardModal, setAwardModal] = useState({ open: false, lot: null });
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data loaders
  const loadLots = useCallback(async () => {
    setLoadingLots(true);
    try {
      const data = await api.getLots({
        category: activeCategory,
        status: statusFilter,
        search: searchTerm,
        sort: sortFilter
      });
      setLots(data.lots || data || []);
    } catch (err) {
      console.error('Error fetching lots:', err);
    } finally {
      setLoadingLots(false);
    }
  }, [activeCategory, statusFilter, searchTerm, sortFilter]);

  const loadMarketPrices = async () => {
    try {
      const data = await api.getMarketPrices();
      setMarketPrices(data.prices || data || []);
    } catch (err) {
      console.error('Error fetching market prices:', err);
    }
  };

  const loadKPIStats = async () => {
    try {
      const data = await api.getKPIStats();
      if (data) setKpiStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Initial mount
  useEffect(() => {
    loadMarketPrices();
    loadKPIStats();
    loadOrders();
  }, []);

  // Reload lots on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLots();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadLots]);

  // Handle Lot Delete
  const handleDeleteLot = async (lot) => {
    if (!window.confirm(`Are you sure you want to remove the harvest listing for "${lot.crop}"?`)) {
      return;
    }
    try {
      await api.deleteLot(lot._id);
      showToast(`Harvest lot for ${lot.crop} has been removed.`, 'success');
      loadLots();
      loadKPIStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="app-root">
      {/* 1. Daily Wholesale Benchmark Ticker */}
      <TickerBar
        marketPrices={marketPrices}
        onOpenOrders={() => setOrdersModalOpen(true)}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        onOpenPostLot={() => setPostLotModalOpen(true)}
        onOpenOrders={() => setOrdersModalOpen(true)}
        ordersCount={orders.length}
      />

      {/* 3. Hero & Exchange KPIs */}
      <HeroKPI stats={kpiStats} />

      {/* 4. Filter & Produce Search Main Container */}
      <main className="main-container">
        <FilterPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortFilter={sortFilter}
          onSortChange={setSortFilter}
        />

        <LotsGrid
          lots={lots}
          loading={loadingLots}
          onOpenBid={(lot) => setBidModal({ open: true, lot })}
          onOpenAward={(lot) => setAwardModal({ open: true, lot })}
          onOpenEdit={(lot) => setEditModal({ open: true, lot })}
          onDeleteLot={handleDeleteLot}
        />
      </main>

      {/* --- MODALS --- */}
      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        showToast={showToast}
      />

      <BiddingModal
        isOpen={bidModal.open}
        lot={bidModal.lot}
        onClose={() => setBidModal({ open: false, lot: null })}
        onBidSuccess={() => {
          loadLots();
          loadKPIStats();
        }}
        showToast={showToast}
      />

      <PostLotModal
        isOpen={postLotModalOpen}
        onClose={() => setPostLotModalOpen(false)}
        onSuccess={() => {
          loadLots();
          loadKPIStats();
        }}
        showToast={showToast}
      />

      <EditLotModal
        isOpen={editModal.open}
        lot={editModal.lot}
        onClose={() => setEditModal({ open: false, lot: null })}
        onSuccess={() => {
          loadLots();
        }}
        showToast={showToast}
      />

      <AwardModal
        isOpen={awardModal.open}
        lot={awardModal.lot}
        onClose={() => setAwardModal({ open: false, lot: null })}
        onSuccess={() => {
          loadLots();
          loadOrders();
          loadKPIStats();
        }}
        showToast={showToast}
      />

      <OrdersModal
        isOpen={ordersModalOpen}
        orders={orders}
        onClose={() => setOrdersModalOpen(false)}
        onRefresh={() => {
          loadOrders();
          loadKPIStats();
        }}
        showToast={showToast}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
