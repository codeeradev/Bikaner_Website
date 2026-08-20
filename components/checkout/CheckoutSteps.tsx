'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

const steps = [
  { id: 'cart', label: 'Cart', href: '/shop' },
  { id: 'address', label: 'Address', href: '/checkout/address' },
  { id: 'payment', label: 'Payment', href: '/checkout/payment' },
];

export default function CheckoutSteps({ active }: { active: 'cart' | 'address' | 'payment' }) {
  const activeIndex = steps.findIndex((s) => s.id === active);

  return (
    <div className="checkout-steps">
      {steps.map((step, index) => {
        const isActive = step.id === active;
        const isComplete = index < activeIndex;
        return (
          <div key={step.id} className="checkout-step-wrap">
            <Link href={step.href} className={`checkout-step ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}>
              <span className="step-circle">{isComplete ? <Check size={14} /> : index + 1}</span>
              <span className="step-label">{step.label}</span>
            </Link>
            {index < steps.length - 1 && <span className={`step-connector ${isComplete ? 'complete' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
