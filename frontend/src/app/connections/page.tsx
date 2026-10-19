"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import AppNav from "@/components/AppNav";
import { getAccessToken } from "@/lib/auth";

type ConnectionItem = {
  id: string;
  status: string;
  source: string;
  last_experience: string;
  created_at: string;
  person: { id: string; name: string; initial: string };
};
type ConnectionData = {
  connections: ConnectionItem[];
  requests: ConnectionItem[];
  invites: ConnectionItem[];
  activity: {
    rooms_completed: number;
    people_connected: number;
    saved_for_later: number;
  };
};
type Thread = {
  id: string;
  person: { name: string; initial: string };
  room: string | null;
  last_message: string | null;
};

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";

export default function ConnectionsPage() {
  const [data, setData] = useState<ConnectionData>({
    connections: [],
    requests: [],
    invites: [],
    activity: { rooms_completed: 0, people_connected: 0, saved_for_later: 0 },
  });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [tab, setTab] = useState<"all" | "requests" | "invites">("all");
  const [selected, setSelected] = useState<ConnectionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");

  async function loadConnections() {
    const token = await getAccessToken();
    if (!token) {
      setSignedOut(true);
      setLoading(false);
      return;
    }
    try {
      const [response, threadsResponse] = await Promise.all([
        fetch(`${api}/api/v1/connections/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        fetch(`${api}/api/v1/connections/threads/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
      ]);
      if (!response.ok) throw new Error("Could not load your connections.");
      setData(await response.json());
      if (threadsResponse.ok) {
        const body = await threadsResponse.json();
        setThreads(body.data ?? []);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load your connections.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadConnections();
  }, []);
  const visible = useMemo(
    () =>
      tab === "all"
        ? data.connections
        : tab === "requests"
          ? data.requests
          : data.invites,
    [data, tab],
  );
  async function decide(id: string, decision: "accept" | "decline") {
    const token = await getAccessToken();
    if (!token) return;
    await fetch(`${api}/api/v1/connections/${id}/${decision}/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadConnections();
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 md:pb-14">
        <header className="flex flex-col gap-6 border-b border-dark-950/10 pb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Connections</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-.06em] sm:text-5xl">
              Your people on Duorah.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#6F6470]">
              A private place to find people you have mutually chosen to see
              again. No feeds, follower counts, or public walls.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-bold text-spark-coral"
          >
            Find a room <ArrowRight className="h-4 w-4" />
          </Link>
        </header>
        <nav
          className="mt-7 flex gap-1 overflow-x-auto rounded-2xl bg-dark-950/5 p-1"
          aria-label="Connection views"
        >
          <Tab
            active={tab === "all"}
            onClick={() => setTab("all")}
            label="All connections"
            count={data.connections.length}
          />
          <Tab
            active={tab === "requests"}
            onClick={() => setTab("requests")}
            label="Requests"
            count={data.requests.length}
          />
          <Tab
            active={tab === "invites"}
            onClick={() => setTab("invites")}
            label="Invites"
            count={data.invites.length}
          />
        </nav>
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] border border-dark-950/10 bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold">
                  {tab === "all"
                    ? "All connections"
                    : tab === "requests"
                      ? "Requests to review"
                      : "Invites you sent"}
                </p>
                <p className="mt-1 text-sm text-[#6F6470]">
                  {tab === "all"
                    ? "Start another shared experience without starting over."
                    : tab === "requests"
                      ? "Choose who you want to keep open to."
                      : "Room links that are still waiting for a response."}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f3] text-spark-coral">
                <UsersRound className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-7 space-y-2">
              {loading ? (
                <p className="py-10 text-center text-sm text-[#6F6470]">
                  Loading your connections…
                </p>
              ) : signedOut ? (
                <EmptyState signedOut />
              ) : error ? (
                <p
                  role="alert"
                  className="rounded-2xl bg-[#fff0f3] p-4 text-sm text-spark-coral"
                >
                  {error}
                </p>
              ) : (
                visible.map((item) => (
                  <PersonRow
                    key={item.id}
                    item={item}
                    tab={tab}
                    onOpen={() => setSelected(item)}
                    onDecision={decide}
                  />
                ))
              )}
              {!loading && !signedOut && !error && !visible.length && (
                <EmptyState tab={tab} />
              )}
            </div>
          </div>
          <aside className="rounded-[28px] bg-[#281D32] p-6 text-white sm:p-7">
            <CalendarDays className="h-5 w-5 text-[#f7b8c7]" />
            <p className="mt-8 text-xs font-bold tracking-[.16em] text-[#f7b8c7]">
              KEEP THE THREAD
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.05em]">
              The next room should feel easier.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Save someone for a future room without opening a private chat by
              default. Both people stay in control.
            </p>
            <div className="mt-7 border-t border-white/10 pt-5">
              <p className="flex items-start gap-2 text-xs leading-5 text-white/60">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#f7b8c7]" />
                Requests, private answers, and shared history stay protected by
                mutual consent.
              </p>
            </div>
          </aside>
        </section>
        {threads.length > 0 && (
          <section className="mt-10">
            <p className="section-label">Private threads</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.045em]">
              Conversations you both chose.
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/connections/${thread.id}`}
                  className="rounded-2xl border border-dark-950/10 bg-white p-4 transition hover:border-spark-coral"
                >
                  <p className="text-sm font-bold">{thread.person.name}</p>
                  <p className="mt-1 truncate text-xs text-[#6F6470]">
                    {thread.last_message ||
                      `From ${thread.room || "a shared room"}`}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-label">Your activity</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.045em]">
                Shared moments, not a social feed.
              </h2>
            </div>
            <Clock3 className="h-5 w-5 text-dark-950/25" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Activity label="Rooms completed" value="—" />
            <Activity
              label="People connected"
              value={String(data.connections.length)}
            />
            <Activity label="Saved for later" value="—" />
          </div>
        </section>
        {selected && (
          <PersonPanel
            item={selected}
            onClose={() => setSelected(null)}
            onDecision={decide}
          />
        )}
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
      onClick={onClick}
      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-bold transition sm:px-4 ${active ? "bg-white text-dark-950 shadow-sm" : "text-[#6F6470] hover:text-dark-950"}`}
    >
      {label}{" "}
      <span
        className={`ml-1 text-xs ${active ? "text-spark-coral" : "text-[#6F6470]"}`}
      >
        {count}
      </span>
    </button>
  );
}
function PersonRow({
  item,
  tab,
  onOpen,
  onDecision,
}: {
  item: ConnectionItem;
  tab: "all" | "requests" | "invites";
  onOpen: () => void;
  onDecision: (id: string, decision: "accept" | "decline") => void;
}) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-dark-950/8 p-3 transition hover:border-dark-950/20 sm:p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-dark-950 text-sm font-bold text-white">
        {item.person.initial}
      </span>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-bold">
          {item.person.name}
        </span>
        <span className="mt-1 block truncate text-xs text-[#6F6470]">
          {item.status === "accepted"
            ? "Connected"
            : item.status === "pending"
              ? tab === "requests"
                ? "Wants to connect"
                : "Invite pending"
              : item.status}{" "}
          {item.last_experience && `· ${item.last_experience}`}
        </span>
        <span className="mt-1 block truncate text-[11px] text-dark-950/40">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </button>
      {tab === "requests" ? (
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => onDecision(item.id, "accept")}
            aria-label={`Accept ${item.person.name}`}
            className="grid h-9 w-9 place-items-center rounded-full bg-dark-950 text-white"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDecision(item.id, "decline")}
            aria-label={`Decline ${item.person.name}`}
            className="grid h-9 w-9 place-items-center rounded-full bg-dark-950/5 text-dark-950/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onOpen}
          className="hidden shrink-0 items-center gap-1 text-xs font-bold text-spark-coral sm:inline-flex"
        >
          View <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </article>
  );
}
function PersonPanel({
  item,
  onClose,
  onDecision,
}: {
  item: ConnectionItem;
  onClose: () => void;
  onDecision: (id: string, decision: "accept" | "decline") => void;
}) {
  const [safetyNote, setSafetyNote] = useState("");
  const directRoom = `connection=${item.id}&connectionName=${encodeURIComponent(item.person.name)}`;
  async function exclude(reason: "block" | "no_rematch") {
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(`${api}/api/v1/safety/exclusions/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ excluded_user_id: item.person.id, reason }),
    });
    setSafetyNote(
      response.ok
        ? reason === "block"
          ? "Blocked. They cannot invite or match with you again."
          : "Saved. You will not be matched together again."
        : "That safety setting could not be saved.",
    );
  }
  return (
    <div className="fixed inset-0 z-50 grid items-end bg-dark-950/40 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        className="mx-auto w-full max-w-lg rounded-[28px] bg-[#fffdfa] p-6 text-dark-950 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-dark-950 text-lg font-bold text-white">
              {item.person.initial}
            </span>
            <div>
              <p className="text-xl font-bold">{item.person.name}</p>
              <p className="mt-1 text-sm text-[#6F6470]">
                {item.status === "accepted"
                  ? "Connected on Duorah"
                  : "Connection request"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-dark-950/5 p-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-7 rounded-2xl bg-[#fff6f2] p-4">
          <p className="text-xs font-bold tracking-[.12em] text-spark-coral">
            LAST SHARED MOMENT
          </p>
          <p className="mt-2 text-sm font-bold">
            {item.last_experience || "No shared experience recorded yet"}
          </p>
        </div>
        {item.status === "pending" ? (
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => onDecision(item.id, "accept")}
              className="rounded-full bg-dark-950 px-4 py-2.5 text-sm font-bold text-white"
            >
              Accept request
            </button>
            <button
              onClick={() => onDecision(item.id, "decline")}
              className="rounded-full bg-dark-950/5 px-4 py-2.5 text-sm font-bold"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Action
              href={`/connections/chat/${item.id}`}
              label="Chat"
              detail={`Send ${item.person.name} a message`}
            />
            <Action
              href={`/experiences/create?category=play&${directRoom}`}
              label="Play"
              detail={`Start a game with ${item.person.name}`}
            />
            <Action
              href={`/experiences/create?category=talk&${directRoom}`}
              label="Talk"
              detail={`Start a guided conversation`}
            />
            <Action
              href={`/experiences/create?category=together&${directRoom}`}
              label="Together"
              detail={`Plan an experience`}
            />
          </div>
        )}
        <div className="mt-6 border-t border-dark-950/10 pt-4">
          <p className="text-xs font-bold tracking-[.1em] text-dark-950/55">
            SAFETY
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => exclude("no_rematch")}
              className="text-xs font-bold text-[#6F6470] hover:text-dark-950"
            >
              Do not match again
            </button>
            <button
              onClick={() => exclude("block")}
              className="text-xs font-bold text-spark-coral"
            >
              Block
            </button>
          </div>
          {safetyNote && (
            <p className="mt-2 text-xs text-[#6F6470]">{safetyNote}</p>
          )}
        </div>
      </section>
    </div>
  );
}
function Action({
  href,
  label,
  detail,
}: {
  href: string;
  label: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-dark-950/10 p-3 transition hover:border-spark-coral hover:bg-[#fffaf8]"
    >
      <span className="block text-sm font-bold">{label}</span>
      <span className="mt-1 block text-xs text-[#6F6470]">{detail}</span>
    </Link>
  );
}
function Activity({ label, value }: { label: string; value: string }) {
  const [liveValue, setLiveValue] = useState(value === "—" ? "…" : value);
  useEffect(() => {
    if (value !== "—") return;
    let active = true;
    void getAccessToken().then(async (token) => {
      if (!token) return;
      const response = await fetch(`${api}/api/v1/connections/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) return;
      const body = await response.json();
      const metric =
        label === "Rooms completed"
          ? body.activity?.rooms_completed
          : body.activity?.saved_for_later;
      if (active && typeof metric === "number") setLiveValue(String(metric));
    });
    return () => {
      active = false;
    };
  }, [label, value]);
  return (
    <div className="rounded-2xl border border-dark-950/10 bg-white p-4">
      <p className="text-2xl font-bold tracking-[-.05em]">{liveValue}</p>
      <p className="mt-1 text-xs text-[#6F6470]">{label}</p>
    </div>
  );
}
function EmptyState({
  tab,
  signedOut = false,
}: {
  tab?: "all" | "requests" | "invites";
  signedOut?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-dark-950/12 bg-[#fffdfc] px-5 py-10 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#fff0f3] text-spark-coral">
        <UserPlus className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-bold">
        {signedOut
          ? "Sign in to see your connections."
          : tab === "all"
            ? "No connections yet."
            : tab === "requests"
              ? "No requests waiting."
              : "No pending invites."}
      </p>
      {signedOut && (
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-dark-950 px-4 py-2.5 text-xs font-bold text-white"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
