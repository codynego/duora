'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import RoomExperience from '@/components/RoomExperience';
import { RoomSummary } from '@/lib/duora-api';
import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export default function PrivateRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadRoom() {
      const token = await getAccessToken();
      if (!token) return setReady(true);
      const response = await fetch(`${api}/api/v1/rooms/private/${roomId}/`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) setRoom(await response.json());
      setReady(true);
    }
    void loadRoom();
  }, [roomId]);

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#fffdfc] text-sm font-semibold text-[#6F6470]">Opening your experience…</main>;
  if (!room) return <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-center text-dark-950"><section><h1 className="text-2xl font-bold tracking-[-.045em]">This experience is unavailable.</h1><p className="mt-3 text-sm leading-6 text-[#6F6470]">It may have ended, been archived, or no longer be available to this account.</p><Link href="/home" className="mt-6 inline-flex rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">Back home</Link></section></main>;
  return <RoomExperience roomId={room.id} roomCode={room.code} roomName={room.title} mode={room.mode} audience={room.audience} experience={room.experience} startsAt={room.starts_at} durationMinutes={room.duration_minutes} maxMembers={room.max_members} roomStatus={room.status} isDiscoveryRoom={room.is_discovery_room} alreadyJoined />;
}
