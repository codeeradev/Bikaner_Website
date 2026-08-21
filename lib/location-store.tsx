'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { SavedAddress } from '@/data/addresses';

type LocationState = {
  location: string;
  setLocation: (location: string) => void;
  addresses: SavedAddress[];
  addAddress: (address: SavedAddress) => void;
};

const LocationContext = createContext<LocationState | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState('Choose a delivery location');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocationState(window.localStorage.getItem('bb_location') || 'Choose a delivery location');
    setAddresses(JSON.parse(window.localStorage.getItem('bb_addresses') || '[]'));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) window.localStorage.setItem('bb_location', location); }, [location, hydrated]);
  useEffect(() => { if (hydrated) window.localStorage.setItem('bb_addresses', JSON.stringify(addresses)); }, [addresses, hydrated]);

  const setLocation = useCallback((value: string) => setLocationState(value), []);
  const addAddress = useCallback((address: SavedAddress) => setAddresses((current) => [address, ...current]), []);

  return (
    <LocationContext.Provider value={{ location, setLocation, addresses, addAddress }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationStore() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocationStore must be used within LocationProvider');
  return context;
}
