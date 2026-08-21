'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, Star } from 'lucide-react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { getProductById } from '@/lib/api';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProductById>>>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const { addItem, toggleWishlist, wishlist, cart, increment, decrement } = useStore();
  const { toast } = useToast();


  useEffect(() => {
    setLoadingProduct(true);
    void getProductById(slug).then((result) => { setProduct(result); setLoadingProduct(false); });
  }, [slug]);

  if (loadingProduct) return <div className="page-content"><div className="empty-state"><p>Loading product…</p></div></div>;

  if (!product) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <h3>Product is unavailable</h3>
          <Link href="/shop" className="primary-button">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const cartLine = cart.find((line) => line.product.id === product.id);

  return (
    <div className="page-content product-detail">
      <Link href="/shop" className="back-link"><ArrowLeft size={18} /> Back to Shop</Link>
      <div className="product-detail-grid">
        <div className="product-detail-image">
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', mixBlendMode: 'multiply' }} />
          <button
            className={isWishlisted ? 'favorite large selected' : 'favorite large'}
            onClick={() => { toggleWishlist(product.id); toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
            aria-label="Toggle wishlist"
          >
            <Heart size={22} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="product-detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          {(product.rating > 0 || product.reviews > 0) && <div className="rating-row">
            {product.rating > 0 && <span className="rating"><Star size={14} fill="currentColor" /> {product.rating}</span>}
            {product.reviews > 0 && <span className="reviews">{product.reviews} reviews</span>}
          </div>}
          <p className="product-weight">{product.weight}{product.calories > 0 ? ` · ${product.calories} kcal` : ''}</p>
          <div className="product-price-row">
            <strong className="price">₹{product.price}</strong>
            {product.originalPrice && <del>₹{product.originalPrice}</del>}
            {product.discount && <span className="discount-inline">{product.discount}</span>}
          </div>
          {product.description && <p className="product-description">{product.description}</p>}
          {(product.ingredients?.length || product.nutrition?.length) && <div className="product-information">
            {product.ingredients && product.ingredients.length > 0 && <p><b>Ingredients</b><span>{product.ingredients.join(', ')}</span></p>}
            {product.nutrition && product.nutrition.length > 0 && <div><b>Nutrition</b><div className="nutrition-list">{product.nutrition.map((item) => <span key={item.name}>{item.name}: {item.value}{item.unit}</span>)}</div></div>}
          </div>}
          <div className="product-actions">
            {cartLine ? (
              <div className="quantity-control large">
                <button onClick={() => decrement(product.id)} aria-label="Decrease"><Minus size={18} /></button>
                <span>{cartLine.quantity}</span>
                <button onClick={() => increment(product.id)} aria-label="Increase"><Plus size={18} /></button>
              </div>
            ) : (
              <button className="primary-button" onClick={() => { addItem(product); toast(`${product.name} added to cart`); }}>
                Add to Cart
              </button>
            )}
            <Link href="/shop" className="outline-button">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
