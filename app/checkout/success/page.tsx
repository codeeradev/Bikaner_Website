'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function CheckoutSuccessPage() {
  const { totalPayable, clearCart } = useStore();
  const orderId = `BB${Date.now().toString().slice(-8)}`;

  return (
    <div className="page-content success-page">
      <div className="success-card">
        <span className="success-icon"><CheckCircle2 size={64} /></span>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for ordering from Bikaner Bakery.</p>
        <div className="order-info">
          <div><span>Order ID</span><strong>{orderId}</strong></div>
          <div><span>Amount Paid</span><strong>₹{totalPayable}</strong></div>
          <div><span>Delivery ETA</span><strong>30–40 mins</strong></div>
        </div>
        <div className="success-actions">
          <Link href="/shop" className="primary-button" onClick={() => clearCart()}>Continue Shopping</Link>
          <Link href="/" className="outline-button">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
