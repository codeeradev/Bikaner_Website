export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  code?: string;
  icon: string;
};

export const offers: Offer[] = [
  { id: 'first10', title: 'FLAT 10% OFF', subtitle: 'On first order', code: 'FIRST10', icon: '%' },
  { id: 'free-delivery', title: 'FREE DELIVERY', subtitle: 'On orders above ₹499', icon: '▰' },
  { id: 'prepaid', title: 'EXTRA 5% OFF', subtitle: 'On prepaid orders', icon: '▤' },
];

export type Coupon = {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  description: string;
};

export const coupons: Record<string, Coupon> = {
  FIRST10: { code: 'FIRST10', type: 'percent', value: 10, description: '10% off on first order' },
};
