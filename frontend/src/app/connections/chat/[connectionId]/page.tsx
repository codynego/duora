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
      const token = await getAccessToken();
      if (!token) return router.replace('/login');
      const response = await fetch(`${api}/api/v1/connections/${params.connectionId}/thread/`, {
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
  }, [params.connectionId, router]);

  return <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-dark-950"><div className="text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-spark-coral" /><p className="mt-4 text-sm font-bold">Opening your private chat…</p>{error && <p role="alert" className="mt-3 max-w-sm text-sm text-spark-coral">{error}</p>}</div></main>;
}
