'use client';

import { products } from '@/data/products';
import ProductGrid from '@/components/products/ProductGrid';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const categoryName = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const filtered = slug === 'all'
    ? products
    : products.filter((p) => p.category.toLowerCase() === slug.replace('-', ' ').toLowerCase() || p.category.toLowerCase() === categoryName.toLowerCase());

  return (
    <div className="page-content">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Browse our range</p>
          <h2>{categoryName}</h2>
        </div>
      </div>
      <ProductGrid products={filtered} />
    </div>
  );
}
