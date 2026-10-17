'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Clock3, HeartHandshake, LockKeyhole, Sparkles, UsersRound } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getAccessToken } from '@/lib/auth';
import { useCurrentUser } from '@/lib/current-user';

type Room = { id: string; code: string; title: string; description: string; tone: string; max_members: number; members_count: number; duration_minutes: number; starts_at: string; is_discovery_room: boolean };
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

function timeLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Schedule pending' : new Intl.DateTimeFormat('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function Home() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [roomsReady, setRoomsReady] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    async function load() {
      try {
        const publicResponse = await fetch(`${api}/api/v1/rooms/`, { headers: { Accept: 'application/json' } });
        if (publicResponse.ok) setRooms(await publicResponse.json());
        const token = await getAccessToken();
        if (token) {
          const mineResponse = await fetch(`${api}/api/v1/rooms/mine/`, { headers: { Authorization: `Bearer ${token}` } });
          const body = await mineResponse.json();
          if (mineResponse.ok && Array.isArray(body.data)) setMyRooms(body.data);
        }
      } finally { setRoomsReady(true); }
    }
    void load();
  }, [ready, user]);

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, router, user]);

  if (!ready || !user) return <div className="min-h-screen bg-[#fffdfc]" aria-busy="true" />;

  const greeting = `Good evening, ${user.display_name}.`;
  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav />
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14">
      <section className="grid items-end gap-5 md:grid-cols-[1fr_auto]"><div><p className="section-label">Home</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">{greeting}</h1><p className="mt-3 max-w-xl text-base leading-7 text-[#6F6470]">Choose a shared experience, find a small room, or pick up where you left off.</p></div><Link href="/onboarding" className="inline-flex items-center gap-2 text-sm font-semibold text-spark-coral hover:text-[#d94767]">Refine your preferences <ArrowRight className="h-4 w-4" /></Link></section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <Link href="/experiences/create" className="group rounded-[28px] bg-dark-950 p-7 text-white transition hover:-translate-y-1 hover:shadow-xl sm:p-9"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><HeartHandshake className="h-5 w-5 text-spark-rose" /></span><ArrowRight className="h-5 w-5 text-spark-rose transition group-hover:translate-x-1" /></div><p className="mt-12 text-sm font-semibold text-spark-rose">WITH SOMEONE YOU KNOW</p><h2 className="mt-2 text-3xl font-bold tracking-[-.055em]">Invite someone in.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#d7cfda]">Choose a shared experience, then send one private link to a friend, date, partner, or someone you want to know better.</p><span className="mt-7 inline-flex rounded-full bg-spark-coral px-4 py-2.5 text-sm font-semibold">Choose an experience</span></Link>
        <Link href="/discover" className="group rounded-[28px] border border-[#281D32]/10 bg-[#FFF7F2] p-7 transition hover:-translate-y-1 hover:shadow-xl sm:p-9"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white"><UsersRound className="h-5 w-5 text-spark-coral" /></span><ArrowRight className="h-5 w-5 text-spark-coral transition group-hover:translate-x-1" /></div><p className="mt-12 text-sm font-semibold text-spark-coral">MEET THROUGH SOMETHING SHARED</p><h2 className="mt-2 text-3xl font-bold tracking-[-.055em]">Find a room.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#6F6470]">Browse a small, guided experience. You decide whether it feels right before joining.</p><span className="mt-7 inline-flex rounded-full border border-[#281D32]/15 bg-white px-4 py-2.5 text-sm font-semibold">Browse rooms</span></Link>
      </section>

      {user && <section className="mt-16"><div className="flex items-end justify-between gap-4"><div><p className="section-label">Your rooms</p><h2 className="mt-3 text-3xl font-bold tracking-[-.055em]">Continue something you started.</h2></div><Link href="/experiences" className="text-sm font-semibold text-spark-coral">All experiences</Link></div>{myRooms.length ? <RoomList rooms={myRooms.slice(0, 3)} mine /> : <div className="mt-6 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-8"><p className="font-bold">You have not created a room yet.</p><p className="mt-2 text-sm text-[#6F6470]">Start with a private invitation or publish a small room for others to discover.</p></div>}</section>}

      <section className="mt-16"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-label">Discover rooms</p><h2 className="mt-3 text-3xl font-bold tracking-[-.055em]">A good place to begin.</h2><p className="mt-2 text-sm text-[#6F6470]">Live rooms and scheduled experiences from the Duora community.</p></div><Link href="/discover" className="text-sm font-semibold text-spark-coral">See all rooms</Link></div>{!roomsReady ? <div className="mt-7 h-48 animate-pulse rounded-[28px] bg-dark-950/5" /> : rooms.length ? <RoomList rooms={rooms.slice(0, 3)} /> : <div className="mt-7 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-10 text-center"><UsersRound className="mx-auto h-6 w-6 text-spark-coral" /><p className="mt-3 font-bold">No public rooms are open right now.</p><p className="mt-2 text-sm text-[#6F6470]">Create one for a future time, or check back when the next experience is scheduled.</p></div>}</section>

      <section className="mt-16 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-[28px] border border-[#281D32]/10 bg-white p-7 sm:p-9"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F3]"><Sparkles className="h-4 w-4 text-spark-coral" /></span><div><p className="text-sm font-semibold">Start with a shape</p><p className="text-xs text-[#6F6470]">Pick a format before you pick the people.</p></div></div><h2 className="mt-9 max-w-lg text-3xl font-bold tracking-[-.055em]">You do not need a perfect opening line.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#6F6470]">A prompt, game, or shared plan gives everyone something real to respond to.</p><Link href={user ? '/experiences/create' : '/signup'} className="mt-7 inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-semibold text-white">Choose an experience <ArrowRight className="h-4 w-4" /></Link></div><aside className="rounded-[28px] bg-[#F7B8C7] p-7"><CalendarDays className="h-5 w-5 text-[#7a2640]" /><p className="mt-8 text-sm font-semibold text-[#7a2640]">PRIVATE BY DEFAULT</p><h3 className="mt-2 text-2xl font-bold tracking-[-.05em] text-dark-950">You set the pace.</h3><p className="mt-3 text-sm leading-6 text-[#704457]">Invite one person, host a room, or simply look around. There is no feed and no pressure to perform.</p></aside></section>
      <p className="mt-10 flex items-center gap-2 text-xs text-[#6F6470]"><LockKeyhole className="h-3.5 w-3.5" />Your choices and room preferences are private. You decide who can continue a conversation.</p>
    </main>
  </div>;
}

function RoomList({ rooms, mine = false }: { rooms: Room[]; mine?: boolean }) {
  return <div className="mt-7 grid gap-4 lg:grid-cols-3">{rooms.map((room) => <article key={room.id} className="rounded-3xl border border-[#281D32]/10 bg-white p-5 soft-shadow"><div className="flex items-center justify-between"><span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-xs font-bold text-spark-coral">{room.tone}</span><span className="flex items-center gap-1 text-xs text-[#6F6470]"><Clock3 className="h-3.5 w-3.5" />{timeLabel(room.starts_at)}</span></div><h3 className="mt-7 text-xl font-bold tracking-[-.04em]">{room.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6F6470]">{room.description}</p><div className="mt-6 flex items-center justify-between border-t border-[#281D32]/8 pt-4"><span className="text-xs font-medium text-[#6F6470]">{room.members_count}/{room.max_members} people · {room.duration_minutes} min</span><Link href={mine && !room.is_discovery_room ? `/rooms/private/${room.id}` : `/rooms/${room.code}`} className="rounded-full bg-[#FFF0F3] px-3 py-1.5 text-xs font-semibold text-spark-coral">View room</Link></div></article>)}</div>;
}
