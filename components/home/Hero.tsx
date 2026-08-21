'use client';

import type { HomeBanner } from '@/lib/api';

export default function Hero({ banner }: { banner?: HomeBanner }) {
  if (!banner?.image) return null;
  return <section className="hero-image-banner" aria-label={banner.title || 'Bikaner Bakery banner'}>
    <img src={banner.image} alt={banner.title || 'Bikaner Bakery'} />
  </section>;
}
