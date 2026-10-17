'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

type Preview = { room: { title: string; duration_minutes: number }; invited_by: string; expires_at: string };

export default function InviteAcceptancePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null); const [loading, setLoading] = useState(true); const [accepting, setAccepting] = useState(false); const [error, setError] = useState('');
  const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

  useEffect(() => { fetch(`${api}/api/v1/rooms/invites/${params.token}/`).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.detail ?? 'This invitation is unavailable.'); setPreview(body.data); }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'This invitation is unavailable.')).finally(() => setLoading(false)); }, [api, params.token]);

  async function accept() {
    const token = await getAccessToken();
    if (!token) return setError('Sign in or create an account to join this private room.');
    setAccepting(true); setError('');
    try {
      const response = await fetch(`${api}/api/v1/rooms/invites/${params.token}/accept/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!response.ok || !body.data?.room_id) throw new Error(body.detail ?? 'This invitation is unavailable.');
      router.push(`/rooms/private/${body.data.room_id}`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'This invitation is unavailable.'); } finally { setAccepting(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-dark-950"><section className="w-full max-w-lg rounded-[30px] border border-dark-950/10 bg-white p-7 text-center shadow-[0_18px_55px_rgba(40,29,50,.08)] sm:p-10"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f3]"><LockKeyhole className="h-5 w-5 text-spark-coral" /></span>{loading ? <p className="mt-7 text-sm text-[#6F6470]">Opening your invitation…</p> : preview ? <><p className="mt-7 section-label">Private invitation</p><h1 className="mt-3 text-3xl font-bold tracking-[-.055em]">{preview.invited_by} invited you to {preview.room.title}.</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6F6470]">A private shared experience for two. Allow about {preview.room.duration_minutes} minutes.</p><button disabled={accepting} onClick={accept} className="mt-8 inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-70">{accepting ? 'Joining room…' : 'Join private room'} <ArrowRight className="h-4 w-4" /></button></> : <><h1 className="mt-7 text-3xl font-bold tracking-[-.055em]">This invitation is unavailable.</h1><p className="mt-3 text-sm leading-6 text-[#6F6470]">It may have expired or already been used.</p><Link href="/" className="mt-8 inline-flex rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">Go to Duora</Link></>}{error && <p role="alert" className="mt-5 text-sm text-spark-coral">{error}</p>}</section></main>;
}
