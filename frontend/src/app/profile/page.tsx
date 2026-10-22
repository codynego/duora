"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Check,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import AnonymousAvatar from "@/components/AnonymousAvatar";
import { getAccessToken } from "@/lib/auth";
import { useCurrentUser } from "@/lib/current-user";

type DiscoveryProfile = {
  city: string;
  gender: string;
  intents: string[];
  interests: string[];
  languages: string[];
  is_discoverable: boolean;
};
type Thought = {
  id: string;
  question: { id: string; text: string; category: string };
  body: string;
  published_at: string | null;
  created_at: string;
};
type Summary = {
  counts: {
    thoughts: number;
    saved: number;
    connections: number;
    reactions: number;
    discussions: number;
  };
  answers: Thought[];
  saved: Thought[];
  reactions: Thought[];
  discussions: { id: string; body: string; created_at: string }[];
};
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
const interestOptions = [
  "Relationships",
  "Friendship",
  "Business & ambition",
  "Personal growth",
  "Deep conversations",
  "Fun & everyday life",
];

export default function ProfilePage() {
  const { user, ready, setUser } = useCurrentUser();
  const router = useRouter();
  const [profile, setProfile] = useState<DiscoveryProfile | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [tab, setTab] = useState<
    "answers" | "discussions" | "saved" | "reactions"
  >("answers");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const [changingAvatar, setChangingAvatar] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, router, user]);
  useEffect(() => {
    if (!ready || !user) return;
    async function load() {
      const token = await getAccessToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [profileResponse, summaryResponse] = await Promise.all([
          fetch(`${api}/api/v1/discovery/me/`, { headers }),
          fetch(`${api}/api/v1/social/me/summary/`, { headers }),
        ]);
        if (profileResponse.ok) {
          const body = (await profileResponse.json()) as DiscoveryProfile;
          setProfile(body);
          setInterests(body.interests ?? []);
          setCity(body.city ?? "");
          setGender(body.gender ?? "");
        }
        if (summaryResponse.ok) setSummary(await summaryResponse.json());
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Your profile could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }
    setName(user.display_name ?? "");
    void load();
  }, [ready, user]);

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function save() {
    const token = await getAccessToken();
    if (!token || !user) return;
    setSaving(true);
    setError("");
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const accountResponse = await fetch(`${api}/api/v1/auth/me/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ display_name: name.trim() }),
      });
      if (!accountResponse.ok)
        throw new Error("Your display name could not be saved.");
      const discoveryResponse = await fetch(`${api}/api/v1/discovery/me/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ city, gender, interests }),
      });
      if (!discoveryResponse.ok)
        throw new Error("Your profile details could not be saved.");
      setUser((await accountResponse.json()).data);
      setProfile(await discoveryResponse.json());
      setEditing(false);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2800);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your profile could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteThought(id: string) {
    if (!window.confirm("Delete this thought? This cannot be undone.")) return;
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(`${api}/api/v1/social/thoughts/${id}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      setError("That thought could not be deleted.");
      return;
    }
    setSummary((current) => current ? {
      ...current,
      counts: { ...current.counts, thoughts: Math.max(0, current.counts.thoughts - 1) },
      answers: current.answers.filter((item) => item.id !== id),
    } : current);
  }

  async function changeAvatar() {
    const token = await getAccessToken();
    if (!token) return;
    setChangingAvatar(true);
    try {
      const response = await fetch(`${api}/api/v1/auth/me/avatar/regenerate/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const body = await response.json();
        setUser((current) =>
          current
            ? { ...current, anonymous_avatar_variant: body.data.avatar_variant }
            : current,
        );
      }
    } finally {
      setChangingAvatar(false);
    }
  }

  if (!ready || !user)
    return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;
  if (loading)
    return (
      <div className="min-h-screen bg-[#F7F5F0] md:pl-[232px]">
        <AppNav />
        <main className="mx-auto max-w-5xl px-5 pt-12 sm:px-8">
          <div className="h-72 animate-pulse rounded-[26px] bg-[#E9E1F1]" />
        </main>
      </div>
    );
  const counts = summary?.counts ?? {
    thoughts: 0,
    saved: 0,
    connections: 0,
    reactions: 0,
    discussions: 0,
  };
  const currentItems =
    tab === "answers"
      ? (summary?.answers ?? [])
      : tab === "saved"
        ? (summary?.saved ?? [])
        : tab === "reactions"
          ? (summary?.reactions ?? [])
          : [];
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="dashboard-kicker">
              <span />
              Your space, by choice
            </p>
            <h1 className="dashboard-display mt-4 text-5xl leading-[.92] tracking-[-.07em] sm:text-7xl">
              My Profile<span className="text-[#7454A6]">.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6E6975]">
              A little about what interests you.
            </p>
          </div>
          <Link
            href="/profile/settings"
            aria-label="Profile settings"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#292630]/10 bg-white text-[#6E6975] transition hover:border-[#7454A6] hover:text-[#7454A6]"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <section className="mt-10 rounded-[26px] border border-[#292630]/10 bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-center gap-4">
              <AnonymousAvatar
                variant={user.anonymous_avatar_variant}
                size="lg"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#958F9B]">
                  Your Duorah identity
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-.045em]">
                  {user.display_name || "Your name"}
                </h2>
                <p className="mt-1 text-sm text-[#6E6975]">
                  @{user.anonymous_username} · Anonymous participation stays
                  separate.
                </p>
                <button
                  type="button"
                  onClick={() => void changeAvatar()}
                  disabled={changingAvatar}
                  className="mt-3 text-xs font-semibold text-[#7454A6] disabled:opacity-50"
                >
                  {changingAvatar ? "Changing avatar…" : "Change avatar"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#292630] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Pencil className="h-4 w-4" />
              {editing ? "Cancel" : "Edit profile"}
            </button>
          </div>
          {editing ? (
            <div className="mt-8 border-t border-[#292630]/10 pt-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Display name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={150}
                    className="duora-form-input mt-2 w-full rounded-xl bg-[#F7F5F0] px-4 py-3 text-sm outline-none"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Broad location{" "}
                  <span className="font-normal text-[#958F9B]">optional</span>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    maxLength={100}
                    placeholder="City or region"
                    className="duora-form-input mt-2 w-full rounded-xl bg-[#F7F5F0] px-4 py-3 text-sm outline-none"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Gender{" "}
                  <span className="font-normal text-[#958F9B]">optional</span>
                  <select
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    className="duora-form-input mt-2 w-full rounded-xl bg-[#F7F5F0] px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Not specified</option>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <span className="mt-2 block text-xs font-normal leading-5 text-[#958F9B]">
                    Optional. Your gender is private unless you choose to share it.
                  </span>
                </label>
              </div>
              <p className="mt-7 text-sm font-semibold">Your interests</p>
              <p className="mt-1 text-sm text-[#6E6975]">
                Choose what you’d like to explore. You can change this anytime.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {interestOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${interests.includes(item) ? "bg-[#7454A6] text-white" : "bg-[#F7F5F0] text-[#6E6975] hover:bg-[#E9E1F1]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={saving || !name.trim()}
                  onClick={() => void save()}
                  className="rounded-full bg-[#7454A6] px-5 py-3 text-sm font-semibold text-white disabled:opacity-45"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full px-4 py-3 text-sm font-semibold text-[#6E6975]"
                >
                  Cancel
                </button>
                {error && (
                  <p role="alert" className="basis-full text-sm text-[#9A3650]">
                    {error}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 border-t border-[#292630]/10 pt-6">
              <p className="text-sm font-semibold">My interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.length ? (
                  interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-[#E9E1F1] px-3.5 py-2 text-xs font-semibold text-[#5D487A]"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#6E6975]">
                    Add a few topics to shape the questions you see.
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {savedNotice && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-2xl bg-[#DDE8D2] p-4 text-sm font-semibold text-[#496436]"
          >
            <Check className="h-4 w-4" />
            Your profile changes are saved.
          </div>
        )}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Thoughts shared", counts.thoughts],
            ["Saved items", counts.saved],
            ["Connections", counts.connections],
            ["Reactions", counts.reactions],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[20px] border border-[#292630]/10 bg-white p-4 sm:p-5"
            >
              <p className="dashboard-display text-3xl tracking-[-.05em]">
                {value}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#6E6975]">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-[26px] border border-[#292630]/10 bg-white p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="dashboard-kicker">
                <span />
                Your contributions
              </p>
              <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">
                Thoughts worth returning to.
              </h2>
            </div>
            <LockKeyhole className="h-5 w-5 text-[#958F9B]" />
          </div>
          <div className="mt-7 flex gap-1 overflow-x-auto rounded-xl bg-[#F7F5F0] p-1">
            <Tab
              active={tab === "answers"}
              onClick={() => setTab("answers")}
              label="Answers"
              count={counts.thoughts}
            />
            <Tab
              active={tab === "discussions"}
              onClick={() => setTab("discussions")}
              label="Discussions"
              count={counts.discussions}
            />
            <Tab
              active={tab === "saved"}
              onClick={() => setTab("saved")}
              label="Saved"
              count={counts.saved}
            />
            <Tab
              active={tab === "reactions"}
              onClick={() => setTab("reactions")}
              label="Reactions"
              count={counts.reactions}
            />
          </div>
          {tab === "discussions" ? (
            <Empty
              title="Your discussions will live here."
              detail="Replies you contribute to other people's thoughts will stay private to your account."
              href="/discover"
              action="Join a conversation"
            />
          ) : currentItems.length ? (
            <div className="mt-5 space-y-3">
              {currentItems.map((item) => (
                <article key={item.id} className="rounded-2xl bg-[#F7F5F0] p-5">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7454A6]">
                    {item.question.category}
                  </p>
                  <h3 className="mt-2 text-base font-semibold">
                    {item.question.text}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5F5967]">
                    “{item.body}”
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Link
                      href={`/discover/${item.id}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#7454A6]"
                    >
                      Open thought <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {tab === "answers" && (
                      <button type="button" onClick={() => void deleteThought(item.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A3650]">
                        <Trash2 className="h-3.5 w-3.5" />Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title={
                tab === "saved"
                  ? "Keep the thoughts that stay with you."
                  : tab === "reactions"
                    ? "Your reactions will live here."
                    : "Your thoughts will live here."
              }
              detail={
                tab === "saved"
                  ? "Save interesting questions and answers from Moments, then return to them here."
                  : tab === "reactions"
                    ? "Answers you relate to will stay private to your account."
                    : "Share an answer on Discover to start building your personal collection."
              }
              href={tab === "saved" ? "/discover" : "/home#next-question"}
              action={
                tab === "saved"
                  ? "See moments"
                  : "Answer your first question"
              }
            />
          )}
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/profile/settings"
            className="rounded-[22px] border border-[#292630]/10 bg-white p-5 transition hover:border-[#7454A6]"
          >
            <ShieldCheck className="h-5 w-5 text-[#7454A6]" />
            <h3 className="mt-6 text-base font-semibold">
              Privacy & anonymity
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6E6975]">
              Control what other people can see and how identity reveal works.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">
              Manage settings <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/connections"
            className="rounded-[22px] border border-[#292630]/10 bg-white p-5 transition hover:border-[#7454A6]"
          >
            <MessageCircle className="h-5 w-5 text-[#7454A6]" />
            <h3 className="mt-6 text-base font-semibold">
              Connections by choice
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6E6975]">
              Manage requests, private conversations, and people you chose to
              keep.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">
              Open Connections <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>
      </main>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975] hover:text-[#292630]"}`}
    >
      {label}
      {count > 0 && <span className="ml-1.5 text-[#7454A6]">{count}</span>}
    </button>
  );
}
function Empty({
  title,
  detail,
  href,
  action,
}: {
  title: string;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#292630]/15 bg-[#F7F5F0] px-5 py-10 text-center">
      <Bookmark className="mx-auto h-5 w-5 text-[#7454A6]" />
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6E6975]">
        {detail}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#292630] px-4 py-2.5 text-xs font-semibold text-white"
      >
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
