'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import CartItem from './CartItem';
import FreeDeliveryProgress from './FreeDeliveryProgress';
import { useLocationStore } from '@/lib/location-store';
import { useAuth } from '@/lib/auth';
import { offers as fallbackOffers, type Offer } from '@/data/offers';
import { getActiveOffers, request } from '@/lib/api';

export default function CartSummary({ onCheckout = false }: { onCheckout?: boolean }) {
  const { cart, itemTotal, deliveryCharge, packagingCharge, youSave, totalPayable, coupon, applyCoupon, removeCoupon, refreshCart, discount } = useStore();
  const { location } = useLocationStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [availableOffers, setAvailableOffers] = useState<Offer[]>(fallbackOffers);
  const [selectedOffer, setSelectedOffer] = useState('');
  const [changingOffer, setChangingOffer] = useState(false);

  useEffect(() => {
    if (!user || cart.length === 0) { setAvailableOffers(fallbackOffers); return; }
    void getActiveOffers().then((items) => setAvailableOffers(items.length ? items : fallbackOffers));
  }, [cart.length, user]);

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const result = applyCoupon(code);
    toast(result.message, result.ok ? 'success' : 'error');
    if (result.ok) setCode('');
  }

  async function chooseOffer(value: string) {
    setSelectedOffer(value);
    if (!value) {
      if (user) {
        setChangingOffer(true);
        const result = await request('/offers/remove', { method: 'PUT' });
        setChangingOffer(false);
        if (result.ok) { await refreshCart(); toast('Offer removed'); }
        else toast(result.message, 'error');
      } else {
        removeCoupon();
        toast('Offer removed');
      }
      return;
    }
    const offer = availableOffers.find((item) => item.id === value);
    if (!offer) return;
    if (user) {
      setChangingOffer(true);
      // The API permits one cart offer at a time, so clear any current offer
      // before selecting a different one from this dropdown.
      await request('/offers/remove', { method: 'PUT' });
      const result = await request('/offers/apply', { method: 'POST', body: JSON.stringify({ offerId: value }) });
      setChangingOffer(false);
      if (result.ok) { await refreshCart(); toast(`${offer.title} applied`); }
      else { setSelectedOffer(''); toast(result.message, 'error'); }
      return;
    }
    if (offer.code) {
      const result = applyCoupon(offer.code);
      if (result.ok) toast(result.message, 'success');
      else { setSelectedOffer(''); toast(result.message, 'error'); }
    } else {
      setSelectedOffer('');
      toast('This offer is applied automatically when its condition is met.');
    }
  }

  return (
    <div className="cart-summary">
      {!onCheckout && (
        <>
          <div className="cart-summary-header">
            <h3>My Cart ({cart.reduce((sum, line) => sum + line.quantity, 0)})</h3>
          </div>
          <div className="delivery-box">
            <p className="delivery-label">Delivering to</p>
            <p className="delivery-location">{location}</p>
            <p className="delivery-eta">ETA: 30–40 mins</p>
            <Link href="/checkout/address" className="change-link">Change</Link>
          </div>
        </>
      )}

      {cart.length === 0 ? (
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Add some delicious treats!</p>
          <Link href="/shop" className="primary-button">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cart.map((line) => <CartItem key={line.product.id} line={line} />)}
          </div>

          <FreeDeliveryProgress />

          <section className="cart-offers" aria-label="Available offers">
            <div className="cart-offers-heading"><Tag size={15} /><b>Offers for you</b></div>
            <label className="offer-select-wrap">
              <span className="sr-only">Select an offer</span>
              <select value={selectedOffer} onChange={(event) => void chooseOffer(event.target.value)} disabled={changingOffer}>
                <option value="">{coupon ? `${coupon} applied — select to change` : 'Select an offer'}</option>
                {availableOffers.map((offer) => <option value={offer.id} key={offer.id}>{offer.title} — {offer.subtitle}</option>)}
              </select>
              <ChevronDown size={16} />
            </label>
            {availableOffers.map((offer) => <div className="cart-offer" key={offer.id}><span>{offer.icon}</span><p><b>{offer.title}</b><small>{offer.subtitle}{offer.code ? ` · Use ${offer.code}` : ''}</small></p></div>)}
          </section>

          <div className="coupon-row">
            {user ? (coupon ? (
              <div className="coupon-applied"><span><Tag size={14} /> {coupon} applied automatically</span></div>
            ) : <p className="checkout-offer-note">Eligible offers and charges are calculated automatically from your cart.</p>) : coupon ? (
              <div className="coupon-applied">
                <span><Tag size={14} /> {coupon} applied</span>
                <button onClick={() => { removeCoupon(); toast('Coupon removed'); }} aria-label="Remove coupon"><X size={15} /></button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="coupon-form">
                <input type="text" placeholder="Enter coupon code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Coupon code" />
                <button type="submit">Apply</button>
              </form>
            )}
          </div>

          <div className="cart-totals">
            <div className="total-row"><span>Item Total</span><span>₹{itemTotal}</span></div>
            <div className="total-row"><span>Delivery Charge</span><span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
            <div className="total-row"><span>Packaging Charges</span><span>₹{packagingCharge}</span></div>
            {youSave > 0 && <div className="total-row save"><span>You Save</span><span>−₹{youSave}</span></div>}
            {discount > 0 && <div className="total-row save"><span>Discount ({coupon})</span><span>−₹{discount}</span></div>}
            <div className="total-row grand"><span>Total Payable</span><span>₹{totalPayable}</span></div>
          </div>

          {!onCheckout && (
            <Link href="/checkout/address" className="primary-button checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          )}
        </>
      )}
    </div>
  );
}
