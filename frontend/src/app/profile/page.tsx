import Link from 'next/link';
import { ChevronRight, HeartHandshake, MapPin, Pencil, ShieldCheck } from 'lucide-react';
import AppNav from '@/components/AppNav';

const settings = [
  ['Connection preferences', 'Who and what kind of rooms feel right for you'],
  ['Availability', 'When you are open to joining a room'],
  ['Privacy and safety', 'Room visibility, sharing, and account controls'],
];

export default function ProfilePage() {
  return <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]"><AppNav />
    <main className="mx-auto max-w-5xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14"><p className="section-label">Your space</p><section className="mt-4 overflow-hidden rounded-[30px] bg-dark-950 p-7 text-white sm:p-9"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start"><div className="flex items-center gap-5"><span className="grid h-16 w-16 place-items-center rounded-full bg-spark-coral text-xl font-bold">A</span><div><h1 className="text-3xl font-bold tracking-[-.055em]">Ada Okafor</h1><p className="mt-1 flex items-center gap-1.5 text-sm text-white/60"><MapPin className="h-3.5 w-3.5" />Lagos, Nigeria</p></div></div><button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold"><Pencil className="h-4 w-4" />Edit profile</button></div><p className="mt-12 max-w-lg text-lg leading-7 text-white/82">Here for people who make ordinary time feel a little more interesting.</p><div className="mt-8 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Thoughtful conversation</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">New experiences</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Evenings</span></div></section>
      <section className="mt-10 grid gap-5 md:grid-cols-2"><div className="rounded-[26px] border border-dark-950/10 bg-white p-6"><HeartHandshake className="h-5 w-5 text-spark-coral" /><p className="mt-7 text-sm font-bold">Your Duora, your pace.</p><p className="mt-2 text-sm leading-6 text-[#6F6470]">Connection preferences guide your recommendations. They are never shown as a public profile.</p><Link href="/onboarding" className="mt-6 inline-flex text-sm font-bold text-spark-coral">Review preferences →</Link></div><div className="rounded-[26px] bg-[#fff6f2] p-6"><ShieldCheck className="h-5 w-5 text-spark-coral" /><p className="mt-7 text-sm font-bold">Designed to be mutual.</p><p className="mt-2 text-sm leading-6 text-[#6F6470]">You decide whether a room ends, reconnects later, or becomes a private conversation.</p></div></section>
      <section className="mt-10 rounded-[26px] border border-dark-950/10 bg-white px-5 sm:px-7">{settings.map(([title, description], index) => <Link href={index === 0 ? '/onboarding' : '#'} key={title} className={`flex items-center justify-between gap-4 py-5 ${index < settings.length - 1 ? 'border-b border-dark-950/8' : ''}`}><span><span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-sm text-[#6F6470]">{description}</span></span><ChevronRight className="h-5 w-5 shrink-0 text-dark-950/35" /></Link>)}</section>
    </main>
  </div>;
}
