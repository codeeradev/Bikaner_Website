'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@/data/categories';
import { SlidersHorizontal, X } from 'lucide-react';

export type Filters = {
  category: string;
  priceMin: number;
  priceMax: number;
  offers: string[];
  sort: string;
};

export const defaultFilters: Filters = {
  category: 'All Categories',
  priceMin: 0,
  priceMax: 1000,
  offers: [],
  sort: 'popularity',
};

const priceButtons = [
  { label: '₹0 - ₹250', min: 0, max: 250 },
  { label: '₹250 - ₹500', min: 250, max: 500 },
  { label: '₹500+', min: 500, max: 1000 },
];

const sortOptions = [
  { id: 'popularity', label: 'Popularity High to Low' },
  { id: 'price-low', label: 'Price Low to High' },
  { id: 'price-high', label: 'Price High to Low' },
  { id: 'rating', label: 'Rating' },
  { id: 'newest', label: 'Newest' },
];

export default function ProductFilters({
  filters,
  onChange,
  onClear,
  categories,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
  categories: Category[];
}) {
  const [localMin, setLocalMin] = useState(filters.priceMin);
  const [localMax, setLocalMax] = useState(filters.priceMax);
  useEffect(() => { setLocalMin(filters.priceMin); setLocalMax(filters.priceMax); }, [filters.priceMin, filters.priceMax]);

  function applyPrice(min: number, max: number) {
    setLocalMin(min);
    setLocalMax(max);
    onChange({ ...filters, priceMin: min, priceMax: max });
  }

  return (
    <div className="filters">
      <div className="filters-header">
        <h3><SlidersHorizontal size={18} /> Filters</h3>
        <button className="clear-all" onClick={onClear}>Clear All</button>
      </div>

      <div className="filter-section">
        <h4>Categories</h4>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={filters.category === cat.name ? 'filter-option active' : 'filter-option'}
            onClick={() => onChange({ ...filters, category: cat.name })}
          >
            <span className="filter-icon">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-slider">
          <div className="price-display">₹{localMin} — ₹{localMax >= 1000 ? '1000+' : localMax}</div>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={localMax}
            onChange={(e) => applyPrice(localMin, Number(e.target.value))}
            aria-label="Maximum price"
          />
        </div>
        <div className="price-buttons">
          {priceButtons.map((btn) => (
            <button
              key={btn.label}
              className={filters.priceMin === btn.min && filters.priceMax === btn.max ? 'price-btn active' : 'price-btn'}
              onClick={() => applyPrice(btn.min, btn.max)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Sort By</h4>
        <select value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value })} className="sort-select">
          {sortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </div>
    </div>
  );
}
