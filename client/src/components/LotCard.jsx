import React from 'react';
import { MapPin, User, CheckCircle2, Flame, Award, Edit3, Trash2 } from 'lucide-react';
import { getProduceImage } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';

export default function LotCard({
  lot,
  onOpenBid,
  onOpenAward,
  onOpenEdit,
  onDeleteLot
}) {
  const { currentRole } = useAuth();

  if (!lot) return null;

  const isFarmer = currentRole === 'farmer';
  const isAwarded = lot.status === 'awarded';

  const bids = Array.isArray(lot.bids) ? lot.bids : [];
  const highestBid = bids.length > 0
    ? bids.reduce((max, b) => {
        const bPrice = b.offeredPricePerKg ?? b.bidPricePerKg ?? 0;
        const maxPrice = max.offeredPricePerKg ?? max.bidPricePerKg ?? 0;
        return bPrice > maxPrice ? b : max;
      }, bids[0])
    : null;

  const basePrice = lot.basePricePerKg ?? lot.reservePricePerKg ?? 0;
  const highestPrice = highestBid
    ? (highestBid.offeredPricePerKg ?? highestBid.bidPricePerKg)
    : (lot.currentHighestBid || null);

  const highestOrg = highestBid?.buyerOrganization || highestBid?.buyer?.organization || highestBid?.bidderName || lot.highestBidderOrg;

  const farmerName = lot.farmer?.name || 'Local Farmer';
  const district = lot.farmer?.district || lot.farmer?.location?.district || lot.location?.district || 'Sri Lanka';
  const imgSrc = getProduceImage(lot.crop, lot.category, lot.imageUrl || lot.photoUrl);
  const isOrganic = lot.isOrganic || lot.specifications?.organicCertified;
  const grade = lot.qualityGrade || lot.specifications?.grade;

  return (
    <div className={`lot-card ${isAwarded ? 'lot-awarded' : ''}`}>
      <div className="card-media">
        <img
          src={imgSrc}
          alt={lot.crop || 'Produce'}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/leeks.jpg';
          }}
        />
        <div className="card-badges">
          <span className={`badge-pill cat-${lot.category || 'vegetables'}`}>
            {(lot.category || 'vegetables').toUpperCase()}
          </span>
          {isOrganic && (
            <span className="badge-pill organic">🌱 100% Organic</span>
          )}
          {grade && (
            <span className="badge-pill grade">{grade}</span>
          )}
        </div>
        <div className={`status-ribbon ${isAwarded ? 'awarded' : 'active'}`}>
          {isAwarded ? 'AWARDED DEAL' : 'BIDDING OPEN'}
        </div>
      </div>

      <div className="card-body">
        <div className="card-header">
          <h4 className="crop-title">{lot.crop}</h4>
          <div className="farmer-meta">
            <span className="farmer-name">
              <User size={13} /> {farmerName}
            </span>
            <span className="farmer-loc">
              <MapPin size={13} /> {district}
            </span>
          </div>
        </div>

        <div className="lot-spec-grid">
          <div className="spec-item">
            <span className="spec-label">HARVEST VOLUME</span>
            <span className="spec-val highlight">{(lot.quantityKg || 0).toLocaleString()} kg</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">RESERVE BASE</span>
            <span className="spec-val">Rs. {basePrice} / kg</span>
          </div>
        </div>

        {/* Bid Status Box */}
        <div className="bid-status-box">
          {highestPrice && highestPrice > basePrice ? (
            <div className="highest-bid-content">
              <div className="bid-lead">
                <Flame size={15} className="flame-icon" />
                <span>TOP COMMERCIAL BID</span>
              </div>
              <div className="bid-numbers">
                <span className="bid-amount">Rs. {highestPrice}</span>
                <span className="bid-unit">/ kg</span>
                <span className="bid-count">({bids.length} bids logged)</span>
              </div>
              <span className="bidder-org">
                By: {highestOrg || 'Commercial Procurement'}
              </span>
            </div>
          ) : (
            <div className="no-bids-yet">
              <span>No bids logged yet.</span>
              <small>Minimum opening bid: Rs. {basePrice} / kg</small>
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="card-actions">
          {!isFarmer ? (
            // Commercial Buyer Action
            isAwarded ? (
              <button className="btn btn-disabled w-full" disabled type="button">
                <CheckCircle2 size={16} /> Deal Closed & Awarded
              </button>
            ) : (
              <button
                className="btn btn-primary w-full btn-bid-action"
                onClick={() => onOpenBid(lot)}
                type="button"
              >
                Place Commercial Bid
              </button>
            )
          ) : (
            // Farmer Hub Actions
            <div className="farmer-action-group">
              <button
                className="btn btn-primary btn-award-action"
                onClick={() => onOpenAward(lot)}
                type="button"
              >
                <Award size={15} /> Review & Award
              </button>

              {!isAwarded && (
                <div className="lot-manage-actions">
                  <button
                    className="btn btn-icon btn-edit"
                    onClick={() => onOpenEdit(lot)}
                    title="Edit Lot Specs"
                    type="button"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="btn btn-icon btn-delete"
                    onClick={() => onDeleteLot(lot)}
                    title="Remove Harvest Lot"
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
