'use client';

import { useEffect, useState } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import { type Product } from '@/data/products';
import { getProducts, getProductsByCategory } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { user, hydrated } = useAuth(); const [items, setItems] = useState<Product[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!hydrated) return; setLoading(true); if (!user) { setItems([]); setLoading(false); return; } const load = params.slug === 'all' ? getProducts() : getProductsByCategory(params.slug); void load.then((result) => { setItems(result); setLoading(false); }); }, [hydrated, params.slug, user]);
  return <div className="page-content"><div className="section-heading"><div><p className="eyebrow">Browse our range</p><h2>Products</h2></div></div>{loading ? <div className="catalogue-loading">Loading products…</div> : user ? <ProductGrid products={items} /> : <div className="empty-state"><h3>Login to browse products</h3><button className="primary-button" onClick={() => window.dispatchEvent(new Event('bb:open-login'))}>Login</button></div>}</div>;
}
