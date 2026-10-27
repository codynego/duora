'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      await requestPasswordReset(email);
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not send reset instructions.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password."
      description="Enter the email address on your Dorah account. We’ll send reset instructions if an account matches it."
      footer={<Link href="/login" className="font-black text-[#3157F5]">Back to sign in</Link>}
    >
      {sent ? (
        <p role="status" className="mt-8 rounded-xl border border-[#A5CD4A] bg-[#F2FADA] p-4 text-sm leading-6 text-[#496436]">
          If an account matches this email, reset instructions are on their way.
        </p>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-[#536078]">
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="duora-form-input mt-2 h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 font-normal text-[#111B33] outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"
            />
          </label>
          {error && <p role="alert" className="rounded-xl bg-[#FFF0F0] p-3 text-sm text-[#A4362B]">{error}</p>}
          <button
            disabled={saving}
            aria-busy={saving}
            className="button-primary button-loading inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_5px_0_rgba(49,87,245,.2)] disabled:opacity-50"
          >
            {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{saving ? 'Sending…' : 'Send reset instructions'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
