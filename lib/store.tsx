'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/data/products';
import { assetUrl, request } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export type CartLine = { product: Product; quantity: number };

type StoreState = {
  cart: CartLine[];
  wishlist: string[];
  coupon: string | null;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  refreshCart: () => Promise<void>;
  count: number;
  itemTotal: number;
  originalTotal: number;
  youSave: number;
  deliveryCharge: number;
  packagingCharge: number;
  discount: number;
  totalPayable: number;
};

const StoreContext = createContext<StoreState | null>(null);

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [serverTotals, setServerTotals] = useState<{ subtotal: number; deliveryCharge: number; platformFee: number; taxAmount: number; discountAmount: number; grandTotal: number; offerName?: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStored<CartLine[]>('bb_cart', []));
    setWishlist(readStored<string[]>('bb_wishlist', []));
    setHydrated(true);
  }, []);

  const syncCart = useCallback(async () => {
    if (!user) return;
    const result = await request<{ items?: Array<{ productId?: { _id?: string; name?: string; image?: string; sku?: string }; quantity?: number; price?: number }>; appliedOffer?: { name?: string } | null; subtotal?: number; deliveryCharge?: number; platformFee?: number; taxAmount?: number; discountAmount?: number; grandTotal?: number }>('/cart');
    if (!result.data) return;
    const lines: CartLine[] = (result.data.items ?? []).flatMap((item) => {
      const product = item.productId;
      if (!product?._id || !product.name) return [];
      return [{ product: {
        id: product._id, slug: product._id, name: product.name, category: 'Bakery', weight: product.sku || 'Freshly baked', price: Number(item.price ?? 0), rating: 0, reviews: 0, calories: 0, keywords: [product.name.toLowerCase()], image: assetUrl(product.image) || '/WhatsApp_Image_2026-08-20_at_11.40.38_AM.jpeg',
      }, quantity: Number(item.quantity ?? 1) }];
    });
    setCart(lines);
    setCoupon(result.data.appliedOffer?.name || null);
    setServerTotals({ subtotal: Number(result.data.subtotal ?? 0), deliveryCharge: Number(result.data.deliveryCharge ?? 0), platformFee: Number(result.data.platformFee ?? 0), taxAmount: Number(result.data.taxAmount ?? 0), discountAmount: Number(result.data.discountAmount ?? 0), grandTotal: Number(result.data.grandTotal ?? 0), offerName: result.data.appliedOffer?.name });
  }, [user]);

  useEffect(() => { if (authHydrated && user) void syncCart(); }, [authHydrated, user, syncCart]);

  useEffect(() => { if (hydrated) writeStored('bb_cart', cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) writeStored('bb_wishlist', wishlist); }, [wishlist, hydrated]);

  const addItem = useCallback((product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { product, quantity: 1 }];
    });
    if (user) void request('/cart', { method: 'POST', body: JSON.stringify({ productId: product.id, quantity: 1 }) }).then(syncCart);
  }, [syncCart, user]);

  const removeItem = useCallback((id: string) => {
    setCart((current) => current.filter((line) => line.product.id !== id));
    if (user) void request(`/cart/${id}`, { method: 'DELETE' }).then(syncCart);
  }, [syncCart, user]);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setCart((current) => current.map((line) => line.product.id === id ? { ...line, quantity: Math.max(1, quantity) } : line));
    if (user) void request('/cart', { method: 'PUT', body: JSON.stringify({ productId: id, quantity }) }).then(syncCart);
  }, [syncCart, user]);

  const increment = useCallback((id: string) => {
    setCart((current) => current.map((line) => line.product.id === id ? { ...line, quantity: line.quantity + 1 } : line));
    if (user) {
      const line = cart.find((entry) => entry.product.id === id);
      if (line) void request('/cart', { method: 'PUT', body: JSON.stringify({ productId: id, quantity: line.quantity + 1 }) }).then(syncCart);
    }
  }, [cart, syncCart, user]);

  const decrement = useCallback((id: string) => {
    setCart((current) => current.flatMap((line) => {
      if (line.product.id !== id) return [line];
      return line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : [];
    }));
    if (user) {
      const line = cart.find((entry) => entry.product.id === id);
      if (line) void request('/cart', { method: 'PUT', body: JSON.stringify({ productId: id, quantity: line.quantity - 1 }) }).then(syncCart);
    }
  }, [cart, syncCart, user]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (user) void request('/cart', { method: 'DELETE' });
  }, [user]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);

  const totals = useMemo(() => {
    const itemTotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const originalTotal = cart.reduce((sum, line) => sum + (line.product.originalPrice ?? line.product.price) * line.quantity, 0);
    const youSave = originalTotal - itemTotal;
    const useServerTotals = !!user && !!serverTotals;
    const totalPayable = useServerTotals ? serverTotals.grandTotal : itemTotal;

    return {
      count: cart.reduce((sum, line) => sum + line.quantity, 0),
      itemTotal,
      originalTotal,
      youSave,
      deliveryCharge: useServerTotals ? serverTotals.deliveryCharge : 0,
      packagingCharge: useServerTotals ? serverTotals.platformFee + serverTotals.taxAmount : 0,
      discount: useServerTotals ? serverTotals.discountAmount : 0,
      totalPayable,
    };
  }, [cart, serverTotals, user]);

  const value: StoreState = {
    cart,
    wishlist,
    coupon,
    addItem,
    removeItem,
    setQuantity,
    increment,
    decrement,
    clearCart,
    toggleWishlist,
    refreshCart: syncCart,
    ...totals,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
