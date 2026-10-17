import Link from 'next/link';
import { ArrowRight, Clock3, Filter, UsersRound } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getDiscoverRooms } from '@/lib/duora-api';

const roomColors = ['#fff0f3', '#fff8dc', '#f2f0fa', '#eef7f1'];

function startsLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Schedule pending';
  return new Intl.DateTimeFormat('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}

export default async function DiscoverPage() {
  const rooms = await getDiscoverRooms();

  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav />
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14">
      <section className="max-w-2xl"><p className="section-label">Discover</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Meet through something shared.</h1><p className="mt-4 text-base leading-7 text-[#6F6470]">No feeds, no performance. Pick a room, bring your point of view, and let the conversation have a shape.</p></section>
      <section className="mt-10 flex flex-col gap-4 border-y border-dark-950/10 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2"><button className="rounded-full bg-dark-950 px-4 py-2 text-sm font-semibold text-white">For you</button><button className="rounded-full border border-dark-950/12 bg-white px-4 py-2 text-sm font-semibold">Starting soon</button><button className="rounded-full border border-dark-950/12 bg-white px-4 py-2 text-sm font-semibold">This evening</button></div><button className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F6470]"><Filter className="h-4 w-4" />Filters</button></section>
      {rooms.length > 0 ? <section className="mt-7 grid gap-4 lg:grid-cols-2">{rooms.map((room, index) => <article key={room.code} className="group relative overflow-hidden rounded-[28px] border border-dark-950/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl sm:p-7"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[70px]" style={{ background: roomColors[index % roomColors.length] }} /><div className="relative"><div className="flex items-center justify-between"><span className="rounded-full bg-dark-950/5 px-2.5 py-1 text-xs font-bold text-dark-950/60">{room.tone}</span><span className="flex items-center gap-1 text-xs text-[#6F6470]"><Clock3 className="h-3.5 w-3.5" />{startsLabel(room.starts_at)}</span></div><h2 className="mt-10 text-2xl font-bold tracking-[-.05em]">{room.title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">{room.description}</p><div className="mt-7 flex items-center justify-between border-t border-dark-950/8 pt-4"><span className="flex items-center gap-2 text-xs font-semibold text-[#6F6470]"><UsersRound className="h-4 w-4" />{room.members_count}/{room.max_members} people · {room.duration_minutes} min</span><Link href={`/rooms/${room.code}`} className="inline-flex items-center gap-1 text-sm font-bold text-spark-coral">View room <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></div></div></article>)}</section> : <section className="mt-7 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-12 text-center"><UsersRound className="mx-auto h-6 w-6 text-spark-coral" /><h2 className="mt-4 text-xl font-bold tracking-[-.04em]">No rooms are scheduled yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">New rooms appear here as soon as they are published. Check back soon.</p></section>}
    </main>
  </div>;
}
