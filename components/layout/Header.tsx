'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLocationStore } from '@/lib/location-store';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';
import { getProducts } from '@/lib/api';
import { products as fallbackProducts } from '@/data/products';
import Image from 'next/image';

const navItems = ['Home', 'Cakes', 'Breads', 'Cookies', 'Snacks', 'Combo Offers', 'Bestsellers', 'New Arrivals'];

const categoryRoutes: Record<string, string> = {
  Cakes: '/category/cakes',
  Breads: '/category/breads',
  Cookies: '/category/cookies',
  Snacks: '/category/snacks',
};

export default function Header() {
  const pathname = usePathname();
  const { count, totalPayable } = useStore();
  const { location, setLocation } = useLocationStore();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<typeof fallbackProducts>([]);

  const locations = ['Bhamashah Nagar, Hisar', 'Model Town, Hisar', 'Civil Lines, Hisar', 'Sector 17, Chandigarh', 'Connaught Place, Delhi'];

  useEffect(() => {
    const query = search.trim();
    if (!query) return setSuggestions([]);
    if (!user) return setSuggestions(fallbackProducts.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
    const timer = window.setTimeout(() => { void getProducts(query).then((items) => setSuggestions(items.slice(0, 5))); }, 250);
    return () => window.clearTimeout(timer);
  }, [search, user]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      window.location.href = `/shop?q=${encodeURIComponent(query)}`;
    }
  }

  return (
    <header className="header">
      <div className="topbar">
        <Link className="brand" href="/" aria-label="Bikaner Bakery home">
          <span className="brand-mark"><span>♨</span></span>
          <span><strong>Bikaner</strong><em>Bakery</em></span>
        </Link>

        <form className="search-box" onSubmit={submitSearch}>
          <Search size={21} strokeWidth={2} />
          <input aria-label="Search products" placeholder="Search for cakes, cookies, breads..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {suggestions.length > 0 && <div className="search-suggestions">{suggestions.map((product) => <Link href={`/product/${product.id}`} key={product.id} onClick={() => setSearch('')}><Image src={product.image} alt="" width={38} height={38} /><span>{product.name}<small>₹{product.price}</small></span></Link>)}</div>}
        </form>

        <div className="header-controls">
          <div className="dropdown">
            <button className="location-control" onClick={() => setLocationOpen(!locationOpen)}>
              <MapPin size={20} />
              <span><small>Deliver to</small><b>{location}</b></span>
              <ChevronDown size={17} />
            </button>
            {locationOpen && (
              <div className="dropdown-menu location-menu">
                <p>Choose delivery location</p>
                {locations.map((loc) => (
                  <button key={loc} className={loc === location ? 'active' : ''} onClick={() => { setLocation(loc); setLocationOpen(false); toast('Delivery location updated'); }}>
                    {loc}
                  </button>
                ))}
                <button onClick={() => { if (!navigator.geolocation) return toast('Location is not supported in this browser', 'error'); navigator.geolocation.getCurrentPosition((position) => { setLocation(`Map location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`); setLocationOpen(false); toast('Current map location selected'); }, () => toast('Please allow location permission to use the map location.', 'error')); }}>Use my current map location</button>
              </div>
            )}
          </div>

          <div className="dropdown">
            <button className="account-control" onClick={() => setAccountOpen(!accountOpen)}>
              <UserRound size={21} />
              <span><small>My Account</small><b>{user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Hello, Guest'}</b></span>
              <ChevronDown size={15} />
            </button>
            {accountOpen && (
              <div className="dropdown-menu account-menu">
                {!user ? <button onClick={() => { setAccountOpen(false); window.dispatchEvent(new Event('bb:open-login')); }}>Login / Sign up</button> : <>
                  <Link href="/orders" onClick={() => setAccountOpen(false)}>My Orders</Link>
                  <Link href="/checkout/address" onClick={() => setAccountOpen(false)}>Saved Addresses</Link>
                  <Link href="/wishlist" onClick={() => setAccountOpen(false)}>Wishlist</Link>
                  <button onClick={() => { signOut(); setAccountOpen(false); toast('Signed out successfully'); }}>Sign out</button>
                </>}
              </div>
            )}
          </div>

          <Link className="cart-control" href="/shop">
            <ShoppingCart size={24} />
            <i>{count}</i>
            <b>₹{totalPayable}</b>
          </Link>
        </div>

        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <nav className={menuOpen ? 'nav open' : 'nav'}>
        {navItems.map((item) => {
          const href = item === 'Home' ? '/' : categoryRoutes[item] ?? '/shop';
          const isActive = item === 'Home' ? pathname === '/' : pathname === href;
          return <Link className={isActive ? 'active' : ''} href={href} key={item} onClick={() => setMenuOpen(false)}>{item}</Link>;
        })}
      </nav>
    </header>
  );
}
