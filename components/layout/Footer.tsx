'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getHomeCategories, getPublicSettings, type PublicSettings } from '@/lib/api';
import type { Category } from '@/data/categories';

const sections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/info/about' },
      { label: 'Contact', href: '/info/contact' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'My Orders', href: '/orders' },
      { label: 'Delivery Address', href: '/checkout/address' },
      { label: 'Shipping Policy', href: '/info/shipping' },
      { label: 'Privacy Policy', href: '/info/privacy' },
      { label: 'Terms & Conditions', href: '/info/terms' },
    ],
  },
];

export default function Footer() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { void getPublicSettings().then(setSettings); }, []);
  useEffect(() => { void getHomeCategories().then(setCategories); }, []);
  const social = [
    { label: 'Facebook', href: settings?.facebookUrl, Icon: Facebook }, { label: 'Instagram', href: settings?.instagramUrl, Icon: Instagram }, { label: 'Twitter', href: settings?.twitterUrl, Icon: Twitter },
  ].filter((item) => item.href);
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark"><span>♨</span></span>
            <span><strong>Bikaner</strong><em>Bakery</em></span>
          </div>
          <p className="footer-tagline">{settings?.siteDescription || 'Freshly baked goods delivered to your doorstep.'}</p>
          <div className="footer-contact">
            <span><MapPin size={16} /> Freshly baked and delivered near you</span>
            {settings?.contactPhone && <span><Phone size={16} /> {settings.contactPhone}</span>}
            {settings?.contactEmail && <span><Mail size={16} /> {settings.contactEmail}</span>}
          </div>
          <div className="footer-social">
            {social.map(({ label, href, Icon }) => <a href={href} target="_blank" rel="noreferrer" aria-label={label} key={label}><Icon size={18} /></a>)}
          </div>
        </div>

        {categories.length > 0 && <div className="footer-col"><h4>Shop</h4>{categories.map((category) => <Link href={`/category/${category.id}`} key={category.id}>{category.name}</Link>)}</div>}
        {sections.map((section) => (
          <div className="footer-col" key={section.title}>
            <h4>{section.title}</h4>
            {section.links.map((link) => (
              <Link href={link.href} key={link.label}>{link.label}</Link>
            ))}
          </div>
        ))}

        <div className="footer-newsletter">
          <h4>Get Fresh Updates</h4>
          <p>Subscribe for new arrivals, offers, and bakery news.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Bikaner Bakery. All rights reserved.</p>
        <p>{settings?.siteTitle || 'Bikaner Bakery'} · Made with love</p>
      </div>
    </footer>
  );
}
