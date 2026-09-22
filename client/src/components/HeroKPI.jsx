import React from 'react';
import { ShoppingBag, Heart, Activity, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HeroKPI({ stats }) {
  const { currentRole } = useAuth();

  const isBuyer = currentRole === 'buyer';

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text-block">
          <div className="badge-tag">
            {isBuyer ? 'BUYER PROCUREMENT MODE' : 'FARMER COMMAND HUB'}
          </div>
          <h2>
            {isBuyer
              ? 'Direct Farm Gate Bidding & Daily Wholesale Procurement'
              : 'Farmer Command Hub & Harvest Lot Management'}
          </h2>
          <p>
            {isBuyer
              ? 'Eliminate broker exploitation. Commercial kitchens, supermarkets, and food processors bid directly on freshly harvested farm lots across Sri Lanka with transparent price discovery and cold-chain escrow delivery.'
              : 'Publish morning harvest lots directly to verified commercial buyers across Sri Lanka. Compare live wholesale market benchmarks, manage incoming bids, and award escrow contracts with guaranteed cold-chain delivery.'}
          </p>
        </div>

        {/* Exchange KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-green">
              <ShoppingBag size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-val">{stats.activeLots ?? '--'}</span>
              <span className="kpi-title">Active Bidding Lots</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-amber">
              <Heart size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-val">
                {stats.totalKg ? stats.totalKg.toLocaleString() : '--'}
              </span>
              <span className="kpi-title">Daily Available (Kg)</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-blue">
              <Activity size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-val">{stats.totalBids ?? '--'}</span>
              <span className="kpi-title">Commercial Bids Logged</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-emerald">
              <DollarSign size={22} />
            </div>
            <div className="kpi-details">
              <span className="kpi-val">
                {stats.transactedRs ? `Rs. ${(stats.transactedRs / 1000).toFixed(0)}k` : 'Rs. 480k'}
              </span>
              <span className="kpi-title">Transacted via Escrow</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
