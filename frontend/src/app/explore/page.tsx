"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Check,
  Heart,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import AnonymousAvatar from "@/components/AnonymousAvatar";
import { getAccessToken } from "@/lib/auth";
import { useCurrentUser } from "@/lib/current-user";

type Thought = {
  id: string;
  question: { id: string; text: string; category: string };
  body: string;
  author: {
    anonymous: boolean;
    username: string;
    display_name: string;
    avatar_variant: number;
    label: string;
  };
  reply_count: number;
  relate_count: number;
  viewer_related: boolean;
  viewer_saved: boolean;
  published_at: string | null;
  common_ground: {
    shared_count: number;
    shared_interests: string[];
    percentage: number | null;
    label: string;
  } | null;
};
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
const categories = [
  "All thoughts",
  "Relationships",
  "Friendship",
  "Personal growth",
  "Business & ambition",
  "Deep conversations",
  "Fun & everyday life",
];

export default function ExplorePage() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [category, setCategory] = useState("All thoughts");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [commonGroundThought, setCommonGroundThought] = useState<Thought | null>(null);
  const [feedTab, setFeedTab] = useState<"all" | "mine" | "saved">("all");
  const [myThoughts, setMyThoughts] = useState<Thought[]>([]);
  const [savedThoughts, setSavedThoughts] = useState<Thought[]>([]);
  const [featuredThought, setFeaturedThought] = useState<Thought | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, router, user]);
  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get(
      "category",
    );
    if (requestedCategory && categories.includes(requestedCategory))
      setCategory(requestedCategory);
  }, []);
  useEffect(() => {
    if (!ready || !user) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const [response, savedResponse] = await Promise.all([
          fetch(`${api}/api/v1/social/explore/`, { headers }),
          fetch(`${api}/api/v1/social/explore/?saved=1`, { headers }),
        ]);
        const body = await response.json().catch(() => null);
        const savedBody = await savedResponse.json().catch(() => null);
        if (!response.ok)
          throw new Error(body?.detail ?? "Moments could not be loaded.");
        setThoughts(body?.data ?? []);
        setMyThoughts(body?.my_thoughts ?? []);
        if (savedResponse.ok) setSavedThoughts(savedBody?.data ?? []);
        setFeaturedThought(body?.featured ?? null);
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Moments could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [ready, user]);

  const visibleThoughts = useMemo(
    () =>
      (feedTab === "mine" ? myThoughts : feedTab === "saved" ? savedThoughts : thoughts).filter((thought) => {
        const haystack =
          `${thought.question.text} ${thought.question.category} ${thought.body}`.toLowerCase();
        const matchesQuery =
          !query.trim() || haystack.includes(query.trim().toLowerCase());
        if (category === "All thoughts") return matchesQuery;
        return (
          matchesQuery &&
          thought.question.category.toLowerCase() === category.toLowerCase()
        );
      }),
    [category, feedTab, myThoughts, query, savedThoughts, thoughts],
  );
  const featured = feedTab === "all" ? featuredThought : null;

  async function toggleAction(thoughtId: string, action: "relate" | "save") {
    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const previousThoughts = thoughts;
    const previousFeatured = featuredThought;
    const previousSaved = savedThoughts;
    const update = (thought: Thought) =>
      thought.id !== thoughtId
        ? thought
        : {
            ...thought,
            viewer_related:
              action === "relate" ? !thought.viewer_related : thought.viewer_related,
            relate_count:
              action === "relate"
                ? Math.max(0, thought.relate_count + (thought.viewer_related ? -1 : 1))
                : thought.relate_count,
            viewer_saved:
              action === "save" ? !thought.viewer_saved : thought.viewer_saved,
          };
    setThoughts((current) => current.map(update));
    setFeaturedThought((current) => (current ? update(current) : current));
    if (action === "save") {
      const source = thoughts.find((thought) => thought.id === thoughtId);
      setSavedThoughts((current) => {
        if (!source) return current;
        if (source.viewer_saved)
          return current.filter((thought) => thought.id !== thoughtId);
        return current.some((thought) => thought.id === thoughtId)
          ? current.map(update)
          : [...current, update(source)];
      });
    }
    const response = await fetch(
      `${api}/api/v1/social/thoughts/${thoughtId}/${action}/`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      setThoughts(previousThoughts);
      setFeaturedThought(previousFeatured);
      setSavedThoughts(previousSaved);
      return;
    }
    const body = await response.json();
    const confirm = (thought: Thought) =>
      thought.id !== thoughtId
        ? thought
        : {
            ...thought,
            viewer_related:
              action === "relate" ? Boolean(body.related) : thought.viewer_related,
            relate_count:
              action === "relate" && typeof body.relate_count === "number"
                ? body.relate_count
                : thought.relate_count,
            viewer_saved:
              action === "save" ? Boolean(body.saved) : thought.viewer_saved,
          };
    setThoughts((current) => current.map(confirm));
    setFeaturedThought((current) => (current ? confirm(current) : current));
    if (action === "save") {
      const saved = Boolean(body.saved);
      setSavedThoughts((current) => {
        if (!saved) return current.filter((thought) => thought.id !== thoughtId);
        const source = thoughts.find((thought) => thought.id === thoughtId);
        if (!source) return current;
        return current.some((thought) => thought.id === thoughtId)
          ? current.map(confirm)
          : [...current, confirm(source)];
      });
    }
  }

  async function requestConnection(thoughtId: string) {
    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const response = await fetch(
      `${api}/api/v1/social/thoughts/${thoughtId}/connect/`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) setRequestSent(true);
  }

  if (!ready || !user)
    return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <header className="flex items-end justify-between gap-5">
          <div>
            <p className="dashboard-kicker">
              <span />
              The heart of Dorah
            </p>
            <h1 className="dashboard-display mt-4 text-5xl leading-[.92] tracking-[-.07em] sm:text-7xl">
              Moments<span className="text-[#7454A6]">.</span>
            </h1>
            <p className="mt-4 text-base text-[#6E6975]">
              There’s more to everyone.
            </p>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-[#E9E1F1] px-4 py-2 text-xs font-semibold text-[#5D487A] sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Picked for you
          </span>
        </header>
        <div className="relative mt-8">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#918A98]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Moments..."
            aria-label="Search Moments"
            className="duora-form-input h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-sm outline-none"
          />
        </div>
        <div
          className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Moment categories"
        >
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              role="tab"
              aria-selected={category === item}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-[#7454A6] text-white shadow-[0_8px_18px_rgba(116,84,166,.2)]" : "border border-[#292630]/12 bg-white text-[#6E6975] hover:border-[#7454A6]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-5 flex w-fit rounded-xl bg-[#292630]/[.06] p-1" role="tablist" aria-label="Moments feed">
          <button type="button" onClick={() => setFeedTab("all")} aria-selected={feedTab === "all"} className={`rounded-lg px-4 py-2 text-xs font-semibold ${feedTab === "all" ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975]"}`}>All thoughts</button>
          <button type="button" onClick={() => setFeedTab("mine")} aria-selected={feedTab === "mine"} className={`rounded-lg px-4 py-2 text-xs font-semibold ${feedTab === "mine" ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975]"}`}>My thoughts</button>
          <button type="button" onClick={() => setFeedTab("saved")} aria-selected={feedTab === "saved"} className={`rounded-lg px-4 py-2 text-xs font-semibold ${feedTab === "saved" ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975]"}`}>Saved</button>
        </div>
        {requestSent && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#DDE8D2] p-4 text-sm font-semibold text-[#496436]">
            <Check className="h-5 w-5" />
            Your connection request has been sent.{" "}
            <Link
              href="/connections"
              className="ml-auto text-[#4F713D] underline"
            >
              View Connections
            </Link>
          </div>
        )}
        {error && (
          <div className="mt-5 rounded-2xl bg-[#F8E1E7] p-4 text-sm text-[#9A3650]">
            {error}
          </div>
        )}
        {loading ? (
          <div className="mt-8 h-80 animate-pulse rounded-[24px] bg-[#E9E1F1]" />
        ) : feedTab !== "all" ? (
          <ThoughtGrid thoughts={visibleThoughts} onToggle={toggleAction} onConnect={requestConnection} onCommonGround={setCommonGroundThought} title={feedTab === "saved" ? "Saved moments" : "Your moments"} emptyTitle={feedTab === "saved" ? "Nothing saved yet." : "You haven’t shared a thought yet."} emptyDetail={feedTab === "saved" ? "Save interesting thoughts from Moments and they will appear here." : "Answer a question on Discover and it will appear here."} />
        ) : featured ? (
          <>
            <section className="mt-8 rounded-[24px] bg-[#7454A6] p-6 text-white shadow-[0_18px_42px_rgba(116,84,166,.2)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em]">
                  {featured.reply_count > 0
                    ? "Live conversation"
                    : "New thought"}
                </span>
                <span className="text-xs text-white/65">
                  {featured.reply_count > 0
                    ? `${featured.reply_count} ${featured.reply_count === 1 ? "reply" : "replies"}`
                    : "Be the first to reply"}
                  {featured.relate_count > 0 && ` · ${featured.relate_count} relates`}
                </span>
              </div>
              <Link href={`/moments/${featured.id}`} className="group block">
                <h2 className="dashboard-display mt-10 max-w-3xl text-4xl leading-[.98] tracking-[-.055em] sm:text-5xl">
                  {featured.question.text}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
                  “{featured.body}”
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-white/80">
                  <AnonymousAvatar
                    variant={featured.author.avatar_variant}
                    size="sm"
                    className="bg-white/15 text-white"
                  />
                  <span className="font-semibold text-white">
                    @{featured.author.username}
                  </span>
                </div>
              </Link>
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
                <button
                  type="button"
                  onClick={() => void toggleAction(featured.id, "relate")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${featured.viewer_related ? "bg-white text-[#7454A6]" : "bg-white/12 text-white hover:bg-white/20"}`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={featured.viewer_related ? "currentColor" : "none"}
                  />
                  I relate{" "}
                  <span className="text-xs opacity-60">
                    {featured.relate_count}
                  </span>
                </button>
                <Link
                  href={`/moments/${featured.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#7454A6]"
                >
                  Join the discussion <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => void toggleAction(featured.id, "save")}
                  aria-label={
                    featured.viewer_saved
                      ? "Remove saved thought"
                      : "Save thought"
                  }
                  className={`ml-auto rounded-full p-2.5 ${featured.viewer_saved ? "bg-white text-[#7454A6]" : "bg-white/12 text-white hover:bg-white/20"}`}
                >
                  <Bookmark
                    className="h-4 w-4"
                    fill={featured.viewer_saved ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </section>
            <section className="mt-12">
              <div className="flex items-end justify-between">
                <div>
                  <p className="dashboard-kicker">
                    <span />
                    More to discover
                  </p>
                  <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">
                    Find a thought that stays with you.
                  </h2>
                </div>
                <span className="hidden text-xs text-[#958F9B] sm:block">
                  {visibleThoughts.length} thoughts
                </span>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {visibleThoughts
                  .filter((thought) => thought.id !== featured.id)
                  .map((thought) => (
                    <ThoughtCard
                      key={thought.id}
                      thought={thought}
                      onToggle={toggleAction}
                onConnect={requestConnection}
                onCommonGround={setCommonGroundThought}
                    />
                  ))}
              </div>
            </section>
          </>
        ) : visibleThoughts.length ? (
          <ThoughtGrid thoughts={visibleThoughts} onToggle={toggleAction} onConnect={requestConnection} onCommonGround={setCommonGroundThought} title="More to discover" emptyTitle="" emptyDetail="" />
        ) : (
          <section className="mt-8 rounded-[24px] border border-dashed border-[#292630]/15 bg-white p-10 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-[#7454A6]" />
            <h2 className="dashboard-display mt-5 text-3xl">
              No thoughts here yet.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6E6975]">
              Start with the daily question, then come back to see what other
              people share.
            </p>
            <Link
              href="/home"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#292630] px-5 py-3 text-sm font-semibold text-white"
            >
              Share a moment <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </main>
      {commonGroundThought && (
        <CommonGroundSheet
          thought={commonGroundThought}
          onClose={() => setCommonGroundThought(null)}
          onConnect={requestConnection}
        />
      )}
    </div>
  );
}

function ThoughtGrid({
  thoughts,
  onToggle,
  onConnect,
  onCommonGround,
  title,
  emptyTitle,
  emptyDetail,
}: {
  thoughts: Thought[];
  onToggle: (id: string, action: "relate" | "save") => void;
  onConnect: (id: string) => void;
  onCommonGround: (thought: Thought) => void;
  title: string;
  emptyTitle: string;
  emptyDetail: string;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="dashboard-kicker"><span />{title}</p>
          <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">{emptyTitle || "Find a thought that stays with you."}</h2>
        </div>
        <span className="hidden text-xs text-[#958F9B] sm:block">{thoughts.length} thoughts</span>
      </div>
      {thoughts.length ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {thoughts.map((thought) => <ThoughtCard key={thought.id} thought={thought} onToggle={onToggle} onConnect={onConnect} onCommonGround={onCommonGround} />)}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-[#292630]/15 bg-white p-6 text-sm leading-6 text-[#6E6975]">{emptyDetail}</p>
      )}
    </section>
  );
}

function ThoughtCard({
  thought,
  onToggle,
  onConnect,
  onCommonGround,
}: {
  thought: Thought;
  onToggle: (id: string, action: "relate" | "save") => void;
  onConnect: (id: string) => void;
  onCommonGround: (thought: Thought) => void;
}) {
  return (
    <article className="rounded-[22px] border border-[#292630]/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(41,38,48,.08)] sm:p-6">
      <Link href={`/moments/${thought.id}`} className="block">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em] text-[#7454A6]">
          <span>
            {thought.reply_count > 0 ? "Discussion" : "Anonymous thought"}
          </span>
          <span>{thought.question.category}</span>
        </div>
        <h3 className="dashboard-display mt-7 text-2xl leading-[1.02] tracking-[-.045em]">
          {thought.question.text}
        </h3>
        <p className="mt-4 text-sm leading-6 text-[#5F5967]">
          “{thought.body}”
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#958F9B]">
          <AnonymousAvatar variant={thought.author.avatar_variant} size="sm" />
          <span className="font-semibold text-[#5F5967]">
            @{thought.author.username}
          </span>
          {thought.common_ground && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onCommonGround(thought);
              }}
              title={`You both selected: ${thought.common_ground.shared_interests.join(", ")}`}
              className="rounded-full bg-[#E9E1F1] px-2.5 py-1 font-semibold text-[#7454A6]"
            >
              {thought.common_ground.label}
            </button>
          )}
        </div>
      </Link>
      <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-[#958F9B]">
        <span>
          {thought.reply_count > 0
            ? `${thought.reply_count} ${thought.reply_count === 1 ? "reply" : "replies"}`
            : "Be the first to reply"}
        </span>
        <span>{thought.relate_count} relates</span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#292630]/10 pt-4">
        <button
          type="button"
          onClick={() => onToggle(thought.id, "relate")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${thought.viewer_related ? "bg-[#F1EAF6] text-[#7454A6]" : "bg-[#F7F5F0] text-[#6E6975]"}`}
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={thought.viewer_related ? "currentColor" : "none"}
          />
          I relate
        </button>
        <Link
          href={`/moments/${thought.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F5F0] px-3 py-2 text-xs font-semibold text-[#6E6975]"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Reply
        </Link>
        <Link
          href={`/moments/${thought.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#292630] px-3 py-2 text-xs font-semibold text-white"
        >
          Join <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => onToggle(thought.id, "save")}
          aria-label={
            thought.viewer_saved ? "Remove saved thought" : "Save thought"
          }
          className={`ml-auto rounded-full p-2 ${thought.viewer_saved ? "text-[#7454A6]" : "text-[#958F9B]"}`}
        >
          <Bookmark
            className="h-4 w-4"
            fill={thought.viewer_saved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </article>
  );
}

function CommonGroundSheet({
  thought,
  onClose,
  onConnect,
}: {
  thought: Thought;
  onClose: () => void;
  onConnect: (id: string) => void;
}) {
  const common = thought.common_ground;
  if (!common) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#292630]/35 p-3 sm:items-center">
      <button type="button" aria-label="Close common ground" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(41,38,48,.24)] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="common-ground-title">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="dashboard-kicker"><span />Your common ground</p>
            <h2 id="common-ground-title" className="dashboard-display mt-3 text-3xl tracking-[-.06em]">You and {thought.author.display_name} have things in common.</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-[#F7F5F0] px-3 py-2 text-xs font-semibold text-[#6E6975]">Close</button>
        </div>
        <p className="mt-6 text-sm font-semibold text-[#7454A6]">{common.shared_count} shared {common.shared_count === 1 ? "interest" : "interests"}</p>
        {common.shared_count ? (
          <div className="mt-4 space-y-3">
            {common.shared_interests.map((interest) => (
              <div key={interest} className="rounded-2xl bg-[#F7F5F0] p-4">
                <p className="font-semibold">{interest}</p>
                <p className="mt-1 text-sm leading-6 text-[#6E6975]">You both selected {interest.toLowerCase()} as an interest.</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#F7F5F0] p-4 text-sm leading-6 text-[#6E6975]">Still discovering.</p>
        )}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full border border-[#292630]/10 px-5 py-3 text-sm font-semibold text-[#6E6975]">Keep exploring</button>
          <button type="button" onClick={() => { onConnect(thought.id); onClose(); }} className="rounded-full bg-[#292630] px-5 py-3 text-sm font-semibold text-white">Connect</button>
        </div>
      </section>
    </div>
  );
}
