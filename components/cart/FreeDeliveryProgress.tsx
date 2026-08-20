'use client';

import { useStore } from '@/lib/store';

export default function FreeDeliveryProgress() {
  const { itemTotal, amountToFreeDelivery, freeDeliveryProgress, freeDeliveryThreshold } = useStore();

  if (itemTotal === 0) return null;

  return (
    <div className="free-delivery">
      {amountToFreeDelivery > 0 ? (
        <p>Add more items worth <strong>₹{amountToFreeDelivery}</strong> to get FREE DELIVERY</p>
      ) : (
        <p className="unlocked">🎉 You've unlocked FREE DELIVERY!</p>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${freeDeliveryProgress}%` }} />
      </div>
      <small>Free delivery on orders above ₹{freeDeliveryThreshold}</small>
    </div>
  );
}
