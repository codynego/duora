'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '@/components/AuthShell';
import { signUp } from '@/lib/auth';

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'new-password';
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block text-sm font-bold">
      {label}
      <span className="relative mt-2 block">
        <input value={value} onChange={e => onChange(e.target.value)} required minLength={minLength} type={visible ? 'text' : 'password'} autoComplete={autoComplete} className="w-full rounded-xl border border-dark-950/15 px-4 py-3 pr-12 font-normal outline-none focus:border-spark-coral" />
        <button type="button" onClick={() => setVisible(current => !current)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#6F6470] transition hover:text-dark-950 focus-visible:outline-none focus-visible:text-spark-coral">
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(username, password, confirm, gender);
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Start with a small hello."
      description="Your preferences stay private and help Duora make better room recommendations."
      footer={<>Already have an account? <Link href="/login" className="font-bold text-spark-coral">Sign in</Link></>}
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm font-bold">
          Username
          <input value={username} onChange={e => setUsername(e.target.value)} required minLength={3} autoComplete="username" className="mt-2 w-full rounded-xl border border-dark-950/15 px-4 py-3 font-normal outline-none focus:border-spark-coral" />
        </label>
        <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="new-password" minLength={10} />
        <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <label className="block text-sm font-bold">
          Gender
          <span className="mt-1 block text-xs font-normal text-[#6F6470]">Used privately to keep adult prompts more appropriate. You can change this later.</span>
          <select value={gender} onChange={e => setGender(e.target.value)} required className="mt-2 w-full rounded-xl border border-dark-950/15 bg-white px-4 py-3 font-normal outline-none focus:border-spark-coral">
            <option value="" disabled>Select an option</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        {error && <p role="alert" className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#b23b58]">{error}</p>}
        <button disabled={loading} className="w-full rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
