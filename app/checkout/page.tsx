'use client';

import Link from 'next/link';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import OrderSummary from '@/components/checkout/OrderSummary';
import { ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="page-content checkout-page">
      <div className="checkout-header">
        <CheckoutSteps active="address" />
        <div className="secure-badge"><ShieldCheck size={18} /> Secure Checkout</div>
      </div>
      <div className="checkout-layout">
        <div className="checkout-left">
          <div className="checkout-redirect">
            <h3>Review your order</h3>
            <p>Please review your cart and proceed to add your delivery address.</p>
            <Link href="/checkout/address" className="primary-button">Add Delivery Address</Link>
          </div>
        </div>
        <div className="checkout-right">
          <OrderSummary nextStep="/checkout/payment" />
        </div>
      </div>
    </div>
  );
}
