"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";
import { getAccessToken } from "@/lib/auth";

type ConnectionItem = {
  id: string;
  status: string;
  source: string;
  last_experience: string;
  created_at: string;
  person: { id: string; name: string; username: string; initial: string };
  thread_id?: string | null;
  my_reveal_consented?: boolean;
  other_reveal_consented?: boolean;
  reveal_ready?: boolean;
};
type Thread = {
  id: string;
  person: { name: string; username: string; initial: string };
  last_message: string | null;
  last_message_at?: string | null;
};
type Data = {
  connections: ConnectionItem[];
  requests: ConnectionItem[];
  invites: ConnectionItem[];
};
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";

export default function ConnectionsPage() {
  const [data, setData] = useState<Data>({
    connections: [],
    requests: [],
    invites: [],
  });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [tab, setTab] = useState<"requests" | "chats" | "people">("requests");
  const [requestView, setRequestView] = useState<"received" | "sent">(
    "received",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const token = await getAccessToken();
    if (!token) {
      setError("Sign in to see your connections.");
      setLoading(false);
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const [connectionsResponse, threadsResponse] = await Promise.all([
        fetch(`${api}/api/v1/connections/`, { headers }),
        fetch(`${api}/api/v1/connections/threads/`, { headers }),
      ]);
      if (!connectionsResponse.ok)
        throw new Error("Could not load your connections.");
      setData(await connectionsResponse.json());
      if (threadsResponse.ok)
        setThreads((await threadsResponse.json()).data ?? []);
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
    void load();
  }, []);

  async function decide(id: string, decision: "accept" | "decline") {
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(
      `${api}/api/v1/connections/${id}/${decision}/`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) await load();
  }

  async function reveal(id: string) {
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(`${api}/api/v1/connections/${id}/reveal/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) await load();
  }

  const requests = requestView === "received" ? data.requests : data.invites;
  const incomingCount = data.requests.length;
  const activeThreads = useMemo(
    () => threads.filter((thread) => thread.last_message || thread.id),
    [threads],
  );

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <header>
          <p className="dashboard-kicker">
            <span />
            Your people, by choice
          </p>
          <h1 className="dashboard-display mt-4 text-5xl leading-[.92] tracking-[-.07em] sm:text-7xl">
            Connections<span className="text-[#7454A6]">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#6E6975]">
            Some conversations deserve a next chapter.
          </p>
        </header>
        <nav
          className="mt-10 flex gap-1 overflow-x-auto rounded-2xl bg-[#292630]/[.06] p-1"
          aria-label="Connection views"
        >
          <Tab
            active={tab === "requests"}
            onClick={() => setTab("requests")}
            label="Requests"
            count={incomingCount}
          />
          <Tab
            active={tab === "chats"}
            onClick={() => setTab("chats")}
            label="Chats"
            count={activeThreads.length}
          />
          <Tab
            active={tab === "people"}
            onClick={() => setTab("people")}
            label="People"
            count={data.connections.length}
          />
        </nav>
        {loading ? (
          <div className="mt-6 h-80 animate-pulse rounded-[24px] bg-[#E9E1F1]" />
        ) : error ? (
          <div className="mt-6 rounded-[24px] bg-[#F8E1E7] p-5 text-sm text-[#9A3650]">
            {error}
          </div>
        ) : (
          <>
            {tab === "requests" && (
              <Requests
                requests={requests}
                requestView={requestView}
                onViewChange={setRequestView}
                onDecision={decide}
              />
            )}
            {tab === "chats" && <Chats threads={activeThreads} />}
            {tab === "people" && (
              <People connections={data.connections} onReveal={reveal} />
            )}
          </>
        )}
        <p className="mt-10 flex items-center gap-2 text-xs leading-5 text-[#958F9B]">
          <ShieldCheck className="h-4 w-4 text-[#7454A6]" />
          Identity stays hidden until both people choose to reveal it.
        </p>
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
      className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975] hover:text-[#292630]"}`}
    >
      {label}
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#7454A6] px-1 text-[10px] text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function Requests({
  requests,
  requestView,
  onViewChange,
  onDecision,
}: {
  requests: ConnectionItem[];
  requestView: "received" | "sent";
  onViewChange: (value: "received" | "sent") => void;
  onDecision: (id: string, decision: "accept" | "decline") => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-[#292630]/10 bg-white p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="dashboard-kicker">
            <span />
            Connection requests
          </p>
          <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">
            Decide what happens next.
          </h2>
        </div>
        <div className="flex rounded-xl bg-[#F7F5F0] p-1">
          <button
            type="button"
            onClick={() => onViewChange("received")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${requestView === "received" ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975]"}`}
          >
            Received
          </button>
          <button
            type="button"
            onClick={() => onViewChange("sent")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${requestView === "sent" ? "bg-white text-[#292630] shadow-sm" : "text-[#6E6975]"}`}
          >
            Sent
          </button>
        </div>
      </div>
      {requests.length ? (
        <div className="mt-7 space-y-3">
          {requests.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              received={requestView === "received"}
              onDecision={onDecision}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            requestView === "received"
              ? "Your next connection could start with a thought."
              : "No requests are waiting."
          }
          detail={
            requestView === "received"
              ? "Explore answers, join a discussion, and discover people whose perspectives interest you."
              : "When someone catches your curiosity, your request will appear here."
          }
        />
      )}
    </section>
  );
}

function RequestCard({
  item,
  received,
  onDecision,
}: {
  item: ConnectionItem;
  received: boolean;
  onDecision: (id: string, decision: "accept" | "decline") => void;
}) {
  return (
    <article className="rounded-[20px] border border-[#292630]/10 bg-[#F7F5F0] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E9E1F1] text-[#7454A6]">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {item.person.name}{" "}
              <span className="font-normal text-[#958F9B]">
                @{item.person.username}
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold">
              {received
                ? "Someone found your perspective interesting."
                : "Your request is waiting for a response."}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5F5967]">
              {item.last_experience
                ? `From a discussion about “${item.last_experience}”`
                : "A connection that began with curiosity."}
            </p>
            <p className="mt-2 text-xs text-[#958F9B]">
              {received ? "Incoming request" : "Request sent"} ·{" "}
              {formatDate(item.created_at)}
            </p>
          </div>
        </div>
        {received ? (
          <div className="flex gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={() => onDecision(item.id, "accept")}
              className="inline-flex items-center gap-2 rounded-full bg-[#7454A6] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => onDecision(item.id, "decline")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#6E6975]"
            >
              <X className="h-4 w-4" />
              Decline
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E9E1F1] px-3 py-2 text-xs font-semibold text-[#7454A6] sm:shrink-0">
            <LockKeyhole className="h-3.5 w-3.5" />
            Pending
          </span>
        )}
      </div>
    </article>
  );
}

function Chats({ threads }: { threads: Thread[] }) {
  return (
    <section className="mt-6 rounded-[24px] border border-[#292630]/10 bg-white p-5 sm:p-8">
      <p className="dashboard-kicker">
        <span />
        Private conversations
      </p>
      <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">
        Continue where curiosity took you.
      </h2>
      {threads.length ? (
        <div className="mt-7 divide-y divide-[#292630]/10">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/connections/chat/${thread.id}`}
              className="flex items-center gap-4 py-4 transition hover:bg-[#F7F5F0]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#E9E1F1] text-[#7454A6]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {thread.person.name}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-[#958F9B]">
                  @{thread.person.username}
                </span>
                <span className="mt-1 block truncate text-sm text-[#6E6975]">
                  {thread.last_message ?? "Your private conversation is ready."}
                </span>
                <span className="mt-1 block text-xs text-[#958F9B]">
                  Private conversation access
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-[#958F9B]" />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No private conversations yet."
          detail="When you and another person mutually reveal your identities, your conversation will appear here."
        />
      )}
    </section>
  );
}

function People({
  connections,
  onReveal,
}: {
  connections: ConnectionItem[];
  onReveal: (id: string) => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-[#292630]/10 bg-white p-5 sm:p-8">
      <p className="dashboard-kicker">
        <span />
        Your people
      </p>
      <h2 className="dashboard-display mt-3 text-3xl tracking-[-.055em]">
        Connections you chose to keep.
      </h2>
      {connections.length ? (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {connections.map((item) => (
            <article
              key={item.id}
              className="rounded-[20px] border border-[#292630]/10 bg-[#F7F5F0] p-5"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#E9E1F1] text-[#7454A6]">
                  <UserRound className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#7454A6]">
                  Identity hidden
                </span>
              </div>
              <h3 className="mt-7 text-lg font-semibold">{item.person.name}</h3>
              <p className="mt-1 text-xs font-semibold text-[#958F9B]">
                @{item.person.username}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6E6975]">
                Connected through{" "}
                {item.last_experience
                  ? `a discussion about “${item.last_experience}”`
                  : "a Duora thought"}
                .
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#292630]/10 pt-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-[#958F9B]">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  {item.reveal_ready
                    ? "Private chat unlocked"
                    : item.other_reveal_consented
                      ? "They are ready when you are"
                      : item.my_reveal_consented
                        ? "Waiting for their choice"
                        : "Identity not revealed"}
                </span>
                {!item.my_reveal_consented && (
                  <button
                    type="button"
                    onClick={() => onReveal(item.id)}
                    className="rounded-full bg-[#7454A6] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Choose to reveal
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Find a thought that resonates with you."
          detail="A connection can begin with a single thought."
        />
      )}
    </section>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mt-7 rounded-[20px] border border-dashed border-[#292630]/15 bg-[#F7F5F0] px-5 py-10 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#E9E1F1] text-[#7454A6]">
        <UsersRound className="h-5 w-5" />
      </span>
      <p className="mx-auto mt-4 max-w-sm text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6E6975]">
        {detail}
      </p>
      <Link
        href="/discover"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#292630] px-4 py-2.5 text-xs font-semibold text-white"
      >
        Explore Duora <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
      }).format(date);
}
