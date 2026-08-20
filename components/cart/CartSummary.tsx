'use client';

import Link from 'next/link';
import { ArrowRight, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import CartItem from './CartItem';
import FreeDeliveryProgress from './FreeDeliveryProgress';
import { useLocationStore } from '@/lib/location-store';
import { useAuth } from '@/lib/auth';

export default function CartSummary({ onCheckout = false }: { onCheckout?: boolean }) {
  const { cart, itemTotal, deliveryCharge, packagingCharge, youSave, totalPayable, coupon, applyCoupon, removeCoupon, discount } = useStore();
  const { location } = useLocationStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState('');

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const result = applyCoupon(code);
    toast(result.message, result.ok ? 'success' : 'error');
    if (result.ok) setCode('');
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
