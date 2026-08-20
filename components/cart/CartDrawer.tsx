'use client';

import { ShoppingCart, X } from 'lucide-react';
import { useEffect } from 'react';
import CartSummary from './CartSummary';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3><ShoppingCart size={20} /> Your Cart</h3>
          <button onClick={onClose} aria-label="Close cart"><X size={22} /></button>
        </div>
        <CartSummary />
      </div>
    </div>
  );
}
