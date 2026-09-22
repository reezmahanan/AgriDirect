import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calculator } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BiddingModal({ isOpen, onClose, lot, onBidSuccess, showToast }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const bids = lot?.bids || [];
  const highestBid = bids.length > 0
    ? bids.reduce((max, b) => (b.bidPricePerKg > max.bidPricePerKg ? b : max), bids[0])
    : null;

  const minBid = highestBid
    ? highestBid.bidPricePerKg + 5
    : (lot?.reservePricePerKg || 100);

  const [bidPrice, setBidPrice] = useState(minBid);
  const [buyerName, setBuyerName] = useState('');
  const [buyerOrg, setBuyerOrg] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');

  useEffect(() => {
    if (lot) {
      const mb = highestBid ? highestBid.bidPricePerKg + 5 : (lot.reservePricePerKg || 100);
      setBidPrice(mb);
    }
    if (currentUser) {
      setBuyerName(currentUser.name || '');
      setBuyerOrg(currentUser.organization || '');
      setBuyerPhone(currentUser.phone || '');
    } else {
      setBuyerName('Procurement Division');
      setBuyerOrg('Commercial Supermarket / Hotel');
      setBuyerPhone('+94 77 123 4567');
    }
  }, [lot, currentUser]);

  if (!isOpen || !lot) return null;

  const totalContractVal = Math.round((Number(bidPrice) || 0) * (lot.quantityKg || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(bidPrice) < minBid) {
      showToast(`Bid must be at least Rs. ${minBid} / kg!`, 'error');
      return;
    }

    setLoading(true);
    try {
      await api.placeBid(lot._id, {
        bidPricePerKg: Number(bidPrice),
        buyer: {
          name: buyerName,
          organization: buyerOrg,
          phone: buyerPhone,
          notes: buyerNotes
        }
      });
      showToast(`Commercial bid of Rs. ${bidPrice}/kg placed successfully!`, 'success');
      onBidSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Place Commercial Bid</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Produce Summary Header */}
          <div className="bid-produce-summary">
            <div>
              <h4 className="crop-title">{lot.crop}</h4>
              <span className="summary-meta">
                Available Volume: <strong>{lot.quantityKg.toLocaleString()} kg</strong> | Reserve Base: <strong>Rs. {lot.reservePricePerKg}/kg</strong>
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Current High</span>
              <span className="stat-val">
                {highestBid ? `Rs. ${highestBid.bidPricePerKg}/kg` : 'No Bids'}
              </span>
            </div>
          </div>

          {/* Bid Price Input */}
          <div className="form-group">
            <label className="field-label-accent">
              Your Offer Price (Rs. per Kg)
              <span className="min-label">Minimum valid bid: Rs. {minBid}</span>
            </label>
            <div className="price-input-wrapper">
              <span className="currency-prefix">Rs.</span>
              <input
                type="number"
                required
                min={minBid}
                step="1"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                className="input-price-large"
              />
              <span className="currency-suffix">/ kg</span>
            </div>
          </div>

          {/* Live Valuation Box */}
          <div className="valuation-box">
            <div className="val-icon">
              <Calculator size={20} />
            </div>
            <div className="val-details">
              <span className="val-title">Estimated Total Escrow Contract Value</span>
              <span className="val-math">
                {lot.quantityKg.toLocaleString()} kg × Rs. {bidPrice || 0} =
              </span>
            </div>
            <div className="val-total">
              Rs. {totalContractVal.toLocaleString()}
            </div>
          </div>

          {/* Buyer Details */}
          <div className="form-row">
            <div className="form-group">
              <label>Procurement Officer / Contact Name</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Organization / Supermarket / Hotel</label>
              <input
                type="text"
                required
                value={buyerOrg}
                onChange={(e) => setBuyerOrg(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Direct Contact Phone</label>
            <input
              type="text"
              required
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Procurement Notes / Logistics Requirements (Optional)</label>
            <textarea
              rows="2"
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              placeholder="e.g. Requires delivery to central distribution hub by 6:00 AM."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CheckCircle size={16} />
              {loading ? 'Submitting Bid...' : `Confirm Bid (Rs. ${totalContractVal.toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
