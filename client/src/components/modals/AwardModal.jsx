import React, { useState, useEffect } from 'react';
import { X, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function AwardModal({ isOpen, onClose, lot, onSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [farmerNotes, setFarmerNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lot) return null;

  const bids = [...(lot.bids || [])].sort((a, b) => {
    const aP = a.offeredPricePerKg ?? a.bidPricePerKg ?? 0;
    const bP = b.offeredPricePerKg ?? b.bidPricePerKg ?? 0;
    return bP - aP;
  });

  const currentSelected = bids.find((b) => b._id === selectedBidId) || bids[0] || null;
  const currentPrice = currentSelected
    ? (currentSelected.offeredPricePerKg ?? currentSelected.bidPricePerKg ?? 0)
    : 0;

  const totalContractVal = Math.round(currentPrice * (lot.quantityKg || 0));

  const handleAward = async () => {
    if (!currentSelected) {
      showToast('No bid selected to award.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.awardLot(lot._id, {
        winningBidId: currentSelected._id,
        farmerNotes
      });
      showToast(`Deal awarded to ${currentSelected.buyer?.organization || currentSelected.buyer?.name || currentSelected.buyerOrganization || currentSelected.bidderName}! Escrow order generated.`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card modal-large">
        <div className="modal-header">
          <h3>Review Commercial Bids & Award Contract</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Produce Header */}
          <div className="bid-produce-summary">
            <div>
              <h4 className="crop-title">{lot.crop}</h4>
              <span className="summary-meta">
                Available: <strong>{(lot.quantityKg || 0).toLocaleString()} kg</strong> | Reserve Base: <strong>Rs. {lot.basePricePerKg || lot.reservePricePerKg}/kg</strong>
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Commercial Bids</span>
              <span className="stat-val">{bids.length} Offers</span>
            </div>
          </div>

          {/* Bids Ladder */}
          {bids.length === 0 ? (
            <div className="empty-bids-notice">
              <AlertCircle size={28} className="text-amber" />
              <div>
                <h5>No Commercial Bids Received Yet</h5>
                <p>This harvest lot is actively open for bidding on the commercial exchange. Buyers will place bids shortly.</p>
              </div>
            </div>
          ) : (
            <div className="bids-ladder-container">
              <h5 className="ladder-heading">Ranked Commercial Offers (Select Winning Bid):</h5>
              <div className="bids-list">
                {bids.map((b, idx) => {
                  const isTop = idx === 0;
                  const isSelected = (currentSelected?._id === b._id);
                  const bPrice = b.offeredPricePerKg ?? b.bidPricePerKg ?? 0;
                  const contractVal = Math.round(bPrice * (lot.quantityKg || 0));

                  return (
                    <div
                      key={b._id || idx}
                      className={`bid-ladder-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedBidId(b._id)}
                    >
                      <div className="bid-rank">
                        {isTop ? '🏆 Top Bid' : `#${idx + 1}`}
                      </div>
                      <div className="bid-buyer-info">
                        <span className="buyer-org-name">
                          {b.buyer?.organization || b.buyerOrganization || b.buyer?.name || b.bidderName || 'Commercial Procurement'}
                        </span>
                        <span className="buyer-contact">
                          Contact: {b.buyer?.phone || 'Verified Buyer'} • {new Date(b.createdAt || b.placedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {(b.buyer?.notes || b.notes) && (
                          <span className="buyer-note-snippet">"{b.buyer?.notes || b.notes}"</span>
                        )}
                      </div>
                      <div className="bid-valuation-pill">
                        <span className="pill-price">Rs. {bPrice} / kg</span>
                        <span className="pill-total">Total: Rs. {contractVal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Award Summary */}
          {currentSelected && (
            <div className="award-summary-box">
              <div className="summary-col">
                <span className="col-label">Selected Winning Buyer</span>
                <span className="col-val">{currentSelected.buyer?.organization || currentSelected.buyerOrganization || currentSelected.buyer?.name || currentSelected.bidderName}</span>
              </div>
              <div className="summary-col">
                <span className="col-label">Winning Rate</span>
                <span className="col-val text-green">Rs. {currentPrice} / kg</span>
              </div>
              <div className="summary-col">
                <span className="col-label">Guaranteed Escrow Payout</span>
                <span className="col-val text-green font-bold">Rs. {totalContractVal.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Pickup / Logistics Dispatch Notes for Buyer</label>
            <input
              type="text"
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              placeholder="e.g. Produce crated and ready for pickup at gate by 5:00 AM."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading || bids.length === 0}
              onClick={handleAward}
            >
              <Award size={16} />
              {loading ? 'Finalizing Contract...' : `Award Deal (Rs. ${totalContractVal.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
