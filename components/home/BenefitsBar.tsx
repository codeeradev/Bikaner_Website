import { Sparkles, ShieldCheck, RotateCcw, Truck } from 'lucide-react';

const benefits = [
  { icon: Sparkles, title: 'Freshly Baked', subtitle: 'Made with love daily' },
  { icon: Truck, title: 'Fast Delivery', subtitle: 'On time, every time' },
  { icon: ShieldCheck, title: '100% Quality', subtitle: 'Premium ingredients' },
  { icon: ShieldCheck, title: 'Secure Payments', subtitle: '100% safe & secure' },
  { icon: RotateCcw, title: 'Easy Returns', subtitle: 'Hassle free returns' },
];

export default function BenefitsBar() {
  return (
    <section className="bottom-benefits">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <span key={benefit.title}>
            <Icon size={24} />
            <b>{benefit.title}<small>{benefit.subtitle}</small></b>
          </span>
        );
      })}
    </section>
  );
}
