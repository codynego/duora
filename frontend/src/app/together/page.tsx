'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarHeart,
  Trophy,
  Heart,
  ArrowRight,
  Lock,
  Sparkles,
  UsersRound,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import AppNav from '@/components/AppNav';

const TOGETHER_ACTIVITIES = [
  {
    key: 'plan-something-together',
    title: 'Plan a Date',
    subtitle: 'Find something you’ll both enjoy.',
    detail: 'Compare budget, mood, and availability privately. Dorah highlights your overlap and locks in a date plan.',
    tag: 'LAUNCH FIRST',
    meta: '2 people · 10 min · Invite only',
    icon: CalendarHeart,
    color: '#FFF0F3',
    textColor: 'text-dark-950',
    accentColor: '#7454A6',
  },
  {
    key: 'shared-challenges',
    title: 'Try a Challenge',
    subtitle: 'Do something new together.',
    detail: 'A shared mini-goal checklist for you and your person. Complete tasks, track progress, and celebrate together.',
    tag: 'SHARED PROGRESS',
    meta: '2 people · 15 min · Invite only',
    icon: Trophy,
    color: '#F4FAF6',
    textColor: 'text-dark-950',
    accentColor: '#3b7d56',
  },
  {
    key: 'date-night-anywhere',
    title: 'Date Night Anywhere',
    subtitle: 'Share an experience from anywhere.',
    detail: 'A 3-part guided journey: a playful warm-up game, an honest conversation prompt, and a shared memory to keep.',
    tag: 'GUIDED DATE',
    meta: '2 people · 20 min · Invite only',
    icon: Heart,
    color: '#281D32',
    textColor: 'text-white',
    accentColor: '#C9B9E2',
  },
];

export default function TogetherPage() {
  return (
    <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]">
      <AppNav />

      <main className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14">
        {/* Editorial Header */}
        <section className="grid gap-7 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-bold tracking-wider text-spark-coral">
                <Lock className="h-3 w-3" />
                INVITE ONLY · 2 PEOPLE
              </span>
            </div>
            <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-[-.06em] sm:text-5xl">
              Together.
            </h1>
            <p className="mt-2 text-xl font-medium tracking-tight text-[#6F6470] sm:text-2xl">
              Make time together more meaningful.
            </p>
          </div>

          <p className="max-w-md text-base leading-7 text-[#6F6470]">
            Shared activities designed strictly for two people. Decide what to do, do it together, and keep track of what you’ve shared. No strangers, no public feeds.
          </p>
        </section>

        {/* Hero Invitation Callout */}
        <section className="mt-9 overflow-hidden rounded-[30px] bg-dark-950 p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold tracking-[.14em] text-spark-rose">
              JUST FOR THE TWO OF YOU
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.05em] sm:text-3xl">
              What would you like to do together?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Choose an activity, generate a private link, invite your person, and make it happen.
            </p>
          </div>

          <Link
            href="/experiences/create?category=together"
            className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-spark-coral px-6 py-3.5 text-sm font-bold text-white transition hover:bg-spark-flame sm:mt-0"
          >
            <Plus className="h-4 w-4" />
            Start an activity
          </Link>
        </section>

        {/* The 3 Together Experiences */}
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.14em] text-spark-coral uppercase">
                Curated formats
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.05em] sm:text-3xl">
                Choose an experience to start
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6F6470]">
                Every room is invite-only and designed specifically for two people.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOGETHER_ACTIVITIES.map((act) => {
              const Icon = act.icon;
              const isDark = act.textColor === 'text-white';
              return (
                <article
                  key={act.key}
                  className={`flex flex-col justify-between rounded-[28px] p-7 transition hover:scale-[1.01] ${act.textColor} shadow-[0_12px_40px_rgba(40,29,50,.05)]`}
                  style={{ background: act.color }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-2xl ${
                          isDark ? 'bg-white/10' : 'bg-white/80 shadow-xs'
                        }`}
                      >
                        <Icon className="h-5 w-5" style={{ color: act.accentColor }} />
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isDark ? 'text-white/60' : 'text-dark-950/60'
                        }`}
                      >
                        {act.tag}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold tracking-tight">
                      {act.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        isDark ? 'text-spark-rose' : 'text-spark-coral'
                      }`}
                    >
                      {act.subtitle}
                    </p>
                    <p
                      className={`mt-3 text-xs leading-relaxed ${
                        isDark ? 'text-white/70' : 'text-[#6F6470]'
                      }`}
                    >
                      {act.detail}
                    </p>
                  </div>

                  <div
                    className={`mt-8 flex items-center justify-between border-t pt-4 ${
                      isDark ? 'border-white/12' : 'border-dark-950/8'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${
                        isDark ? 'text-white/60' : 'text-[#6F6470]'
                      }`}
                    >
                      <UsersRound className="h-3.5 w-3.5" />
                      {act.meta}
                    </span>

                    <Link
                      href={`/experiences/create?category=together&experience=${act.key}`}
                      className={`inline-flex items-center gap-1 text-xs font-bold transition hover:translate-x-1 ${
                        isDark ? 'text-spark-rose' : 'text-spark-coral'
                      }`}
                    >
                      <span>Invite</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Safeguard & Privacy Note */}
        <section className="mt-14 rounded-2xl border border-dark-950/8 bg-[#fffaf8] p-5 text-center text-xs text-[#6F6470]">
          <p className="flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-spark-coral" />
            Together activities never match you with strangers. Links are end-to-end private between you and the person you invite.
          </p>
        </section>
      </main>
    </div>
  );
}
