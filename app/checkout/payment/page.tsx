'use client';

import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentMethods from '@/components/checkout/PaymentMethods';

export default function CheckoutPaymentPage() {
  const router = useRouter();

  return (
    <div className="page-content checkout-page">
      <div className="checkout-header">
        <CheckoutSteps active="payment" />
        <div className="secure-badge"><ShieldCheck size={18} /> Secure Checkout</div>
      </div>
      <div className="checkout-layout">
        <div className="checkout-left">
          <PaymentMethods onPlaceOrder={() => router.push('/checkout/success')} />
        </div>
        <div className="checkout-right">
          <OrderSummary nextStep="/checkout/payment" />
        </div>
      </div>
    </div>
  );
}
