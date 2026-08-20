'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Order = { _id: string; orderNumber?: string; grandTotal?: number; orderStatus?: string; paymentStatus?: string; createdAt?: string; items?: Array<{ quantity?: number }> };

export default function OrdersPage() {
  const { user, hydrated } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => { if (user) void request<Order[]>('/orders').then((result) => setOrders(result.data || [])); }, [user]);
  if (hydrated && !user) return <main className="page-content empty-state"><h3>Sign in to see your orders</h3><Link className="primary-button" href="/login?next=/orders">Login / Sign up</Link></main>;
  return <main className="page-content orders-page"><div className="section-heading"><div><p className="eyebrow">Your purchases</p><h1>My Orders</h1></div></div>{orders === null ? <p>Loading your orders…</p> : orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><Package size={24} /><div><strong>{order.orderNumber || `Order #${order._id.slice(-6).toUpperCase()}`}</strong><p>{order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0} items · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent order'}</p></div><div><strong>₹{order.grandTotal ?? 0}</strong><span className="order-status">{order.orderStatus || 'pending'} · {order.paymentStatus || 'pending'}</span></div></article>)}</div> : <div className="empty-state"><span className="empty-icon">🧁</span><h3>No orders yet</h3><p>Your delicious orders will appear here.</p><Link className="primary-button" href="/shop">Start Shopping</Link></div>}</main>;
}
