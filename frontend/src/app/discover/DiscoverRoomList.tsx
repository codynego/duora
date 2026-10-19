'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, Radio, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { RoomSummary } from '@/lib/duora-api';
import { getAccessToken } from '@/lib/auth';

const roomColors = ['#fff0f3', '#fff8dc', '#f2f0fa', '#eef7f1'];
type RoomFilter = 'for-you' | 'starting-soon' | 'this-evening';

function startsLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Schedule pending';
  return new Intl.DateTimeFormat('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}

function remainingLabel(room: RoomSummary, now: Date) {
  const endAt = new Date(room.starts_at).getTime() + room.duration_minutes * 60_000;
  const remainingMinutes = Math.max(0, Math.ceil((endAt - now.getTime()) / 60_000));
  return remainingMinutes <= 1 ? 'Less than a minute left' : `${remainingMinutes} min left`;
}

function isLive(room: RoomSummary, now: Date) {
  const startsAt = new Date(room.starts_at).getTime();
  return Number.isFinite(startsAt) && startsAt <= now.getTime() && startsAt + room.duration_minutes * 60_000 > now.getTime();
}

function isThisEvening(value: string, now: Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date <= now) return false;
  const eveningStart = new Date(now);
  eveningStart.setHours(17, 0, 0, 0);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return date >= eveningStart && date < tomorrow;
}

function matchesFilter(room: RoomSummary, filter: RoomFilter, now: Date) {
  const startsAt = new Date(room.starts_at).getTime();
  if (filter === 'for-you') return true;
  if (!Number.isFinite(startsAt) || startsAt <= now.getTime()) return false;
  if (filter === 'starting-soon') return startsAt <= now.getTime() + 2 * 60 * 60 * 1000;
  return isThisEvening(room.starts_at, now);
}

export default function DiscoverRoomList({ rooms }: { rooms: RoomSummary[] }) {
  const [filter, setFilter] = useState<RoomFilter>('for-you');
  const [now, setNow] = useState(() => new Date());
  const [activeRoomCodes, setActiveRoomCodes] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    async function loadActiveRooms() {
      const token = await getAccessToken();
      if (!token) return;
      const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
      const response = await fetch(`${api}/api/v1/rooms/active/`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body?.data)) setActiveRoomCodes(new Set(body.data.map((room: RoomSummary) => room.code)));
    }
    void loadActiveRooms();
  }, []);
  const visibleRooms = rooms.filter((room) => matchesFilter(room, filter, now));
  const filterOptions: Array<[RoomFilter, string]> = [
    ['for-you', 'For you'],
    ['starting-soon', 'Starting soon'],
    ['this-evening', 'This evening'],
  ];

  return <>
    <section className="mt-10 flex flex-col gap-4 border-y border-dark-950/10 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Room filters">
        {filterOptions.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === value ? 'bg-dark-950 text-white' : 'border border-dark-950/12 bg-white hover:border-dark-950/30'}`}>{label}</button>)}
      </div>
    </section>
    {visibleRooms.length > 0 ? <section className="mt-7 grid gap-4 lg:grid-cols-2">{visibleRooms.map((room, index) => { const live = isLive(room, now); const isMine = activeRoomCodes.has(room.code); return <article key={room.code} className={`group relative overflow-hidden rounded-[28px] border bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl sm:p-7 ${isMine ? 'border-[#3b7d56]/45 ring-1 ring-[#3b7d56]/20' : 'border-dark-950/10'}`}><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[70px]" style={{ background: roomColors[index % roomColors.length] }} /><div className="relative"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-dark-950/5 px-2.5 py-1 text-xs font-bold text-dark-950/60">{room.tone}</span>{live ? <span className="flex items-center gap-1 rounded-full bg-[#eef7f1] px-2.5 py-1 text-xs font-bold text-[#2b6142]"><Radio className="h-3.5 w-3.5 animate-pulse" />Live · {remainingLabel(room, now)}</span> : <span className="flex items-center gap-1 text-xs text-[#6F6470]"><Clock3 className="h-3.5 w-3.5" />{startsLabel(room.starts_at)}</span>}</div>{isMine && <span className="mt-4 inline-flex rounded-full bg-[#3b7d56] px-2.5 py-1 text-[11px] font-bold text-white">You’re in this room</span>}<h2 className={`${isMine ? 'mt-5' : 'mt-10'} text-2xl font-bold tracking-[-.05em]`}>{room.title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">{room.description}</p><div className="mt-7 flex items-center justify-between border-t border-dark-950/8 pt-4"><span className="flex items-center gap-2 text-xs font-semibold text-[#6F6470]"><UsersRound className="h-4 w-4" />{room.members_count}/{room.max_members} people · {room.duration_minutes} min</span><Link href={`/rooms/${room.code}`} className="inline-flex items-center gap-1 text-sm font-bold text-spark-coral">{isMine ? 'Rejoin' : 'View room'} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></div></div></article>; })}</section> : <section className="mt-7 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-12 text-center"><UsersRound className="mx-auto h-6 w-6 text-spark-coral" /><h2 className="mt-4 text-xl font-bold tracking-[-.04em]">No rooms match this filter.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">Try another time or switch back to For you to see every available room.</p></section>}
  </>;
}
