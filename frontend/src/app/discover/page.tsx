import { UsersRound } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { getDiscoverRooms } from '@/lib/duora-api';
import DiscoverRoomList from './DiscoverRoomList';

export default async function DiscoverPage() {
  const rooms = await getDiscoverRooms();

  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav />
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14">
      <section className="max-w-2xl"><p className="section-label">Discover</p><h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">Meet through something shared.</h1><p className="mt-4 text-base leading-7 text-[#6F6470]">No feeds, no performance. Pick a room, bring your point of view, and let the conversation have a shape.</p></section>
      {rooms.length > 0 ? <DiscoverRoomList rooms={rooms} /> : <section className="mt-7 rounded-[28px] border border-dashed border-dark-950/15 bg-white px-6 py-12 text-center"><UsersRound className="mx-auto h-6 w-6 text-spark-coral" /><h2 className="mt-4 text-xl font-bold tracking-[-.04em]">No rooms are scheduled yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6F6470]">New rooms appear here as soon as they are published. Check back soon.</p></section>}
    </main>
  </div>;
}
