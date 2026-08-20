'use client';

import { useStore } from '@/lib/store';
import { useLocationStore } from '@/lib/location-store';
import CartSummary from './CartSummary';

export default function CartSidebar() {
  const { cart } = useStore();
  const { location } = useLocationStore();

  return (
    <aside className="cart-sidebar">
      <CartSummary />
    </aside>
  );
}
