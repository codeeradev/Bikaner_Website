'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, ShieldCheck } from 'lucide-react';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'mobile' | 'email'>('mobile');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const type = mode;

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const value = identifier.trim();
    if (type === 'mobile' && !/^\d{10}$/.test(value)) return toast('Enter a valid 10-digit mobile number', 'error');
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return toast('Enter a valid email address', 'error');
    setBusy(true);
    const result = await sendOtp(value, type);
    setBusy(false);
    if (!result.data) return toast(result.message, 'error');
    setSent(true);
    toast(result.data.devOTP ? `OTP sent. Development OTP: ${result.data.devOTP}` : 'OTP sent successfully');
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return toast('Enter the 6-digit OTP', 'error');
    setBusy(true);
    const result = await verifyOtp(identifier.trim(), type, otp, name.trim() || undefined);
    setBusy(false);
    const authenticated = result.data as ({ token?: string } & Record<string, unknown>) | null;
    if (!authenticated?.token) return toast(result.message, 'error');
    const { token, ...user } = authenticated;
    signIn(token, user as { id: string; name?: string; email?: string; mobile?: string; profileImage?: string });
    toast('Welcome to Bikaner Bakery!');
    router.replace(searchParams.get('next') || '/');
  }

  return <main className="page-content auth-page"><section className="auth-card">
    <Link className="back-link" href="/"><ArrowLeft size={18} /> Back to home</Link>
    <div className="auth-heading"><span className="auth-icon"><ShieldCheck size={28} /></span><h1>{sent ? 'Verify your OTP' : 'Welcome to Bikaner Bakery'}</h1><p>{sent ? `We sent a code to ${identifier}.` : 'Sign in to save your cart, addresses, and orders.'}</p></div>
    {!sent ? <form onSubmit={handleSend} className="auth-form">
      <div className="auth-tabs"><button type="button" className={mode === 'mobile' ? 'active' : ''} onClick={() => setMode('mobile')}><Phone size={16} /> Mobile</button><button type="button" className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}><Mail size={16} /> Email</button></div>
      <label>{mode === 'mobile' ? 'Mobile number' : 'Email address'}<input autoFocus inputMode={mode === 'mobile' ? 'numeric' : 'email'} value={identifier} onChange={(e) => setIdentifier(mode === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value)} placeholder={mode === 'mobile' ? '10-digit mobile number' : 'you@example.com'} /></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</button>
    </form> : <form onSubmit={handleVerify} className="auth-form">
      <label>Name <small>(only needed for a new account)</small><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
      <label>6-digit OTP<input autoFocus inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" /></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Verifying…' : 'Verify & Sign In'}</button>
      <button className="text-button" type="button" onClick={() => { setSent(false); setOtp(''); }}>Use a different {mode}</button>
    </form>}
  </section></main>;
}
