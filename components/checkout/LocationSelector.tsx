'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLocationStore } from '@/lib/location-store';
import { useToast } from '@/lib/toast';

type ApiAddress = { _id: string; name?: string; address?: string; house_No?: string; landmark?: string; city?: string; isDefault?: boolean };

export default function LocationSelector() {
  const { location, setLocation } = useLocationStore(); const { user } = useAuth(); const { toast } = useToast();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]); const [selected, setSelected] = useState<string | null>(null);
  const loadAddresses = useCallback(() => { if (!user) return; void request<ApiAddress[]>('/addresses').then((result) => { const items = result.data || []; setAddresses(items); const preferred = items.find((item) => item.isDefault) || items[0]; if (preferred) { setSelected(preferred._id); window.localStorage.setItem('bb_selected_address', preferred._id); } }); }, [user]);
  useEffect(() => { loadAddresses(); window.addEventListener('bb:address-saved', loadAddresses); return () => window.removeEventListener('bb:address-saved', loadAddresses); }, [loadAddresses]);
  const choose = (address: ApiAddress) => { setSelected(address._id); window.localStorage.setItem('bb_selected_address', address._id); setLocation([address.house_No, address.address, address.city].filter(Boolean).join(', ')); toast('Delivery address selected'); };
  return <div className="location-selector"><div className="current-location-card"><div className="location-card-top"><MapPin size={20} /><div><p className="label">Delivering to</p><p className="value">{location}</p><p className="eta">ETA: 30–40 mins</p></div></div></div><div className="location-choice"><p className="choice-question">Choose a delivery location</p>{addresses.length > 0 && <div className="saved-address-list">{addresses.map((address) => <button key={address._id} className={selected === address._id ? 'choice-card active' : 'choice-card'} onClick={() => choose(address)}><span className="radio-dot" /><div><strong>{address.name || 'Saved address'} {address.isDefault ? '· Default' : ''}</strong><p>{[address.house_No, address.address, address.landmark, address.city].filter(Boolean).join(', ')}</p></div></button>)}</div>}<button className="choice-card add-location-card" onClick={() => window.dispatchEvent(new Event('bb:add-address'))}><Plus size={20} /><div><strong>Add another location</strong><p>Select your location on the map, then add optional address details.</p></div></button>{!user && <button className="change-link" onClick={() => window.dispatchEvent(new Event('bb:open-login'))}>Login to use saved addresses</button>}</div></div>;
}
