'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { type Product } from '@/data/products';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters, { type Filters, defaultFilters } from '@/components/products/ProductFilters';
import CartSidebar from '@/components/cart/CartSidebar';
import MobileFilterDrawer from '@/components/products/MobileFilterDrawer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useStore } from '@/lib/store';
import { getProducts } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [search, setSearch] = useState(initialQuery);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const { count } = useStore();
  const { user, hydrated } = useAuth();
  const [catalogue, setCatalogue] = useState<Product[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { setCatalogue([]); return; }
    void getProducts().then((items) => setCatalogue(items));
  }, [hydrated, user]);

  const filtered = useMemo(() => {
    let result = [...catalogue];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.includes(q))
      );
    }

    if (filters.category !== 'All Categories') {
      result = result.filter((p) => p.category === filters.category);
    }

    result = result.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax);

    if (filters.offers.includes('discounted')) {
      result = result.filter((p) => p.discount);
    }

    switch (filters.sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0)); break;
      default: result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [catalogue, filters, search]);

  return (
    <div className="shop-page">
      <div className="shop-layout">
        <aside className="filter-sidebar">
          <ProductFilters filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
        </aside>

        <main className="shop-main">
          <div className="shop-toolbar">
            <button className="filter-toggle" onClick={() => setFilterDrawerOpen(true)}>
              <SlidersHorizontal size={18} /> Filters
            </button>
            <input
              className="shop-search"
              placeholder="Search cakes, breads, cookies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            <button className="cart-toggle" onClick={() => setCartDrawerOpen(true)}>
              <ShoppingCart size={20} /> Cart ({count})
            </button>
          </div>

          <div className="shop-results">
            <p className="results-count">{filtered.length} products</p>
          </div>

          {!hydrated || (user && !catalogue.length) ? <div className="catalogue-loading">Loading fresh products…</div> : <ProductGrid products={filtered} />}
        </main>

        <CartSidebar />
      </div>

      <MobileFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(defaultFilters)}
      />
      <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </div>
  );
}
