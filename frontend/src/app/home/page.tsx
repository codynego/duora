"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { getAccessToken } from "@/lib/auth";
import { useCurrentUser } from "@/lib/current-user";

type Question = { id: string; text: string; category: string };
type Daily = {
  data: Question | null;
  answer: { body: string } | null;
  completed: boolean;
  next_reset_at: string;
};
type Thought = {
  id: string;
  question: { text: string; category: string };
  body: string;
  reply_count: number;
  relate_count: number;
};
type Summary = {
  counts: {
    thoughts: number;
    saved: number;
    connections: number;
    reactions: number;
    discussions: number;
  };
};
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";

export default function OverviewPage() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();
  const [daily, setDaily] = useState<Daily | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, router, user]);
  useEffect(() => {
    if (!ready || !user) return;
    async function loadOverview() {
      const token = await getAccessToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [dailyResponse, exploreResponse, summaryResponse] =
        await Promise.all([
          fetch(`${api}/api/v1/social/questions/daily/`, { headers }),
          fetch(`${api}/api/v1/social/explore/`, { headers }),
          fetch(`${api}/api/v1/social/me/summary/`, { headers }),
        ]);
      if (dailyResponse.ok) setDaily(await dailyResponse.json());
      if (exploreResponse.ok)
        setThoughts((await exploreResponse.json()).data?.slice(0, 3) ?? []);
      if (summaryResponse.ok) setSummary(await summaryResponse.json());
      setLoading(false);
    }
    void loadOverview();
  }, [ready, user]);

  if (!ready || !user)
    return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;
  const displayName =
    user.anonymous_display_name || user.display_name || "there";
  const counts = summary?.counts;
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="dashboard-kicker">
              <span />
              Your Duora home
            </p>
            <h1 className="dashboard-display mt-4 text-5xl leading-[.92] tracking-[-.07em] sm:text-7xl">
              Good morning, {displayName.split(" ")[0]}
              <span className="text-[#7454A6]">.</span>
            </h1>
            <p className="mt-4 text-base text-[#6E6975]">
              A little closer, every day.
            </p>
            <p className="mt-2 text-xs font-semibold text-[#958F9B]">
              @{user.anonymous_username}
            </p>
          </div>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#292630] text-white"
          >
            <UserRound className="h-4 w-4" />
          </Link>
        </header>
        <section className="mt-10 rounded-[26px] bg-[#7454A6] p-6 text-white shadow-[0_20px_45px_rgba(116,84,166,.18)] sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/70">
              Today’s question
            </p>
            <span className="inline-flex items-center gap-2 text-xs text-white/70">
              <span className="h-2 w-2 rounded-full bg-[#DDE8D2]" />
              Anonymous by default
            </span>
          </div>
          <h2 className="dashboard-display mt-9 max-w-3xl text-4xl leading-[.98] tracking-[-.06em] sm:text-6xl">
            {daily?.data?.text ?? "A thought worth sharing."}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/75">
            {daily?.completed
              ? "You shared today’s thought. There is always more to discover."
              : "Take a quiet moment and share what is on your mind."}
          </p>
          <Link
            href="/discover"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#7454A6]"
          >
            {daily?.completed ? "Read today’s question" : "Answer now"}{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="dashboard-kicker">
                <span />
                Today’s pulse
              </p>
              <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">
                Worth your attention.
              </h2>
            </div>
            <Link
              href="/explore"
              className="hidden items-center gap-2 text-sm font-semibold text-[#7454A6] sm:inline-flex"
            >
              Explore all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="mt-6 h-44 animate-pulse rounded-[22px] bg-[#E9E1F1]" />
          ) : thoughts.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {thoughts.map((thought) => (
                <article
                  key={thought.id}
                  className="rounded-[22px] border border-[#292630]/10 bg-white p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[.13em] text-[#7454A6]">
                    {thought.question.category}
                  </p>
                  <h3 className="mt-5 text-xl font-semibold leading-tight tracking-[-.04em]">
                    {thought.question.text}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#6E6975]">
                    “{thought.body}”
                  </p>
                  <p className="mt-5 text-xs text-[#958F9B]">
                    {thought.reply_count} replies · {thought.relate_count}{" "}
                    relates
                  </p>
                  <Link
                    href={`/explore/${thought.id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]"
                  >
                    Join conversation <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[22px] border border-dashed border-[#292630]/15 bg-white p-8 text-center">
              <MessageCircle className="mx-auto h-5 w-5 text-[#7454A6]" />
              <p className="mt-4 text-sm font-semibold">
                The first conversations are waiting to be started.
              </p>
              <Link
                href="/discover"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]"
              >
                Share a thought <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
        <Link
          href="/explore"
          className="mt-10 flex items-center justify-between gap-5 rounded-[22px] border border-[#292630]/10 bg-white p-5 transition hover:border-[#7454A6] sm:p-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#7454A6]">
              Explore more perspectives
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-.04em]">
              There’s more than one way to see it.
            </h2>
            <p className="mt-2 text-sm text-[#6E6975]">
              Browse the wider anonymous community.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#7454A6]" />
        </Link>
        <section className="mt-10 rounded-[22px] border border-[#292630]/10 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-[#7454A6]" />
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#7454A6]">
              Your activity
            </p>
          </div>
          {counts &&
          (counts.discussions > 0 ||
            counts.connections > 0 ||
            counts.thoughts > 0) ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Activity label="Thoughts shared" value={counts.thoughts} />
              <Activity label="Discussions joined" value={counts.discussions} />
              <Activity label="Connections" value={counts.connections} />
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-[#6E6975]">
              Your replies, connection updates, and daily-question progress will
              appear here as they happen.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function Activity({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#F7F5F0] p-4">
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-[#7454A6]" />
        <span className="text-2xl font-bold tracking-[-.04em]">{value}</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#6E6975]">{label}</p>
    </div>
  );
}
