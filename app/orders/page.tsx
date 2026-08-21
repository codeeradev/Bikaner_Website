'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Package, ReceiptText } from 'lucide-react';
import { assetUrl, request } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type OrderItem = { quantity?: number; price?: number; subtotal?: number; productId?: { _id?: string; name?: string; image?: string; sku?: string } };
type Address = { name?: string; mobile?: string; house_No?: string; address?: string; landmark?: string; city?: string };
type Order = { _id: string; orderNumber?: string; grandTotal?: number; totalAmount?: number; deliveryCharge?: number; platformFee?: number; discountAmount?: number; orderStatus?: string; paymentStatus?: string; paymentMethod?: string; createdAt?: string; items?: OrderItem[]; addressId?: Address };
const statusLabel = (value?: string) => (value || 'pending').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function OrdersPage() {
  const { user, hydrated } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  useEffect(() => { if (user) void request<Order[]>('/orders').then((result) => setOrders(result.data || [])); }, [user]);
  if (hydrated && !user) return <main className="page-content empty-state"><h3>Sign in to see your orders</h3><Link className="primary-button" href="/login?next=/orders">Login / Sign up</Link></main>;
  return <main className="page-content orders-page">
    <div className="section-heading"><div><p className="eyebrow">Your purchases</p><h1>My Orders</h1></div></div>
    {orders === null ? <p>Loading your orders…</p> : orders.length ? <div className="orders-list">{orders.map((order) => {
      const isOpen = openOrder === order._id;
      const quantity = order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
      const address = order.addressId;
      return <article className={isOpen ? 'order-card order-card-open' : 'order-card'} key={order._id}>
        <button className="order-card-summary" onClick={() => setOpenOrder(isOpen ? null : order._id)} aria-expanded={isOpen}>
          <Package size={24} /><div className="order-main"><strong>{order.orderNumber || `Order #${order._id.slice(-6).toUpperCase()}`}</strong><p>{quantity} {quantity === 1 ? 'item' : 'items'} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent order'}</p></div>
          <div className="order-total"><strong>₹{order.grandTotal ?? 0}</strong><span className={`order-status status-${order.orderStatus || 'pending'}`}>{statusLabel(order.orderStatus)}</span></div><ChevronDown className={isOpen ? 'order-chevron open' : 'order-chevron'} size={20} />
        </button>
        {isOpen && <div className="order-details">
          <section><h2><ReceiptText size={17} /> Order items</h2>{order.items?.map((item, index) => <div className="order-item" key={`${item.productId?._id || index}-${index}`}>
            {item.productId?.image && <img src={assetUrl(item.productId.image)} alt="" />}<div><b>{item.productId?.name || 'Product'}</b><small>Quantity: {item.quantity || 0}</small></div><strong>₹{item.subtotal ?? ((item.price || 0) * (item.quantity || 0))}</strong>
          </div>)}</section>
          <section><h2><MapPin size={17} /> Delivery details</h2><p className="order-address"><b>{address?.name || 'Delivery address'}</b>{address?.mobile && <> · {address.mobile}</>}<br />{[address?.house_No, address?.address, address?.landmark, address?.city].filter(Boolean).join(', ') || 'Address details unavailable'}</p><p className="order-payment">Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online payment'} · {statusLabel(order.paymentStatus)}</p></section>
          <section className="order-breakdown"><h2>Bill summary</h2><p><span>Items</span><b>₹{order.totalAmount ?? 0}</b></p><p><span>Delivery</span><b>{order.deliveryCharge ? `₹${order.deliveryCharge}` : 'Free'}</b></p>{(order.platformFee || 0) > 0 && <p><span>Packaging</span><b>₹{order.platformFee}</b></p>}{(order.discountAmount || 0) > 0 && <p className="order-saving"><span>Discount</span><b>−₹{order.discountAmount}</b></p>}<p className="order-grand"><span>Total paid</span><b>₹{order.grandTotal ?? 0}</b></p></section>
        </div>}
      </article>;
    })}</div> : <div className="empty-state"><span className="empty-icon">🧁</span><h3>No orders yet</h3><p>Your delicious orders will appear here.</p><Link className="primary-button" href="/shop">Start Shopping</Link></div>}
  </main>;
}
