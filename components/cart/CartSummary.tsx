'use client';

import Link from 'next/link';
import { ArrowRight, Check, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import CartItem from './CartItem';
import { useLocationStore } from '@/lib/location-store';
import { useAuth } from '@/lib/auth';
import type { Offer } from '@/data/offers';
import { getActiveOffers, request } from '@/lib/api';

export default function CartSummary({ onCheckout = false }: { onCheckout?: boolean }) {
  const { cart, itemTotal, deliveryCharge, packagingCharge, youSave, totalPayable, coupon, refreshCart, discount } = useStore();
  const { location } = useLocationStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState('');
  const [changingOffer, setChangingOffer] = useState(false);

  useEffect(() => {
    if (!user || cart.length === 0) { setAvailableOffers([]); return; }
    void getActiveOffers().then(setAvailableOffers);
  }, [cart.length, user]);

  const eligible = (offer: Offer) => {
    if (itemTotal < (offer.minCartValue ?? 0)) return false;
    return offer.applicableOn !== 'specific_products' || (offer.specificProductIds ?? []).some((id) => cart.some((line) => line.product.id === id));
  };

  async function chooseOffer(value: string) {
    setSelectedOffer(value);
    if (!value) {
      if (user) {
        setChangingOffer(true);
        const result = await request('/offers/remove', { method: 'PUT' });
        setChangingOffer(false);
        if (result.ok) { await refreshCart(); toast('Offer removed'); }
        else toast(result.message, 'error');
      }
      return;
    }
    const offer = availableOffers.find((item) => item.id === value);
    if (!offer) return;
    if (user) {
      if (!eligible(offer)) { setSelectedOffer(''); toast(`Add ₹${Math.max(0, (offer.minCartValue ?? 0) - itemTotal)} more or add an eligible product for this offer.`, 'error'); return; }
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

          {user && availableOffers.length > 0 && <section className="cart-offers" aria-label="Available offers">
            <div className="cart-offers-heading"><Tag size={15} /><b>Offers for you</b></div>
            <p className="offer-help">Choose one offer for this order. Eligible offers can be applied right away.</p>
            <div className="offer-list">
              {availableOffers.map((offer) => {
                const isEligible = eligible(offer);
                const active = selectedOffer === offer.id || coupon === offer.title;
                return <button type="button" className={active ? 'cart-offer selected' : 'cart-offer'} key={offer.id} disabled={!isEligible || changingOffer} onClick={() => void chooseOffer(active ? '' : offer.id)}><span>{active ? <Check size={14} /> : offer.icon}</span><p><b>{offer.title}</b><small>{isEligible ? offer.subtitle : `Add ₹${Math.max(0, (offer.minCartValue ?? 0) - itemTotal)} more to use this offer`}{offer.applicableOn === 'specific_products' ? ' · Valid on selected products' : ''}</small></p></button>;
              })}
            </div>
          </section>}

          {user && <div className="coupon-row">
            {coupon ? (
              <div className="coupon-applied"><span><Tag size={14} /> {coupon} applied automatically</span></div>
            ) : null}
          </div>}

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
