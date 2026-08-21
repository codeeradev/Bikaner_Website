'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import CartItem from '@/components/cart/CartItem';

export default function OrderSummary({ nextStep }: { nextStep: '/checkout/payment' }) {
  const { cart, itemTotal, deliveryCharge, packagingCharge, youSave, discount, totalPayable, coupon } = useStore();

  return (
    <div className="cart-summary order-summary-checkout">
      <div className="cart-summary-header">
        <h3>Your Order</h3>
        <span className="item-count">{cart.reduce((sum, line) => sum + line.quantity, 0)} Items</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <Link href="/shop" className="primary-button">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cart.map((line) => <CartItem key={line.product.id} line={line} />)}
          </div>


          <div className="cart-totals">
            <div className="total-row"><span>Item Total</span><span>₹{itemTotal}</span></div>
            <div className="total-row"><span>Delivery Charges</span><span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
            <div className="total-row"><span>Packaging Charges</span><span>₹{packagingCharge}</span></div>
            {youSave > 0 && <div className="total-row save"><span>You Save</span><span>−₹{youSave}</span></div>}
            {discount > 0 && <div className="total-row save"><span>Discount ({coupon})</span><span>−₹{discount}</span></div>}
            <div className="total-row grand"><span>Total Payable</span><span>₹{totalPayable}</span></div>
          </div>

          <Link href={nextStep} className="primary-button checkout-btn">
            Proceed to Pay <ArrowRight size={18} />
          </Link>
        </>
      )}
    </div>
  );
}
