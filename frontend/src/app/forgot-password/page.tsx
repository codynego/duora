'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import AuthShell from '@/components/AuthShell';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); try { setSaving(true); setError(''); await requestPasswordReset(email); setSent(true); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not send reset instructions.'); } finally { setSaving(false); } }
  return <AuthShell title="Reset your password." description="Enter your email and we’ll send instructions if an account matches it." footer={<Link href="/login" className="font-black text-[#3157F5]">Back to sign in</Link>}>{sent ? <p className="mt-8 rounded-2xl border border-[#A5CD4A] bg-[#F2FADA] p-4 text-sm leading-6 text-[#496436]">If an account matches this email, reset instructions are on their way.</p> : <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5"><label className="block text-xs font-black uppercase tracking-[.08em] text-[#536078]">Email<input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="duora-form-input mt-2 h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 font-normal outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>{error && <p role="alert" className="rounded-xl bg-[#FFF0F0] p-3 text-sm text-[#A4362B]">{error}</p>}<button disabled={saving} className="button-primary h-12 w-full rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_5px_0_rgba(49,87,245,.2)] disabled:opacity-50">{saving ? 'Sending…' : 'Send instructions'}</button></form>}</AuthShell>;
}
