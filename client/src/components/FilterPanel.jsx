import React from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Produce' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'grains', label: 'Grains' },
  { id: 'spices', label: 'Spices' },
  { id: 'tubers', label: 'Tubers' }
];

export default function FilterPanel({
  searchTerm,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortFilter,
  onSortChange
}) {
  return (
    <div className="filter-panel">
      {/* Search */}
      <div className="search-wrap">
        <Search size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search crop, variety, farmer or district (e.g. Leeks, Nuwara Eliya, Rice)..."
        />
      </div>

      {/* Categories Pills */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status & Sort Filters */}
      <div className="filter-controls">
        <div className="control-group">
          <label htmlFor="statusFilterSelect">Status:</label>
          <select
            id="statusFilterSelect"
            className="custom-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Lots</option>
            <option value="bidding_open">Bidding Open</option>
            <option value="awarded">Awarded Deals</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sortFilterSelect">Sort By:</label>
          <select
            id="sortFilterSelect"
            className="custom-select"
            value={sortFilter}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest Harvest</option>
            <option value="highestBid">Highest Bid</option>
            <option value="quantity">Largest Volume (kg)</option>
            <option value="priceLow">Base Price (Low to High)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
