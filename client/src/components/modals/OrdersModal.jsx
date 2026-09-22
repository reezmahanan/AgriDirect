import React, { useState, useEffect } from 'react';
import { X, Truck, CheckCircle2, Clock, Search, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export default function OrdersModal({ isOpen, onClose, orders, onRefresh, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (o.trackingNumber || '').toLowerCase().includes(term) ||
      (o.crop || '').toLowerCase().includes(term) ||
      (o.buyer?.organization || o.buyer?.name || '').toLowerCase().includes(term) ||
      (o.farmer?.name || '').toLowerCase().includes(term)
    );
  });

  const handleAdvanceStatus = async (order) => {
    let nextStatus = 'in_transit';
    if (order.status === 'dispatched') nextStatus = 'in_transit';
    else if (order.status === 'in_transit') nextStatus = 'delivered';
    else return;

    setUpdatingId(order._id);
    try {
      await api.updateOrderStatus(order._id, nextStatus);
      showToast(`Shipment #${order.trackingNumber} milestone updated to: ${nextStatus.toUpperCase()}`, 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card modal-large">
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Truck size={22} className="text-primary" />
            <div>
              <h3>Commercial Escrow Orders & Cold-Chain Logistics</h3>
              <p className="subtitle">Real-time refrigerated truck telemetry & milestone release tracking.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Bar */}
          <div className="search-wrap" style={{ marginBottom: '16px' }}>
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tracking ID (e.g. AGRI-EXP-77291), Crop, Buyer, or Farmer..."
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-orders-state">
              <Truck size={36} className="text-muted" />
              <h4>No Active Shipment Orders Found</h4>
              <p>When a farmer awards a harvest deal to a commercial buyer, an escrow contract and cold-chain truck dispatch will appear here automatically.</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((ord) => {
                const isDispatched = ord.status === 'dispatched';
                const isInTransit = ord.status === 'in_transit';
                const isDelivered = ord.status === 'delivered';

                return (
                  <div key={ord._id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-tag-group">
                        <span className="tracking-id-badge">
                          <Truck size={14} /> #{ord.trackingNumber}
                        </span>
                        <span className={`milestone-badge status-${ord.status}`}>
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="order-valuation">
                        <span className="order-total-val">
                          Rs. {(ord.totalContractValue || 0).toLocaleString()}
                        </span>
                        <span className="order-subtext">
                          ({ord.quantityKg?.toLocaleString()} kg @ Rs. {ord.winningPricePerKg}/kg)
                        </span>
                      </div>
                    </div>

                    <div className="order-parties-grid">
                      <div className="party-box farmer-box">
                        <span className="party-label">PRODUCER / PICKUP:</span>
                        <strong className="party-name">{ord.farmer?.farmName || ord.farmer?.name}</strong>
                        <span className="party-address">
                          <MapPin size={13} /> {ord.farmer?.pickupAddress || ord.farmer?.district || 'Farm Gate'}
                        </span>
                        <span className="party-phone">
                          <Phone size={13} /> {ord.farmer?.phone}
                        </span>
                      </div>

                      <div className="party-box buyer-box">
                        <span className="party-label">COMMERCIAL BUYER:</span>
                        <strong className="party-name">{ord.buyer?.organization || ord.buyer?.name}</strong>
                        <span className="party-address">
                          <MapPin size={13} /> {ord.buyer?.deliveryAddress || 'Central Distribution Warehouse'}
                        </span>
                        <span className="party-phone">
                          <Phone size={13} /> {ord.buyer?.phone}
                        </span>
                      </div>
                    </div>

                    {/* Cold-Chain Courier Info */}
                    <div className="courier-info-bar">
                      <div className="courier-vehicle">
                        <strong>Logistics Carrier:</strong> {ord.logistics?.courier || 'Domex Agro-ColdChain Express'}
                      </div>
                      <div className="courier-meta">
                        <span>Vehicle: {ord.logistics?.vehicleNumber || 'WP-AG-4912 (Refrigerated)'}</span>
                        <span>Driver: {ord.logistics?.driverContact || '+94 77 441 9922'}</span>
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="shipment-stepper">
                      <div className={`step-node ${isDispatched || isInTransit || isDelivered ? 'completed' : ''}`}>
                        <div className="step-circle">1</div>
                        <span className="step-label">Picked Up</span>
                      </div>
                      <div className={`step-line ${isInTransit || isDelivered ? 'completed' : ''}`}></div>
                      <div className={`step-node ${isInTransit || isDelivered ? 'completed' : ''}`}>
                        <div className="step-circle">2</div>
                        <span className="step-label">In Transit (Refrigerated)</span>
                      </div>
                      <div className={`step-line ${isDelivered ? 'completed' : ''}`}></div>
                      <div className={`step-node ${isDelivered ? 'completed' : ''}`}>
                        <div className="step-circle">3</div>
                        <span className="step-label">Delivered & Paid</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="order-card-footer">
                      <div className="escrow-assurance">
                        <ShieldCheck size={16} className="text-green" />
                        <span>Escrow payment protected by Central Depository</span>
                      </div>

                      {!isDelivered && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm btn-advance"
                          disabled={updatingId === ord._id}
                          onClick={() => handleAdvanceStatus(ord)}
                        >
                          <Clock size={14} />
                          {updatingId === ord._id
                            ? 'Advancing...'
                            : isDispatched
                            ? 'Simulate: Set In Transit'
                            : 'Simulate: Confirm Delivery'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
