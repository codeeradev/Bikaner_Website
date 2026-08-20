'use client';

import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import LocationSelector from '@/components/checkout/LocationSelector';
import AddressForm from '@/components/checkout/AddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { ShieldCheck } from 'lucide-react';

export default function CheckoutAddressPage() {
  return (
    <div className="page-content checkout-page">
      <div className="checkout-header">
        <CheckoutSteps active="address" />
        <div className="secure-badge"><ShieldCheck size={18} /> Secure Checkout</div>
      </div>
      <div className="checkout-layout">
        <div className="checkout-left">
          <LocationSelector />
          <AddressForm />
        </div>
        <div className="checkout-right">
          <OrderSummary nextStep="/checkout/payment" />
        </div>
      </div>
    </div>
  );
}
