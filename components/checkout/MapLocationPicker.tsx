'use client';

import { useEffect, useRef, useState } from 'react';
import { Crosshair, MapPin, Minus, Plus, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/lib/toast';

type Coords = { lat: number; lng: number };
type Address = { address: string; city: string };
const defaultCoords: Coords = { lat: 28.0229, lng: 73.3119 };
const tileSize = 256;
const clampLatitude = (lat: number) => Math.min(85.05112878, Math.max(-85.05112878, lat));
const worldSizeForZoom = (zoom: number) => tileSize * 2 ** zoom;
const toWorld = ({ lat, lng }: Coords, zoom: number) => {
  const worldSize = worldSizeForZoom(zoom);
  return { x: ((lng + 180) / 360) * worldSize, y: (1 - Math.asinh(Math.tan((clampLatitude(lat) * Math.PI) / 180)) / Math.PI) / 2 * worldSize };
};
const fromWorld = ({ x, y }: { x: number; y: number }, zoom: number): Coords => {
  const worldSize = worldSizeForZoom(zoom);
  return { lng: ((x / worldSize) * 360) - 180, lat: (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / worldSize))) * 180) / Math.PI };
};

const reverseGeocode = async (coords: Coords): Promise<Address> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    const addr = data.address || {};
    const area = addr.neighbourhood || addr.suburb || addr.road || addr.village || '';
    const city = addr.city || addr.town || addr.state_district || '';
    return {
      address: area || data.display_name?.split(',')[0] || 'Selected location',
      city: city || 'City'
    };
  } catch {
    return { address: 'Selected location', city: 'City' };
  }
};

export default function MapLocationPicker() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; center: Coords; zoom: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [center, setCenter] = useState<Coords>(defaultCoords);
  const [zoom, setZoom] = useState(15);
  const [address, setAddress] = useState<Address>({ address: '', city: '' });
  const [fetchingAddress, setFetchingAddress] = useState(false);

  useEffect(() => {
    const openPicker = () => setOpen(true);
    window.addEventListener('bb:open-map', openPicker);
    if (searchParams.get('map') === '1') setOpen(true);
    return () => window.removeEventListener('bb:open-map', openPicker);
  }, [searchParams]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let timeoutId: NodeJS.Timeout;
    const fetchAddress = async () => {
      setFetchingAddress(true);
      const addr = await reverseGeocode(center);
      setAddress(addr);
      setFetchingAddress(false);
    };
    timeoutId = setTimeout(() => { void fetchAddress(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [center, open]);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) return toast('Location is not supported in this browser', 'error');
    navigator.geolocation.getCurrentPosition(
      (position) => { setCenter({ lat: position.coords.latitude, lng: position.coords.longitude }); toast('Map moved to your current location'); },
      () => toast('Could not get your location. Please allow location permission.', 'error'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { x: event.clientX, y: event.clientY, center, zoom };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = dragRef.current;
    if (!active) return;
    const start = toWorld(active.center, active.zoom);
    setCenter(fromWorld({ x: start.x - (event.clientX - active.x), y: start.y - (event.clientY - active.y) }, active.zoom));
  };
  const finishDrag = () => { dragRef.current = null; };
  const changeZoom = (nextZoom: number) => setZoom(Math.min(18, Math.max(11, nextZoom)));
  const wheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeZoom(zoom + (event.deltaY < 0 ? 1 : -1));
  };
  const confirmLocation = () => {
    window.dispatchEvent(new CustomEvent<Coords & Address>('bb:location-picked', { detail: { ...center, ...address } }));
    setOpen(false);
  };

  if (!open) return null;
  const world = toWorld(center, zoom);
  const centerTileX = Math.floor(world.x / tileSize);
  const centerTileY = Math.floor(world.y / tileSize);
  const tileCount = 2 ** zoom;
  const tiles = Array.from({ length: 49 }, (_, index) => {
    const dx = (index % 7) - 3;
    const dy = Math.floor(index / 7) - 3;
    const rawX = centerTileX + dx;
    const rawY = centerTileY + dy;
    const x = ((rawX % tileCount) + tileCount) % tileCount;
    const y = Math.max(0, Math.min(tileCount - 1, rawY));
    return { key: `${rawX}-${rawY}`, x, y, left: rawX * tileSize - world.x, top: rawY * tileSize - world.y };
  });

  return <div className="map-screen" role="dialog" aria-modal="true" aria-label="Select delivery location">
    <div className="map-screen-topbar"><div><b>Select delivery location</b><small>Drag the map until the pin is exactly on your address</small></div><button onClick={() => setOpen(false)} aria-label="Close map"><X size={21} /></button></div>
    <div className="map-canvas" ref={mapRef} onWheel={wheelZoom} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
      <div className="map-tiles">{tiles.map((tile) => <img key={tile.key} draggable={false} src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`} alt="" style={{ left: tile.left, top: tile.top }} />)}</div>
      <div className="map-zoom-controls">
        <button type="button" onClick={() => changeZoom(zoom + 1)} disabled={zoom >= 18} aria-label="Zoom in"><Plus size={18} /></button>
        <button type="button" onClick={() => changeZoom(zoom - 1)} disabled={zoom <= 11} aria-label="Zoom out"><Minus size={18} /></button>
      </div>
      <span className="map-center-pin"><MapPin size={45} fill="currentColor" /></span>
      <div className="map-center-shadow" />
    </div>
    <div className="map-screen-bottom"><button className="map-current-location" onClick={moveToCurrentLocation}><Crosshair size={18} /> Use my current location</button><div className="map-coordinates">Pin location<br /><b>{fetchingAddress ? 'Fetching address...' : address.address ? `${address.address}, ${address.city}` : 'Drag map to select location'}</b></div><button className="map-confirm-button" onClick={confirmLocation} disabled={fetchingAddress}>Confirm pin location</button></div>
  </div>;
}
