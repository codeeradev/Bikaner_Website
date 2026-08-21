'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductFilters, { type Filters, defaultFilters } from './ProductFilters';
import type { Category } from '@/data/categories';

export default function MobileFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
  categories: Category[];
}) {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3><SlidersHorizontal size={18} /> Filters</h3>
          <button onClick={onClose} aria-label="Close filters"><X size={22} /></button>
        </div>
        <ProductFilters filters={filters} onChange={onChange} onClear={onClear} categories={categories} />
        <button className="primary-button apply-filters-btn" onClick={onClose}>Apply Filters</button>
      </div>
    </div>
  );
}
