import React from 'react';
import { Package } from 'lucide-react';

export default function TickerBar({ marketPrices, onOpenOrders }) {
  return (
    <div className="top-ticker-bar">
      <div className="ticker-label">
        <span className="pulse-dot"></span> DAILY WHOLESALE BENCHMARK (DAMBULLA & MANNING MARKET)
      </div>
      <div className="ticker-wrapper">
        <div className="ticker-track">
          {marketPrices && marketPrices.length > 0 ? (
            marketPrices.map((item, idx) => (
              <span className="ticker-item" key={item._id || idx}>
                <strong>{item.crop}:</strong> Dambulla Rs.{item.dambullaPrice}/kg &nbsp;|&nbsp; Manning Rs.{item.manningPrice}/kg
                {item.trend === 'up' && <span className="trend up"> ▲ +{item.change || '4%'}</span>}
                {item.trend === 'down' && <span className="trend down"> ▼ -{item.change || '3%'}</span>}
              </span>
            ))
          ) : (
            <span className="ticker-item">Loading Sri Lankan wholesale price indexes (Dambulla & Manning)...</span>
          )}
        </div>
      </div>
      <div className="ticker-actions">
        <button onClick={onOpenOrders} className="btn-ticker" type="button">
          <Package size={14} />
          Track Logistics
        </button>
      </div>
    </div>
  );
}
