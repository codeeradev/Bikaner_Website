'use client';

import { useState } from 'react';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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

  async function handlePlace() {
    if (!user) return router.push('/login?next=/checkout/address');
    const addressId = window.localStorage.getItem('bb_selected_address');
    if (!addressId) return router.push('/checkout/address');
    if (selected !== 'cod') return toast('Online payments will be available shortly. Please choose Cash on Delivery.', 'error');
    const result = await request<{ _id?: string; orderNumber?: string; grandTotal?: number }>('/orders/initiate-payment', { method: 'POST', body: JSON.stringify({ addressId, paymentMethod: 'cod' }) });
    if (!result.data) return toast(result.message, 'error');
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
