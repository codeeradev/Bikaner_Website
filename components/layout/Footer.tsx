'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const sections = [
  {
    title: 'Shop',
    links: [
      { label: 'Cakes', href: '/category/cakes' },
      { label: 'Breads', href: '/category/breads' },
      { label: 'Cookies', href: '/category/cookies' },
      { label: 'Snacks', href: '/category/snacks' },
      { label: 'Gift Hampers', href: '/category/gift-hampers' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Our Story', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track Order', href: '#' },
      { label: 'Delivery Info', href: '#' },
      { label: 'Returns', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark"><span>♨</span></span>
            <span><strong>Bikaner</strong><em>Bakery</em></span>
          </div>
          <p className="footer-tagline">Freshly baked goods delivered to your doorstep since 1985.</p>
          <div className="footer-contact">
            <span><MapPin size={16} /> Bhamashah Nagar, Hisar, Haryana</span>
            <span><Phone size={16} /> +91 98765 43210</span>
            <span><Mail size={16} /> orders@bikanerbakery.in</span>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
          </div>
        </div>

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
        <p>Made with love in Hisar</p>
      </div>
    </footer>
  );
}
