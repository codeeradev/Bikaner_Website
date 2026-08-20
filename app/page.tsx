'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import CategoryStrip from '@/components/home/CategoryStrip';
import OffersBar from '@/components/home/OffersBar';
import BenefitsBar from '@/components/home/BenefitsBar';
import ProductGrid from '@/components/products/ProductGrid';
import { products } from '@/data/products';
import { categories as fallbackCategories, type Category } from '@/data/categories';
import { offers as fallbackOffers, type Offer } from '@/data/offers';
import { getActiveOffers, getFeaturedProducts, getHomeBanners, getHomeCategories, type HomeBanner } from '@/lib/api';

export default function Home() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [featured, setFeatured] = useState(products.slice(0, 6));
  const [offers, setOffers] = useState<Offer[]>(fallbackOffers);

  useEffect(() => {
    let mounted = true;
    Promise.all([getHomeBanners(), getHomeCategories(), getFeaturedProducts(), getActiveOffers()]).then(([nextBanners, nextCategories, nextProducts, nextOffers]) => {
      if (!mounted) return;
      if (nextBanners.length) setBanners(nextBanners);
      if (nextCategories.length) setCategories([{ id: 'all', name: 'All Categories', slug: 'all', icon: '▦' }, ...nextCategories]);
      if (nextProducts.length) setFeatured(nextProducts);
      if (nextOffers.length) setOffers(nextOffers);
    });
    return () => { mounted = false; };
  }, []);

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
        <ProductGrid products={featured} />
      </section>
      <OffersBar offers={offers} />
      <BenefitsBar />
    </div>
  );
}
