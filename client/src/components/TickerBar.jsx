import React from 'react';
import { Package } from 'lucide-react';

export default function TickerBar({ marketPrices, onOpenOrders }) {
  const safePrices = Array.isArray(marketPrices) ? marketPrices : [];

  return (
    <div className="top-ticker-bar">
      <div className="ticker-label">
        <span className="pulse-dot"></span> DAILY WHOLESALE BENCHMARK (DAMBULLA & MANNING MARKET)
      </div>
      <div className="ticker-wrapper">
        <div className="ticker-track">
          {safePrices.length > 0 ? (
            safePrices.map((item, idx) => {
              const dambulla = item.dambullaWholesalePrice ?? item.dambullaPrice ?? 280;
              const manning = item.manningWholesalePrice ?? item.manningPrice ?? 310;

              return (
                <span className="ticker-item" key={item._id || idx}>
                  <strong>{item.crop}:</strong> Dambulla Rs.{dambulla}/kg &nbsp;|&nbsp; Manning Rs.{manning}/kg
                  {item.trend === 'up' && <span className="trend up"> ▲ +4%</span>}
                  {item.trend === 'down' && <span className="trend down"> ▼ -3%</span>}
                </span>
              );
            })
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
