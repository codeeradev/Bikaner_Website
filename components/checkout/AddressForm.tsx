'use client';

import { useState } from 'react';
import { cities, areasByCity, type SavedAddress } from '@/data/addresses';
import { useLocationStore } from '@/lib/location-store';
import { useToast } from '@/lib/toast';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Errors = {
  city?: string;
  area?: string;
  fullAddress?: string;
  receiverName?: string;
  phone?: string;
  mapLink?: string;
};

export default function AddressForm() {
  const { addAddress, setLocation } = useLocationStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    city: '',
    area: '',
    fullAddress: '',
    mapLink: '',
    receiverName: '',
    phone: '',
    label: 'Home' as SavedAddress['label'],
  });
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const next: Errors = {};
    if (!form.city) next.city = 'Please select a city';
    if (!form.area) next.area = 'Please select an area';
    if (!form.fullAddress) next.fullAddress = 'Please enter your complete address';
    if (!form.receiverName) next.receiverName = 'Please enter receiver name';
    if (!form.phone) next.phone = 'Please enter phone number';
    else if (!/^\d{10}$/.test(form.phone)) next.phone = 'Enter a valid 10-digit mobile number';
    if (form.mapLink && !/^https?:\/\/.+/.test(form.mapLink)) next.mapLink = 'Enter a valid URL';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const address: SavedAddress = {
      id: Date.now().toString(),
      ...form,
    };
    if (user) {
      const position = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 8000 });
      });
      const result = await request<{ _id: string }>('/addresses', { method: 'POST', body: JSON.stringify({
        name: form.receiverName, mobile: form.phone, address: form.fullAddress, landmark: form.area, city: form.city,
        addressType: form.label === 'Work' ? 'work' : form.label === 'Other' || form.label === 'Hotel' ? 'other' : 'home', isDefault: true,
        lat: position?.coords.latitude ?? 28.0229, lng: position?.coords.longitude ?? 73.3119,
      }) });
      if (!result.data) return toast(result.message, 'error');
      address.backendId = result.data._id;
      window.localStorage.setItem('bb_selected_address', result.data._id);
    }
    addAddress(address);
    setLocation(`${form.area}, ${form.city}`);
    toast(user ? 'Address saved successfully' : 'Address saved locally. Sign in before placing your order.');
    setForm({ city: '', area: '', fullAddress: '', mapLink: '', receiverName: '', phone: '', label: 'Home' });
  }

  const areas = form.city ? areasByCity[form.city] ?? [] : [];

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <h3>Delivery Address</h3>

      <div className="form-field">
        <label>City</label>
        <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, area: '' })} className={errors.city ? 'error' : ''}>
          <option value="">Select a city</option>
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        {errors.city && <span className="field-error">{errors.city}</span>}
      </div>

      <div className="form-field">
        <label>Area / Street</label>
        <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={errors.area ? 'error' : ''} disabled={!form.city}>
          <option value="">Choose your area</option>
          {areas.map((area) => <option key={area} value={area}>{area}</option>)}
        </select>
        {errors.area && <span className="field-error">{errors.area}</span>}
      </div>

      <div className="form-field">
        <label>Complete Address</label>
        <textarea
          placeholder="House / Flat / Building, Street, Landmark (Optional)"
          value={form.fullAddress}
          onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
          className={errors.fullAddress ? 'error' : ''}
          rows={3}
        />
        {errors.fullAddress && <span className="field-error">{errors.fullAddress}</span>}
      </div>

      <div className="form-field">
        <label>Google Maps Link</label>
        <input
          type="text"
          placeholder="Paste Google Maps link for accurate location"
          value={form.mapLink}
          onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
          className={errors.mapLink ? 'error' : ''}
        />
        {errors.mapLink && <span className="field-error">{errors.mapLink}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Receiver Name</label>
          <input
            type="text"
            placeholder="Receiver name"
            value={form.receiverName}
            onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
            className={errors.receiverName ? 'error' : ''}
          />
          {errors.receiverName && <span className="field-error">{errors.receiverName}</span>}
        </div>
        <div className="form-field">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-field">
        <label>Save Address As</label>
        <div className="label-options">
          {(['Home', 'Work', 'Hotel', 'Other'] as const).map((label) => (
            <button
              key={label}
              type="button"
              className={form.label === label ? 'label-btn active' : 'label-btn'}
              onClick={() => setForm({ ...form, label })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="primary-button save-address-btn">Save Address</button>
    </form>
  );
}
