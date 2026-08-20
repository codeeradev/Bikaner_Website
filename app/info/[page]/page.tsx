'use client';

import { useEffect, useState } from 'react';
import { getPublicSettings, type PublicSettings } from '@/lib/api';

const content: Record<string, { title: string; field: keyof PublicSettings }> = { about: { title: 'About Us', field: 'aboutUs' }, privacy: { title: 'Privacy Policy', field: 'privacyPolicy' }, terms: { title: 'Terms & Conditions', field: 'termsAndConditions' }, shipping: { title: 'Shipping Policy', field: 'shippingPolicy' } };
export default function InfoPage({ params }: { params: { page: string } }) {
  const [settings, setSettings] = useState<PublicSettings | null>(null); const info = content[params.page] || { title: 'Contact Us', field: 'siteDescription' as keyof PublicSettings };
  useEffect(() => { void getPublicSettings().then(setSettings); }, []);
  const body = settings?.[info.field] || (params.page === 'contact' ? [settings?.contactPhone, settings?.contactEmail].filter(Boolean).join('\n') : 'This information will be updated shortly.');
  return <main className="page-content info-page"><p className="eyebrow">Bikaner Bakery</p><h1>{info.title}</h1><p>{body}</p></main>;
}
