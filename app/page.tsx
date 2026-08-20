'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import CategoryStrip from '@/components/home/CategoryStrip';
import BenefitsBar from '@/components/home/BenefitsBar';
import ProductGrid from '@/components/products/ProductGrid';
import { products } from '@/data/products';
import { categories as fallbackCategories, type Category } from '@/data/categories';
import { getFeaturedProducts, getHomeBanners, getHomeCategories, type HomeBanner } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const { user, hydrated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<typeof products>([]);

  useEffect(() => {
    if (!hydrated) return;
    let mounted = true;
    Promise.all([getHomeBanners(), getHomeCategories(), getFeaturedProducts()]).then(([nextBanners, nextCategories, nextProducts]) => {
      if (!mounted) return;
      if (nextBanners.length) setBanners(nextBanners);
      if (nextCategories.length) setCategories([{ id: 'all', name: 'All Categories', slug: 'all', icon: '▦' }, ...nextCategories]);
      if (nextProducts.length) setFeatured(nextProducts);
      if (!user) {
        if (!nextCategories.length) setCategories(fallbackCategories);
        if (!nextProducts.length) setFeatured(products.slice(0, 6));
      }
    });
    return () => { mounted = false; };
  }, [hydrated, user]);

  return (
    <div className="page-content" id="top">
      <Hero banner={banners[0]} />
      <CategoryStrip categories={categories} />
      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Handpicked for you</p>
            <h2>Featured Products</h2>
          </div>
        </div>
        {featured.length ? <ProductGrid products={featured} /> : <div className="catalogue-loading">Loading fresh products…</div>}
      </section>
      <BenefitsBar />
    </div>
  );
}
