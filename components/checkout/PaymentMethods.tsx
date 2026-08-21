'use client';

import { useState } from 'react';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }
}

const methods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'Pay using any UPI app' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', icon: Wallet, description: 'Pay when you receive' },
];

export default function PaymentMethods({ onPlaceOrder }: { onPlaceOrder: () => void }) {
  const [selected, setSelected] = useState('upi');
  const { totalPayable } = useStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  async function loadRazorpay() {
    if (window.Razorpay) return true;
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function handlePlace() {
    if (!user) return router.push('/login?next=/checkout/address');
    const addressId = window.localStorage.getItem('bb_selected_address');
    if (!addressId) return router.push('/checkout/address');
    const paymentMethod = selected === 'cod' ? 'cod' : 'razorpay';
    const result = await request<{ _id?: string; orderId?: string; orderNumber?: string; grandTotal?: number; amount?: number; currency?: string; razorpayOrderId?: string; keyId?: string }>('/orders/initiate-payment', { method: 'POST', body: JSON.stringify({ addressId, paymentMethod }) });
    if (!result.data) return toast(result.message, 'error');
    if (paymentMethod === 'razorpay') {
      if (!result.data.keyId || !result.data.razorpayOrderId || !(await loadRazorpay()) || !window.Razorpay) return toast('Unable to load secure payment. Please try again or use Cash on Delivery.', 'error');
      const payment = new window.Razorpay({
        key: result.data.keyId,
        amount: Math.round(Number(result.data.amount ?? totalPayable) * 100),
        currency: result.data.currency ?? 'INR',
        name: 'Bikaner Bakery',
        description: `Order ${result.data.orderNumber ?? ''}`,
        order_id: result.data.razorpayOrderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verification = await request('/orders/verify-payment', { method: 'POST', body: JSON.stringify({ orderId: result.data?.orderId, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }) });
          if (!verification.ok) return toast(verification.message, 'error');
          window.sessionStorage.setItem('bb_completed_order', JSON.stringify(verification.data));
          toast('Payment successful. Your order is confirmed!');
          onPlaceOrder();
        },
        theme: { color: '#f15d0a' },
      });
      payment.open();
      return;
    }
    window.sessionStorage.setItem('bb_completed_order', JSON.stringify(result.data));
    toast('Order placed successfully!');
    onPlaceOrder();
  }

  return (
    <div className="payment-methods">
      <h3>Payment Method</h3>
      <div className="method-list">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              className={selected === method.id ? 'method-card active' : 'method-card'}
              onClick={() => setSelected(method.id)}
            >
              <span className="method-radio" />
              <Icon size={22} />
              <div>
                <strong>{method.label}</strong>
                <p>{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button className="primary-button place-order-btn" onClick={handlePlace}>
        Place Order · ₹{totalPayable}
      </button>
    </div>
  );
}
