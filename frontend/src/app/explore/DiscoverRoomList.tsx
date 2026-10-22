'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Clock3, Heart, Info, Radio, UsersRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { RoomSummary } from '@/lib/duora-api';
import { getAccessToken } from '@/lib/auth';

const roomColors = ['#fff0f3', '#fff8dc', '#f2f0fa', '#eef7f1'];
type RoomFilter = 'all' | 'live' | 'soon';

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
  return room.status === 'active' && Number.isFinite(startsAt) && startsAt <= now.getTime() && startsAt + room.duration_minutes * 60_000 > now.getTime();
}

function isStartingSoon(room: RoomSummary, now: Date) {
  const startsAt = new Date(room.starts_at).getTime();
  return room.status === 'scheduled' && Number.isFinite(startsAt) && startsAt > now.getTime() && startsAt <= now.getTime() + 2 * 60 * 60 * 1000;
}

function roomSort(a: RoomSummary, b: RoomSummary, now: Date) {
  const liveDelta = Number(isLive(b, now)) - Number(isLive(a, now));
  if (liveDelta) return liveDelta;
  const aStart = new Date(a.starts_at).getTime();
  const bStart = new Date(b.starts_at).getTime();
  return (Number.isFinite(aStart) ? aStart : Number.MAX_SAFE_INTEGER) - (Number.isFinite(bStart) ? bStart : Number.MAX_SAFE_INTEGER);
}

export default function DiscoverRoomList({ rooms }: { rooms: RoomSummary[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<RoomFilter>('all');
  const [now, setNow] = useState(() => new Date());
  const [deckIndex, setDeckIndex] = useState(0);
  const [savedCodes, setSavedCodes] = useState<Set<string>>(() => new Set());
  const [activeRoomCodes, setActiveRoomCodes] = useState<Set<string>>(() => new Set());
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('');
  const dragStartX = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadActiveRooms() {
      const token = await getAccessToken({ redirectOnFailure: false });
      if (!token) return;
      const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
      const response = await fetch(`${api}/api/v1/rooms/active/`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body?.data)) setActiveRoomCodes(new Set(body.data.map((room: RoomSummary) => room.code)));
    }
    void loadActiveRooms();
  }, []);

  const visibleRooms = useMemo(() => rooms
    .filter((room) => filter === 'all' || (filter === 'live' ? isLive(room, now) : isStartingSoon(room, now)))
    .sort((a, b) => roomSort(a, b, now)), [filter, now, rooms]);
  const room = visibleRooms[deckIndex];
  const nextRoom = visibleRooms[deckIndex + 1];

  useEffect(() => {
    setDeckIndex(0);
    setDragX(0);
  }, [filter]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function moveToNext(action: 'skip' | 'save') {
    if (!room) return;
    if (action === 'save') {
      setSavedCodes((current) => new Set(current).add(room.code));
      setNotice('Saved to your picks for this visit.');
    }
    setDeckIndex((index) => index + 1);
    setDragX(0);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('button, a')) return;
    dragStartX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!dragging || dragStartX.current === null) return;
    setDragX(event.clientX - dragStartX.current);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    dragStartX.current = null;
    if (dragX > 90) moveToNext('save');
    else if (dragX < -90) moveToNext('skip');
    else setDragX(0);
  }

  function joinRoom() {
    if (!room) return;
    router.push(`/rooms/${room.code}?join=1`);
  }

  function handlePrimaryAction() {
    if (!room) return;
    if (isLive(room, now) || room.status === 'open' || activeRoomCodes.has(room.code)) joinRoom();
    else moveToNext('save');
  }

  const filters: Array<[RoomFilter, string]> = [['all', 'All rooms'], ['live', 'Live now'], ['soon', 'Starting soon']];

  return <>
    <section className="mt-10 flex flex-col gap-4 border-y border-dark-950/10 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Room filters">
        {filters.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === value ? 'bg-dark-950 text-white' : 'border border-dark-950/12 bg-white hover:border-dark-950/30'}`}>{label}</button>)}
      </div>
      <p className="text-xs font-semibold text-[#6F6470]">Swipe or use the buttons</p>
    </section>

    {room ? <section className="mt-7" aria-live="polite">
      <div className="relative mx-auto max-w-xl pb-5">
        {nextRoom && <div className="absolute inset-x-4 top-4 h-[430px] rounded-[32px] border border-dark-950/10 bg-white shadow-sm sm:h-[390px]" aria-hidden="true"><div className="h-24 rounded-t-[32px]" style={{ background: roomColors[(deckIndex + 1) % roomColors.length] }} /></div>}
        <article
          className="relative min-h-[430px] touch-pan-y overflow-hidden rounded-[32px] border border-dark-950/10 bg-white p-6 shadow-[0_22px_70px_rgba(40,29,50,0.12)] transition-transform sm:min-h-[390px] sm:p-8"
          style={{ transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`, transition: dragging ? 'none' : 'transform 180ms ease-out' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[100px]" style={{ background: roomColors[deckIndex % roomColors.length] }} />
          <div className="relative flex min-h-[378px] flex-col sm:min-h-[326px]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-dark-950/5 px-3 py-1 text-xs font-bold text-dark-950/65">{room.tone}</span>
              {isLive(room, now) ? <span className="flex items-center gap-1.5 rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-bold text-[#2b6142]"><Radio className="h-3.5 w-3.5 animate-pulse" />Live · {remainingLabel(room, now)}</span> : <span className="flex items-center gap-1.5 text-xs font-semibold text-[#6F6470]"><Clock3 className="h-3.5 w-3.5" />{isStartingSoon(room, now) ? `Starts ${startsLabel(room.starts_at)}` : startsLabel(room.starts_at)}</span>}
            </div>
            {activeRoomCodes.has(room.code) && <span className="mt-5 inline-flex w-fit rounded-full bg-[#3b7d56] px-3 py-1 text-[11px] font-bold text-white"><Check className="mr-1 h-3.5 w-3.5" />You’re already in</span>}
            <div className="mt-auto max-w-lg pt-16">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-spark-coral">{room.experience.replaceAll('-', ' ')}</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-.07em] sm:text-5xl">{room.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#6F6470]">{room.description}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dark-950/8 pt-4 text-xs font-semibold text-[#6F6470]">
              <span className="flex items-center gap-2"><UsersRound className="h-4 w-4" />{room.members_count}/{room.max_members} people</span>
              <span>{room.duration_minutes} min</span>
              {savedCodes.has(room.code) && <span className="text-spark-coral">Saved</span>}
            </div>
          </div>
        </article>
      </div>
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-2 pt-2">
        <button type="button" onClick={() => moveToNext('skip')} className="inline-flex h-12 items-center gap-2 rounded-full border border-dark-950/15 bg-white px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-dark-950/35"><X className="h-4 w-4" />Skip</button>
        <Link href={`/rooms/${room.code}`} className="inline-flex items-center gap-1 text-sm font-bold text-dark-950/60 hover:text-dark-950"><Info className="h-4 w-4" />Details</Link>
        <button type="button" onClick={handlePrimaryAction} className="inline-flex h-12 items-center gap-2 rounded-full bg-spark-coral px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(240,90,120,0.22)] transition hover:-translate-y-0.5 hover:bg-[#dc4b6b]"><Heart className="h-4 w-4" />{activeRoomCodes.has(room.code) ? 'Rejoin' : isLive(room, now) || room.status === 'open' ? 'Join now' : 'I’m interested'}<ArrowRight className="h-4 w-4" /></button>
      </div>
      <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-5 text-[#6F6470]">{isLive(room, now) ? 'Real people are here now.' : 'See the room details, then join when it starts.'} Counts show actual people in the room.</p>
      {notice && <div className="mx-auto mt-4 w-fit rounded-full bg-dark-950 px-4 py-2 text-xs font-bold text-white">{notice}</div>}
    </section> : <section className="mt-7 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-12 text-center"><UsersRound className="mx-auto h-6 w-6 text-spark-coral" /><h2 className="mt-4 text-xl font-bold tracking-[-.04em]">You’ve seen every room here.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">Try another filter or come back when a new room is live.</p><button type="button" onClick={() => setDeckIndex(0)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white">Start over <ArrowRight className="h-4 w-4" /></button></section>}
  </>;
}

