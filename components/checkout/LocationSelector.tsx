'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLocationStore } from '@/lib/location-store';
import { useToast } from '@/lib/toast';

export default function LocationSelector() {
  const { location, setLocation } = useLocationStore();
  const { toast } = useToast();
  const [choice, setChoice] = useState<'current' | 'other'>('current');

  return (
    <div className="location-selector">
      <div className="current-location-card">
        <div className="location-card-top">
          <MapPin size={20} />
          <div>
            <p className="label">Delivery to</p>
            <p className="value">{location}</p>
            <p className="eta">ETA: 30–40 mins</p>
          </div>
          <button className="change-link" onClick={() => toast('Open location picker')}>Change</button>
        </div>
      </div>

      <div className="location-choice">
        <p className="choice-question">Do you want this order at your current location?</p>
        <div className="choice-cards">
          <button
            className={choice === 'current' ? 'choice-card active' : 'choice-card'}
            onClick={() => setChoice('current')}
          >
            <span className="radio-dot" />
            <div>
              <strong>Yes, deliver at my current location</strong>
              <p>{location}</p>
            </div>
          </button>
          <button
            className={choice === 'other' ? 'choice-card active' : 'choice-card'}
            onClick={() => setChoice('other')}
          >
            <span className="radio-dot" />
            <div>
              <strong>No, at some other location</strong>
              <p>Choose from saved addresses or add a new one</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
