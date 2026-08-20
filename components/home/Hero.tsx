'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import type { HomeBanner } from '@/lib/api';

export default function Hero({ banner }: { banner?: HomeBanner }) {
  const title = banner?.title || 'Fresh bakery delivered to your door';
  const shopHref = banner?.productId ? `/product/${banner.productId}` : '/shop';

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Baked with love, delivered with care</p>
        <h1>{title}</h1>
        <p className="hero-description">
          From oven-fresh breads to delightful cakes,<br />
          enjoy your favorites delivered fast &amp; fresh.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href={shopHref}>{banner?.productId ? 'View Product' : 'Shop Now'} <ArrowRight size={19} /></Link>
          <a className="outline-button" href="#offers">View Offers <Tag size={17} /></a>
        </div>
        <div className="trust-row">
          <span>
            <Sparkles size={21} />
            <b>Freshly Baked<small>Made with love daily</small></b>
          </span>
          <span>
            <span className="trust-icon">♢</span>
            <b>Fast Delivery<small>On time, every time</small></b>
          </span>
          <span>
            <span className="trust-icon">✣</span>
            <b>100% Quality<small>Premium ingredients</small></b>
          </span>
        </div>
      </div>
      <div className={banner?.image ? 'hero-art hero-art-banner' : 'hero-art'} style={banner?.image ? { backgroundImage: `url("${banner.image}")`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined}>
        <div className="sun-glow" />
        {!banner?.image && <>
          <div className="cake-illustration">
            <div className="cake-top">✦ ✦ ✦ ✦</div>
            <div className="cake-body"><span>~~~~</span></div>
            <div className="cake-stand" />
          </div>
          <div className="bread-basket">
            <span>🥖</span>
            <span>🥐</span>
            <span>🍞</span>
          </div>
          <div className="hero-cookie">🍪</div>
        </>}
      </div>
    </section>
  );
}
