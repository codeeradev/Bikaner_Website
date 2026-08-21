'use client';

import { Heart, Plus, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleWishlist, wishlist, cart, increment, decrement } = useStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const isWishlisted = wishlist.includes(product.id);
  const cartLine = cart.find((line) => line.product.id === product.id);

  function handleAdd() {
    if (!user) {
      window.dispatchEvent(new Event('bb:open-login'));
      return;
    }
    addItem(product);
    toast(`${product.name} added to cart`);
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.discount && <span className="discount">{product.discount}</span>}
        {product.badge && <span className="badge-new">{product.badge}</span>}
        <button
          className={isWishlisted ? 'favorite selected' : 'favorite'}
          onClick={() => { toggleWishlist(product.id); toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
          aria-label={`Favorite ${product.name}`}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <Link href={`/product/${product.id}`} aria-label={product.name}>
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 16vw" style={{ objectFit: 'cover', mixBlendMode: 'multiply' }} />
        </Link>
      </div>
      <div className="product-details">
        <Link href={`/product/${product.id}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>
        <p>{product.weight}{product.calories > 0 ? ` · ${product.calories} kcal` : ''}</p>
        <div className="rating-row">
          <span className="rating"><Star size={12} fill="currentColor" /> {product.rating}</span>
          <span className="reviews">{product.reviews} reviews</span>
        </div>
        <div className="product-footer">
          <div>
            <strong>₹{product.price}</strong>
            {product.originalPrice && <del>₹{product.originalPrice}</del>}
          </div>
          {cartLine ? (
            <div className="quantity-control">
              <button onClick={() => decrement(product.id)} aria-label="Decrease">−</button>
              <span>{cartLine.quantity}</span>
              <button onClick={() => increment(product.id)} aria-label="Increase">+</button>
            </div>
          ) : (
            <button className="add-button" onClick={handleAdd}>Add <Plus size={15} /></button>
          )}
        </div>
      </div>
    </article>
  );
}
