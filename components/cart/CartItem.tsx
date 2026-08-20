'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartLine } from '@/lib/store';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';

export default function CartItem({ line }: { line: CartLine }) {
  const { increment, decrement, removeItem } = useStore();
  const { toast } = useToast();
  const { product, quantity } = line;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <Image src={product.image} alt={product.name} fill sizes="60px" style={{ objectFit: 'cover', mixBlendMode: 'multiply' }} />
      </div>
      <div className="cart-item-info">
        <h4>{product.name}</h4>
        <p>{product.weight}</p>
        <div className="cart-item-price">
          <strong>₹{product.price * quantity}</strong>
          {product.originalPrice && <del>₹{product.originalPrice * quantity}</del>}
        </div>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-control small">
          <button onClick={() => decrement(product.id)} aria-label="Decrease"><Minus size={14} /></button>
          <span>{quantity}</span>
          <button onClick={() => increment(product.id)} aria-label="Increase"><Plus size={14} /></button>
        </div>
        <button className="remove-btn" onClick={() => { removeItem(product.id); toast('Removed from cart', 'error'); }} aria-label="Remove">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
