import React from 'react';
import LotCard from './LotCard';
import { useAuth } from '../context/AuthContext';

export default function LotsGrid({
  lots,
  loading,
  onOpenBid,
  onOpenAward,
  onOpenEdit,
  onDeleteLot
}) {
  const { currentRole } = useAuth();

  return (
    <div className="lots-container">
      <div className="lots-header">
        <div className="lots-title-block">
          <h3>Live Harvest Exchange Lots</h3>
          <span className="lots-count">Showing {lots.length} lots</span>
        </div>

        {currentRole === 'farmer' && (
          <div className="farmer-callout">
            <span>
              You are currently in <strong>Farmer Hub</strong>. Manage your harvest listings, review live bids, or award escrow contracts.
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading active exchange lots from MongoDB...</p>
        </div>
      ) : lots.length === 0 ? (
        <div className="empty-state">
          <h4>No Harvest Lots Found</h4>
          <p>Try clearing your category filter or search query to view more lots.</p>
        </div>
      ) : (
        <div className="lots-grid">
          {lots.map((lot) => (
            <LotCard
              key={lot._id}
              lot={lot}
              onOpenBid={onOpenBid}
              onOpenAward={onOpenAward}
              onOpenEdit={onOpenEdit}
              onDeleteLot={onDeleteLot}
            />
          ))}
        </div>
      )}
    </div>
  );
}
