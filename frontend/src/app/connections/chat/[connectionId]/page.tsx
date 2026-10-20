'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function ConnectionChatStartPage({ params }: { params: { connectionId: string } }) {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function start() {
      const route = await Promise.resolve(params);
      const token = await getAccessToken();
      if (!token) return router.replace('/login');
      const response = await fetch(`${api}/api/v1/connections/${route.connectionId}/thread/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok || !body.data?.id) {
        if (active) setError(body.detail ?? 'This chat could not be opened.');
        return;
      }
      router.replace(`/connections/${body.data.id}`);
    }
    void start();
    return () => { active = false; };
  }, [params, router]);

  return <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-dark-950"><div className="text-center">{error ? <><p role="alert" className="max-w-sm text-sm font-semibold text-spark-coral">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-dark-950 px-4 py-2.5 text-xs font-bold text-white">Try again</button></> : <><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-spark-coral" /><p className="mt-4 text-sm font-bold">Opening your private chat…</p></>}</div></main>;
}
