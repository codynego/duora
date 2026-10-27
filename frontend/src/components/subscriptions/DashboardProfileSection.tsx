'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole, LogOut, UserRound } from 'lucide-react';
import { logOut } from '@/lib/auth';
import { updateCurrentUser, type CurrentUser } from '@/lib/current-user';

export default function DashboardProfileSection({ user, onUpdated }: {
  user: CurrentUser | null;
  onUpdated: (user: CurrentUser) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    setSaving(true); setNotice(''); setError('');
    try {
      const updated = await updateCurrentUser({
        display_name: String(form.get('display_name') ?? '').trim(),
      });
      onUpdated(updated);
      setNotice('Profile saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your profile.');
    } finally { setSaving(false); }
  }

  async function signOut() {
    await logOut();
    router.replace('/login');
  }

  return <div className="grid gap-6">
    <header><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Your account</p><h1 className="mt-2 font-[Aptos_Display,Arial,sans-serif] text-4xl font-black tracking-[-.07em] sm:text-5xl">Profile</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#64708A]">Update how your account appears in Dorah and manage your sign-in details.</p></header>
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-xl border border-[#111B33]/10 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#111B33]/[.08] pb-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><UserRound className="h-5 w-5" /></span><div><h2 className="text-sm font-black">Personal details</h2><p className="mt-1 text-xs text-[#758096]">These details identify you in your workspace.</p></div></div>
        {user ? <form onSubmit={(event) => void save(event)} className="mt-5 grid gap-4">
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Display name<input name="display_name" key={user.display_name} defaultValue={user.display_name} required maxLength={64} className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Username<input value={user.username} readOnly className="h-11 cursor-not-allowed rounded-lg border border-[#111B33]/10 bg-[#F5F7FB] px-3 text-sm font-normal text-[#758096]" /><span className="text-[10px] font-normal leading-4 text-[#758096]">Your username is used for sign-in and can’t be changed here.</span></label>
          <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Account email<input value={user.email} readOnly className="h-11 cursor-not-allowed rounded-lg border border-[#111B33]/10 bg-[#F5F7FB] px-3 text-sm font-normal text-[#758096]" /><span className="text-[10px] font-normal leading-4 text-[#758096]">Email changes will be available when verification is supported.</span></label>
          {error && <p role="alert" className="rounded-lg bg-[#FFF0F0] p-3 text-xs text-[#A4362B]">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-[#A5CD4A] bg-[#F2FADA] p-3 text-xs text-[#496436]">{notice}</p>}
          <button disabled={saving} className="h-11 w-fit rounded-lg bg-[#3157F5] px-5 text-xs font-black text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save profile'}</button>
        </form> : <p className="mt-5 text-sm text-[#758096]">Loading your account details…</p>}
      </section>
      <aside className="grid content-start gap-4">
        <section className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9] text-[#3157F5]"><LockKeyhole className="h-4 w-4" /></span><div><h2 className="text-sm font-black">Password &amp; security</h2><p className="mt-1 text-xs text-[#758096]">Reset your password if you need to secure your account.</p></div></div><Link href="/forgot-password" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[#3157F5]">Reset password <ArrowRight className="h-4 w-4" /></Link></section>
        <section className="rounded-xl border border-[#111B33]/10 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#758096]">Account created</p><p className="mt-2 text-sm font-bold">{user ? new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p></section>
        <button type="button" onClick={() => void signOut()} className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#111B33]/15 bg-white px-4 text-xs font-black text-[#536078] hover:border-[#3157F5]/40 hover:text-[#3157F5]"><LogOut className="h-4 w-4" />Sign out</button>
      </aside>
    </div>
  </div>;
}
