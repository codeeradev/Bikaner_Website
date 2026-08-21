import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import type { Offer } from '@/data/offers';

export default function OffersBar({ offers }: { offers: Offer[] }) {
  return (
    <section className="offers" id="offers">
      <div className="offer-intro">
        <span className="offer-icon"><Tag size={21} /></span>
        <div>
          <h3>Exciting Offers for You!</h3>
          <p>Save more on your favorite treats</p>
        </div>
      </div>
      {offers.map((offer) => (
        <div className="offer-item" key={offer.id}>
          <span className="offer-circle">{offer.icon}</span>
          <div>
            <b>{offer.title}</b>
            <small>{offer.subtitle}</small>
          </div>
          {offer.code && <code>{offer.code}</code>}
        </div>
      ))}
      <Link className="all-offers" href="/shop">View All Offers <ArrowRight size={17} /></Link>
    </section>
  );
}
