'use client';

import { FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Phone, ShieldCheck, X } from 'lucide-react';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export default function LoginDialog() {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const { signIn } = useAuth(); const { toast } = useToast();
  const [open, setOpen] = useState(false); const [phone, setPhone] = useState(''); const [otp, setOtp] = useState(''); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  const close = () => { setOpen(false); setSent(false); setOtp(''); };
  useEffect(() => { const show = () => setOpen(true); window.addEventListener('bb:open-login', show); if (searchParams.get('login') === '1') setOpen(true); return () => window.removeEventListener('bb:open-login', show); }, [searchParams]);
  async function handleSend(event: FormEvent) { event.preventDefault(); if (!/^\d{10}$/.test(phone)) return toast('Enter a valid 10-digit mobile number', 'error'); setBusy(true); const result = await sendOtp(phone, 'mobile'); setBusy(false); if (!result.ok) return toast(result.message, 'error'); setSent(true); toast('OTP sent successfully'); }
  async function handleVerify(event: FormEvent) { event.preventDefault(); if (!/^\d{6}$/.test(otp)) return toast('Enter the 6-digit OTP', 'error'); setBusy(true); const result = await verifyOtp(phone, 'mobile', otp); setBusy(false); const authenticated = result.data as ({ token?: string } & Record<string, unknown>) | null; if (!result.ok || !authenticated?.token) return toast(result.message, 'error'); const { token, ...user } = authenticated; signIn(token, user as { id: string; name?: string; email?: string; mobile?: string; profileImage?: string }); toast('Welcome to Bikaner Bakery!'); const next = searchParams.get('next') || pathname; close(); router.replace(next); }
  if (!open) return null;
  return <div className="login-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="login-close" onClick={close} aria-label="Close login"><X size={21} /></button><div className="auth-heading"><span className="auth-icon"><ShieldCheck size={28} /></span><h2 id="login-title">{sent ? 'Verify your OTP' : 'Login to continue'}</h2><p>{sent ? `Enter the code sent to ${phone}` : 'Enter your mobile number to receive an OTP.'}</p></div>{!sent ? <form onSubmit={handleSend} className="auth-form"><label>Mobile number<div className="phone-input"><Phone size={18} /><span>+91</span><input autoFocus inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" /></div></label><button className="primary-button" disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</button></form> : <form onSubmit={handleVerify} className="auth-form"><label>6-digit OTP<input autoFocus inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP" /></label><button className="primary-button" disabled={busy}>{busy ? 'Verifying…' : 'Verify & Login'}</button><button className="text-button" type="button" onClick={() => { setSent(false); setOtp(''); }}>Change mobile number</button></form>}</section></div>;
}
