'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, CreditCard, MapPin, Package, ReceiptText } from 'lucide-react';
import { assetUrl, request } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type OrderItem = {
  quantity?: number;
  price?: number;
  subtotal?: number;
  productId?: {
    _id?: string;
    name?: string;
    image?: string;
  };
};

type Address = {
  name?: string;
  mobile?: string;
  house_No?: string;
  address?: string;
  landmark?: string;
  city?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  grandTotal?: number;
  totalAmount?: number;
  deliveryCharge?: number;
  platformFee?: number;
  discountAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  items?: OrderItem[];
  addressId?: Address;
};

const statusLabel = (value?: string) => {
  const status = value || 'pending';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

const statusColor = (status?: string) => {
  switch (status) {
    case 'delivered':
      return 'status-delivered';
    case 'confirmed':
    case 'processing':
      return 'status-processing';
    case 'cancelled':
    case 'failed':
      return 'status-cancelled';
    default:
      return 'status-pending';
  }
};

export default function OrdersPage() {
  const { user, hydrated } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void request<Order[]>('/orders').then((result) => setOrders(result.data || []));
    }
  }, [user]);

  if (hydrated && !user) {
    return (
      <main className="page-content empty-state">
        <span className="empty-icon">🔒</span>
        <h3>Sign in to see your orders</h3>
        <p>Track your orders, view order history, and manage returns</p>
        <Link className="primary-button" href="/login?next=/orders">
          Login / Sign up
        </Link>
      </main>
    );
  }

  return (
    <main className="page-content orders-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your purchases</p>
          <h1>My Orders</h1>
        </div>
      </div>

      <div className="orders-layout">
        <div className="orders-main">
          {orders === null ? (
            <div className="catalogue-loading">Loading your orders…</div>
          ) : orders.length ? (
            <div className="orders-list">
              {orders.map((order) => {
                const isOpen = openOrder === order._id;
                const quantity = order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
                const address = order.addressId;
                const orderDate = order.createdAt ? new Date(order.createdAt) : null;

                return (
                  <article className={isOpen ? 'order-card order-card-open' : 'order-card'} key={order._id}>
                    <button
                      className="order-card-summary"
                      onClick={() => setOpenOrder(isOpen ? null : order._id)}
                      aria-expanded={isOpen}
                    >
                      <div className="order-icon">
                        <Package size={24} />
                      </div>
                      
                      <div className="order-main">
                        <strong className="order-number">
                          {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                        </strong>
                        <div className="order-meta">
                          <span className="order-items">
                            {quantity} {quantity === 1 ? 'item' : 'items'}
                          </span>
                          {orderDate && (
                            <span className="order-date">
                              <Calendar size={14} />
                              {orderDate.toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="order-summary-right">
                        <div className="order-total">
                          <span className="order-amount">₹{order.grandTotal ?? 0}</span>
                          <span className={`order-status ${statusColor(order.orderStatus)}`}>
                            {statusLabel(order.orderStatus)}
                          </span>
                        </div>
                        <ChevronDown className={isOpen ? 'order-chevron open' : 'order-chevron'} size={20} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="order-details">
                        {/* Order Items */}
                        <section className="order-section">
                          <h2 className="order-section-title">
                            <ReceiptText size={18} />
                            <span>Order Items</span>
                          </h2>
                          <div className="order-items-list">
                            {order.items?.map((item, index) => (
                              <div className="order-item" key={`${item.productId?._id || index}-${index}`}>
                                {item.productId?.image && (
                                  <div className="order-item-image">
                                    <img src={assetUrl(item.productId.image)} alt={item.productId.name || 'Product'} />
                                  </div>
                                )}
                                <div className="order-item-details">
                                  <b className="order-item-name">{item.productId?.name || 'Product'}</b>
                                  <small className="order-item-qty">Qty: {item.quantity || 0}</small>
                                </div>
                                <strong className="order-item-price">
                                  ₹{item.subtotal ?? ((item.price || 0) * (item.quantity || 0))}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Delivery Details */}
                        <section className="order-section">
                          <h2 className="order-section-title">
                            <MapPin size={18} />
                            <span>Delivery Details</span>
                          </h2>
                          <div className="order-delivery-info">
                            <p className="order-address">
                              <strong>{address?.name || 'Delivery address'}</strong>
                              {address?.mobile && <span className="order-phone"> · {address.mobile}</span>}
                              <br />
                              <span className="order-address-text">
                                {[address?.house_No, address?.address, address?.landmark, address?.city]
                                  .filter(Boolean)
                                  .join(', ') || 'Address details unavailable'}
                              </span>
                            </p>
                            <p className="order-payment">
                              <CreditCard size={16} />
                              <span>
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                              </span>
                              <span className="payment-status"> · {statusLabel(order.paymentStatus)}</span>
                            </p>
                          </div>
                        </section>

                        {/* Bill Summary */}
                        <section className="order-section order-breakdown">
                          <h2 className="order-section-title">
                            <ReceiptText size={18} />
                            <span>Bill Summary</span>
                          </h2>
                          <div className="order-bill">
                            <div className="bill-row">
                              <span>Items Total</span>
                              <b>₹{order.totalAmount ?? 0}</b>
                            </div>
                            <div className="bill-row">
                              <span>Delivery Charges</span>
                              <b>{order.deliveryCharge ? `₹${order.deliveryCharge}` : <span className="free-tag">Free</span>}</b>
                            </div>
                            {(order.platformFee || 0) > 0 && (
                              <div className="bill-row">
                                <span>Packaging Fee</span>
                                <b>₹{order.platformFee}</b>
                              </div>
                            )}
                            {(order.discountAmount || 0) > 0 && (
                              <div className="bill-row discount-row">
                                <span>Discount</span>
                                <b className="discount-amount">−₹{order.discountAmount}</b>
                              </div>
                            )}
                            <div className="bill-row bill-total">
                              <span>Total Paid</span>
                              <b>₹{order.grandTotal ?? 0}</b>
                            </div>
                          </div>
                        </section>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🧁</span>
              <h3>No orders yet</h3>
              <p>Your delicious orders will appear here once you make a purchase.</p>
              <Link className="primary-button" href="/shop">
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {orders && orders.length > 0 && (
          <aside className="orders-sidebar">
            {/* Order Summary Stats */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Order Summary</h3>
              <div className="order-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Spent</span>
                  <span className="stat-value">
                    ₹{orders.reduce((sum, order) => sum + (order.grandTotal ?? 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending Orders</span>
                  <span className="stat-value stat-pending">
                    {orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Delivered</span>
                  <span className="stat-value stat-delivered">
                    {orders.filter((o) => o.orderStatus === 'delivered').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Need Help?</h3>
              <div className="help-links">
                <Link href="/info/shipping-policy" className="help-link">
                  <Package size={18} />
                  <span>Shipping Policy</span>
                </Link>
                <Link href="/info/refund-policy" className="help-link">
                  <ReceiptText size={18} />
                  <span>Refund Policy</span>
                </Link>
                <Link href="/info/terms-and-conditions" className="help-link">
                  <ReceiptText size={18} />
                  <span>Terms & Conditions</span>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sidebar-card sidebar-cta">
              <h3 className="sidebar-card-title">Quick Actions</h3>
              <Link href="/shop" className="sidebar-button primary-button">
                Continue Shopping
              </Link>
              <Link href="/wishlist" className="sidebar-button outline-button">
                View Wishlist
              </Link>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
