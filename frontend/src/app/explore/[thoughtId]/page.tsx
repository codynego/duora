"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  Flag,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import AnonymousAvatar from "@/components/AnonymousAvatar";
import { getAccessToken } from "@/lib/auth";
import { useCurrentUser } from "@/lib/current-user";

type Thought = {
  id: string;
  question: { text: string; category: string };
  body: string;
  author: {
    label: string;
    display_name: string;
    username: string;
    avatar_variant: number;
  };
  reply_count: number;
  relate_count: number;
  viewer_related: boolean;
  common_ground: {
    shared_count: number;
    shared_interests: string[];
    percentage: number | null;
    label: string;
  } | null;
};
type Reply = {
  id: string;
  body: string;
  parent: string | null;
  relate_count: number;
  viewer_related: boolean;
  author: {
    label: string;
    display_name: string;
    username: string;
    avatar_variant: number;
  };
  created_at: string;
};
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";

export default function DiscussionPage() {
  const params = useParams<{ thoughtId: string }>();
  const router = useRouter();
  const { user, ready } = useCurrentUser();
  const [thought, setThought] = useState<Thought | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [reply, setReply] = useState("");
  const [replyTarget, setReplyTarget] = useState<Reply | null>(null);
  const [sent, setSent] = useState(false);
  const [related, setRelated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [safetyNotice, setSafetyNotice] = useState("");
  const [showCommonGround, setShowCommonGround] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, router, user]);
  useEffect(() => {
    if (!ready || !user || !params.thoughtId) return;
    async function load() {
      const token = await getAccessToken();
      const response = await fetch(
        `${api}/api/v1/social/thoughts/${params.thoughtId}/`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok)
        setError(body?.detail ?? "This discussion could not be opened.");
      else {
        setThought(body.data);
        setReplies(body.replies ?? []);
        setRelated(Boolean(body.data?.viewer_related));
      }
      setLoading(false);
    }
    void load();
  }, [params.thoughtId, ready, user]);

  async function toggleRelate() {
    const token = await getAccessToken();
    if (!token || !thought) return;
    const response = await fetch(
      `${api}/api/v1/social/thoughts/${thought.id}/relate/`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return;
    const body = await response.json();
    setRelated(Boolean(body.related));
    setThought({ ...thought, relate_count: body.relate_count });
  }

  async function postReply() {
    if (!reply.trim() || !thought) return;
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(
      `${api}/api/v1/social/thoughts/${thought.id}/replies/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: reply.trim(), parent_id: replyTarget?.id ?? null }),
      },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      setError(body?.detail ?? "Your reply could not be posted.");
      return;
    }
    setReplies((current) => [...current, body.data]);
    setReply("");
    setReplyTarget(null);
    setThought({ ...thought, reply_count: thought.reply_count + 1 });
  }

  async function toggleReplyRelate(item: Reply) {
    if (!thought) return;
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(
      `${api}/api/v1/social/thoughts/${thought.id}/replies/${item.id}/relate/`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return;
    const body = await response.json();
    setReplies((current) =>
      current.map((replyItem) =>
        replyItem.id === item.id
          ? { ...replyItem, viewer_related: Boolean(body.related), relate_count: body.relate_count }
          : replyItem,
      ),
    );
  }

  function focusReplyBox() {
    const target =
      document.getElementById("reply-box") ??
      document.getElementById("reply-box-mobile");
    target?.focus();
  }

  function startReply(item: Reply) {
    setReplyTarget(item);
    focusReplyBox();
  }

  async function connect() {
    if (!thought) return;
    const token = await getAccessToken();
    if (!token) return;
    const response = await fetch(
      `${api}/api/v1/social/thoughts/${thought.id}/connect/`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) setSent(true);
  }

  async function safetyAction(action: "report" | "block" | "delete") {
    if (!thought) return;
    if (action === "delete" && !window.confirm("Delete this thought? This cannot be undone.")) return;
    if (action === "block" && !window.confirm("Block this person? Their thoughts will no longer appear for you.")) return;
    const token = await getAccessToken();
    if (!token) return;
    const reason = action === "report" ? window.prompt("Why are you reporting this thought?", "Other") : null;
    if (action === "report" && reason === null) return;
    const response = await fetch(`${api}/api/v1/social/thoughts/${thought.id}/${action}/`, {
      method: action === "delete" ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(action === "report" ? { "Content-Type": "application/json" } : {}),
      },
      ...(action === "report" ? { body: JSON.stringify({ reason }) } : {}),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      setError(body?.detail ?? "That safety action could not be completed.");
      return;
    }
    if (action === "delete") {
      router.replace("/profile");
      return;
    }
    setSafetyNotice(action === "block" ? "Person blocked. Their thoughts are hidden from you." : "Thanks. Your report was sent for review.");
  }

  if (!ready || !user)
    return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {thought && !loading && (
          <aside
          className="order-2 hidden rounded-[24px] border border-[#292630]/10 bg-white p-5 shadow-[0_18px_45px_rgba(41,38,48,.06)] lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1 lg:block lg:h-[calc(100vh-8rem)] lg:overflow-y-auto"
          aria-label="Explore different perspectives"
          >
          <p className="dashboard-kicker">
            <span />
            Explore different perspectives
          </p>
          <h2 className="dashboard-display mt-4 text-2xl tracking-[-.05em]">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </h2>
          {replies.length ? (
            <div className="mt-5 space-y-3">
              {replies.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl bg-[#F7F5F0] p-3 ${item.parent ? "ml-4 border-l-2 border-[#E9E1F1]" : ""}`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#7454A6]">
                    <AnonymousAvatar
                      variant={item.author.avatar_variant}
                      size="sm"
                    />
                    <span>@{item.author.username}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#6E6975]">
                    “{item.body}”
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-[#958F9B]">
                    <button type="button" onClick={() => void toggleReplyRelate(item)} className={`inline-flex items-center gap-1 ${item.viewer_related ? "text-[#7454A6]" : "hover:text-[#7454A6]"}`}>
                      <Heart className="h-3.5 w-3.5" fill={item.viewer_related ? "currentColor" : "none"} />
                      {item.relate_count}
                    </button>
                    <button type="button" onClick={() => startReply(item)} className="hover:text-[#7454A6]">
                      Reply
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[#6E6975]">
              No perspectives yet. Your reply could be the first.
            </p>
          )}
          <div className="mt-6 border-t border-[#292630]/10 pt-5">
            {replyTarget && (
              <div className="mb-3 flex items-center justify-between rounded-xl bg-[#E9E1F1] px-3 py-2 text-xs text-[#7454A6]">
                <span>Replying to @{replyTarget.author.username}</span>
                <button type="button" onClick={() => setReplyTarget(null)} className="font-bold">Cancel</button>
              </div>
            )}
            <textarea
              id="reply-box"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Share your perspective respectfully…"
              maxLength={2000}
              className="min-h-28 w-full resize-none rounded-2xl bg-[#F7F5F0] p-3 text-sm leading-6 outline-none placeholder:text-[#958F9B] focus:ring-2 focus:ring-[#7454A6]/20"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#958F9B]">Anonymous reply</span>
              <button
                type="button"
                onClick={() => void postReply()}
                disabled={!reply.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#7454A6] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Reply <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          </aside>
        )}
      <main className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6E6975] hover:text-[#292630]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
        {loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-[24px] bg-[#E9E1F1]" />
        ) : error ? (
          <div className="mt-8 rounded-[24px] bg-[#F8E1E7] p-6 text-sm text-[#9A3650]">
            {error}
          </div>
        ) : thought ? (
          <>
            <header className="mt-10">
              <p className="dashboard-kicker">
                <span />
                The conversation
              </p>
              <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[#7454A6]">
                {thought.question.category}
              </p>
              <h1 className="dashboard-display mt-4 text-5xl leading-[.95] tracking-[-.065em] sm:text-7xl">
                {thought.question.text}
              </h1>
            </header>
            <section className="mt-8 rounded-[24px] bg-white p-6 shadow-[0_18px_45px_rgba(41,38,48,.08)] sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7454A6]">
                <AnonymousAvatar
                  variant={thought.author.avatar_variant}
                  size="sm"
                />
                @{thought.author.username}
                {thought.common_ground && (
                  <button
                    type="button"
                    onClick={() => setShowCommonGround(true)}
                    title={`You both selected: ${thought.common_ground.shared_interests.join(", ")}`}
                    className="rounded-full bg-[#E9E1F1] px-2.5 py-1 text-[#7454A6]"
                  >
                    {thought.common_ground.label}
                  </button>
                )}
              </div>
              <p className="mt-6 font-medium text-xl leading-8 text-[#292630]">
                “{thought.body}”
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#292630]/10 pt-5">
                <button
                  type="button"
                  onClick={() => void toggleRelate()}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${related ? "bg-[#E9E1F1] text-[#7454A6]" : "bg-[#F7F5F0] text-[#6E6975]"}`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={related ? "currentColor" : "none"}
                  />
                  I relate{" "}
                  <span className="text-xs opacity-60">
                    {thought.relate_count}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={focusReplyBox}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F7F5F0] px-4 py-2.5 text-sm font-semibold text-[#6E6975]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => void connect()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#292630] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <UserRound className="h-4 w-4" />
                  Discover this person
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 border-t border-[#292630]/10 pt-4 text-xs font-semibold text-[#958F9B]">
                {user?.anonymous_username === thought.author.username ? (
                  <button type="button" onClick={() => void safetyAction("delete")} className="inline-flex items-center gap-1.5 hover:text-[#9A3650]"><Trash2 className="h-3.5 w-3.5" />Delete my thought</button>
                ) : (
                  <>
                    <button type="button" onClick={() => void safetyAction("report")} className="inline-flex items-center gap-1.5 hover:text-[#9A3650]"><Flag className="h-3.5 w-3.5" />Report</button>
                    <button type="button" onClick={() => void safetyAction("block")} className="inline-flex items-center gap-1.5 hover:text-[#9A3650]"><Ban className="h-3.5 w-3.5" />Block person</button>
                  </>
                )}
              </div>
            </section>
            {safetyNotice && <p role="status" className="mt-4 rounded-2xl bg-[#DDE8D2] p-4 text-sm font-semibold text-[#496436]">{safetyNotice}</p>}
            {sent && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#DDE8D2] p-4 text-sm font-semibold text-[#496436]">
                <Check className="h-5 w-5" />
                Your connection request has been sent.{" "}
                <Link href="/connections" className="ml-auto underline">
                  View
                </Link>
              </div>
            )}
            <section className="mt-12 lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="dashboard-kicker">
                    <span />
                    Explore different perspectives
                  </p>
                  <h2 className="dashboard-display mt-3 text-3xl tracking-[-.05em]">
                    {replies.length}{" "}
                    {replies.length === 1 ? "reply" : "replies"}
                  </h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {replies.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[20px] border border-[#292630]/10 bg-white p-5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7454A6]">
                      <AnonymousAvatar
                        variant={item.author.avatar_variant}
                        size="sm"
                      />
                      @{item.author.username}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#5F5967]">
                      “{item.body}”
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-[#7454A6]">
                      <button type="button" onClick={() => void toggleReplyRelate(item)} className="inline-flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5" fill={item.viewer_related ? "currentColor" : "none"} />{item.relate_count}
                      </button>
                      <button type="button" onClick={() => startReply(item)}>Reply</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6 rounded-[20px] border border-[#292630]/10 bg-white p-4">
                {replyTarget && (
                  <div className="mb-3 flex items-center justify-between rounded-xl bg-[#E9E1F1] px-3 py-2 text-xs text-[#7454A6]">
                    <span>Replying to @{replyTarget.author.username}</span>
                    <button type="button" onClick={() => setReplyTarget(null)} className="font-bold">Cancel</button>
                  </div>
                )}
                <textarea
                  id="reply-box-mobile"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Share your perspective respectfully…"
                  maxLength={2000}
                  className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-[#958F9B]"
                />
                <div className="flex items-center justify-between border-t border-[#292630]/10 pt-3">
                  <span className="text-xs text-[#958F9B]">
                    Anonymous to other users
                  </span>
                  <button
                    type="button"
                    onClick={() => void postReply()}
                    disabled={!reply.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#7454A6] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-45"
                  >
                    Post anonymously <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
            <Link
              href="/explore"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]"
            >
              Explore more answers <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : null}
      </main>
      </div>
      {thought && showCommonGround && thought.common_ground && (
        <CommonGroundSheet
          thought={thought}
          onClose={() => setShowCommonGround(false)}
          onConnect={() => {
            void connect();
            setShowCommonGround(false);
          }}
        />
      )}
    </div>
  );
}

function CommonGroundSheet({
  thought,
  onClose,
  onConnect,
}: {
  thought: Thought;
  onClose: () => void;
  onConnect: () => void;
}) {
  const common = thought.common_ground;
  if (!common) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#292630]/35 p-3 sm:items-center">
      <button type="button" aria-label="Close common ground" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(41,38,48,.24)] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="detail-common-ground-title">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="dashboard-kicker"><span />Your common ground</p>
            <h2 id="detail-common-ground-title" className="dashboard-display mt-3 text-3xl tracking-[-.06em]">You and {thought.author.display_name} have things in common.</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-[#F7F5F0] px-3 py-2 text-xs font-semibold text-[#6E6975]">Close</button>
        </div>
        <p className="mt-6 text-sm font-semibold text-[#7454A6]">{common.shared_count} shared {common.shared_count === 1 ? "interest" : "interests"}</p>
        {common.shared_interests.length ? (
          <div className="mt-4 space-y-3">
            {common.shared_interests.map((interest) => (
              <div key={interest} className="rounded-2xl bg-[#F7F5F0] p-4">
                <p className="font-semibold">{interest}</p>
                <p className="mt-1 text-sm leading-6 text-[#6E6975]">You both selected {interest.toLowerCase()} as an interest.</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#F7F5F0] p-4 text-sm leading-6 text-[#6E6975]">You’re still discovering your common ground.</p>
        )}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full border border-[#292630]/10 px-5 py-3 text-sm font-semibold text-[#6E6975]">Keep exploring</button>
          <button type="button" onClick={onConnect} className="rounded-full bg-[#292630] px-5 py-3 text-sm font-semibold text-white">Connect</button>
        </div>
      </section>
    </div>
  );
}
