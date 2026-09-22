import React from 'react';
import { ShoppingBag, Tractor, User, LogOut, LogIn, Plus, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAuth, onOpenPostLot, onOpenOrders, ordersCount = 0 }) {
  const { currentUser, currentRole, switchRole, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <div className="brand-text">
            <h1>AgriDirect</h1>
            <span className="brand-tag">B2B Harvest Exchange</span>
          </div>
        </div>

        {/* Portal / Role Switcher */}
        <div className="role-switcher-container">
          <span className="switcher-label">View Portal:</span>
          <div className="role-pill-group">
            <button
              type="button"
              className={`role-pill ${currentRole === 'buyer' ? 'active' : ''}`}
              onClick={() => switchRole('buyer')}
            >
              <ShoppingBag size={15} />
              Commercial Buyer
            </button>
            <button
              type="button"
              className={`role-pill ${currentRole === 'farmer' ? 'active' : ''}`}
              onClick={() => switchRole('farmer')}
            >
              <Tractor size={15} />
              Farmer Hub
            </button>
          </div>
        </div>

        {/* Auth & Actions */}
        <div className="nav-actions">
          {currentUser ? (
            <div className="user-badge">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <div className="user-meta">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-org">{currentUser.organization || 'Verified Member'} • {currentUser.role}</span>
              </div>
              <button onClick={logout} className="btn-logout" title="Sign Out" type="button">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <button onClick={() => onOpenAuth('login')} className="btn btn-outline btn-sm" type="button">
                <LogIn size={15} />
                Sign In
              </button>
              <button onClick={() => onOpenAuth('register')} className="btn btn-primary btn-sm" type="button">
                Register Free
              </button>
            </div>
          )}

          {currentRole === 'farmer' && (
            <button onClick={onOpenPostLot} className="btn btn-primary btn-post-lot" type="button">
              <Plus size={16} strokeWidth={2.5} />
              List Harvest Lot
            </button>
          )}

          <button onClick={onOpenOrders} className="btn btn-outline nav-orders-btn" type="button">
            <Package size={15} />
            <span>Exchange Orders</span>
            {ordersCount > 0 && <span className="nav-count-badge">{ordersCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
