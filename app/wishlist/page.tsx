'use client';

import Link from 'next/link';
import ProductGrid from '@/components/products/ProductGrid';
import { products } from '@/data/products';
import { useStore } from '@/lib/store';

export default function WishlistPage() {
  const { wishlist } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.id));
  return <main className="page-content products-section"><div className="section-heading"><div><p className="eyebrow">Saved for later</p><h1>My Wishlist</h1></div></div>{saved.length ? <ProductGrid products={saved} /> : <div className="empty-state"><span className="empty-icon">♡</span><h3>Your wishlist is empty</h3><p>Save products you want to try later.</p><Link href="/shop" className="primary-button">Explore Products</Link></div>}</main>;
}
