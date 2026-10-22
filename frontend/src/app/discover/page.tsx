"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Eye,
  Search,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { getAccessToken } from "@/lib/auth";
import { useCurrentUser } from "@/lib/current-user";

type Question = { id: string; text: string; category: string };
type Thought = {
  id: string;
  question: { text: string; category: string };
  body: string;
};
type Daily = {
  data: Question | null;
  answer: Thought | null;
  completed: boolean;
  server_now: string;
  next_reset_at: string;
  onboarding_question: Question | null;
  onboarding_answered: boolean;
  answer_cooldown_until: string | null;
};
const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
const fallbackQuestion: Question = {
  id: "",
  text: "What’s something you wish people understood about you without you having to explain it?",
  category: "Relationships",
};

export default function DiscoverPage() {
  const { user, ready } = useCurrentUser();
  const router = useRouter();
  const [daily, setDaily] = useState<Daily | null>(null);
  const [answer, setAnswer] = useState("");
  const [onboardingAnswer, setOnboardingAnswer] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, router, user]);
  useEffect(() => {
    if (!ready || !user) return;
    async function loadDaily() {
      const token = await getAccessToken();
      const response = await fetch(`${api}/api/v1/social/questions/daily/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const body = (await response.json()) as Daily;
        setDaily(body);
        setServerOffset(new Date(body.server_now).getTime() - Date.now());
        if (body.answer) setAnswer(body.answer.body);
        else if (body.data?.id)
          setAnswer(
            window.localStorage.getItem(`duora:daily-draft:${body.data.id}`) ??
              "",
          );
      }
      setLoading(false);
    }
    void loadDaily();
  }, [ready, user]);

  useEffect(() => {
    if (!daily?.next_reset_at) return;
    const update = () =>
      setRemaining(
        Math.max(
          0,
          new Date(daily.next_reset_at).getTime() - (Date.now() + serverOffset),
        ),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [daily?.next_reset_at, serverOffset]);

  useEffect(() => {
    if (!daily?.answer_cooldown_until) {
      setCooldownRemaining(0);
      return;
    }
    const update = () =>
      setCooldownRemaining(
        Math.max(
          0,
          new Date(daily.answer_cooldown_until as string).getTime() -
            (Date.now() + serverOffset),
        ),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [daily?.answer_cooldown_until, serverOffset]);

  async function publishThought() {
    const question = daily?.data;
    if (!answer.trim() || !question?.id) {
      setError("Write a thought before sharing it.");
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${api}/api/v1/social/thoughts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question_id: question.id, body: answer.trim() }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          body?.detail ?? "Your thought could not be shared. Try again.",
        );
      window.localStorage.removeItem(`duora:daily-draft:${question.id}`);
      setDaily((current) =>
        current ? { ...current, completed: true, answer: body.data } : current,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your thought could not be shared.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishOnboardingThought() {
    const question = daily?.onboarding_question;
    if (!onboardingAnswer.trim() || !question?.id) {
      setError("Write a thought before sharing it.");
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${api}/api/v1/social/thoughts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: question.id,
          body: onboardingAnswer.trim(),
          onboarding: true,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          body?.detail ?? "Your thought could not be shared. Try again.",
        );
      setDaily((current) =>
        current
          ? {
              ...current,
              onboarding_answered: true,
              answer_cooldown_until:
                body?.answer_cooldown_until ??
                new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            }
          : current,
      );
      setOnboardingAnswer("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your thought could not be shared.",
      );
    } finally {
      setSaving(false);
    }
  }

  const question = daily?.data ?? fallbackQuestion;
  const weekday = useMemo(
    () =>
      daily?.server_now
        ? new Intl.DateTimeFormat("en-NG", { weekday: "long" }).format(
            new Date(daily.server_now),
          )
        : "Today",
    [daily?.server_now],
  );
  const time = formatCountdown(remaining);
  const cooldownTime = formatCountdown(cooldownRemaining);
  const cooldownActive = cooldownRemaining > 0;
  if (!ready || !user)
    return <div className="min-h-screen bg-[#F7F5F0]" aria-busy="true" />;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#292630] md:pl-[232px]">
      <AppNav />
      <main className="mx-auto max-w-4xl px-5 pb-28 pt-4 sm:px-8 sm:pt-8 md:pb-14">
        <section className="mx-auto mt-10 max-w-3xl text-center sm:mt-14">
          <p className="dashboard-kicker justify-center">
            <span />
            {weekday.toUpperCase()} · DAILY MOMENTS
          </p>
          <h1 className="dashboard-display mt-7 text-5xl leading-[.93] tracking-[-.07em] sm:text-7xl">
            A thought worth sharing<span className="text-[#7454A6]">.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[#6E6975]">
            There’s a question waiting for you today.
          </p>
        </section>
        <section
          id="daily-question"
          className="mx-auto mt-8 max-w-3xl rounded-[26px] border border-[#E7E2EA] bg-white p-6 shadow-[0_18px_45px_rgba(41,38,48,.06)] sm:mt-12 sm:p-10"
        >
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#7454A6]">
            Today’s question
          </p>
          {daily?.completed ? (
            <div className="pt-10">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#DDE8D2] text-[#4F713D]">
                <Check className="h-5 w-5" />
              </div>
              <h2 className="dashboard-display mt-7 text-4xl leading-[.98] tracking-[-.06em] sm:text-5xl">
                You’ve shared today’s thought.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#6E6975]">
                Your answer is published anonymously. You can still explore,
                reply, relate, and discover people.
              </p>
              <div className="mt-9 flex flex-col gap-6 border-t border-[#E7E2EA] pt-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#958F9B]">
                    New daily question in
                  </p>
                  <p className="mt-2 font-mono text-3xl font-semibold tracking-[-.05em] text-[#292630]">
                    {time.hours}
                    <span className="ml-1 text-[10px] font-sans font-bold tracking-[.1em] text-[#958F9B]">
                      HRS
                    </span>
                    <span className="ml-3">{time.minutes}</span>
                    <span className="ml-1 text-[10px] font-sans font-bold tracking-[.1em] text-[#958F9B]">
                      MIN
                    </span>
                    <span className="ml-3">{time.seconds}</span>
                    <span className="ml-1 text-[10px] font-sans font-bold tracking-[.1em] text-[#958F9B]">
                      SEC
                    </span>
                  </p>
                </div>
                <Link
                  href={`/moments?category=${encodeURIComponent(question.category)}`}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-[#7454A6] px-5 py-3 text-sm font-semibold text-white"
                >
                  See other moments <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="pt-8">
              <h2 className="dashboard-display max-w-2xl text-3xl leading-[1.02] tracking-[-.055em] sm:text-5xl">
                {loading ? "Finding today’s question…" : question.text}
              </h2>
              <p className="mt-5 text-sm leading-6 text-[#6E6975]">
                Take your time. Your answer is shared anonymously.
              </p>
              <textarea
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  if (daily?.data?.id)
                    window.localStorage.setItem(
                      `duora:daily-draft:${daily.data.id}`,
                      event.target.value,
                    );
                }}
                maxLength={500}
                disabled={loading || saving || cooldownActive}
                placeholder="Write what’s on your mind..."
                className="mt-8 min-h-36 w-full resize-y rounded-2xl border border-[#E7E2EA] bg-[#F7F5F0] p-4 text-sm leading-6 text-[#292630] outline-none placeholder:text-[#958F9B] transition focus:min-h-44 focus:border-[#7454A6] focus:ring-4 focus:ring-[#7454A6]/10"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-[#958F9B]">
                <span>{answer.length} / 500</span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Your identity stays hidden
                </span>
              </div>
              <button
                type="button"
                onClick={() => void publishThought()}
                disabled={
                  !answer.trim() || saving || loading || !daily?.data?.id || cooldownActive
                }
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7454A6] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#61438F] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving ? "Sharing…" : "Share my thought"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
              {cooldownActive && (
                <div className="mt-5 rounded-2xl bg-[#F0ECFA] p-4 text-[#5D487A]">
                  <p className="text-sm font-semibold">
                    You’ve shared a first thought.
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    You can answer another question in:
                  </p>
                  <p className="mt-3 font-mono text-xl font-semibold tracking-[-.04em]">
                    {cooldownTime.hours}
                    <span className="ml-1 text-[10px] font-sans font-bold tracking-[.1em]">HRS</span>
                    <span className="ml-3">{cooldownTime.minutes}</span>
                    <span className="ml-1 text-[10px] font-sans font-bold tracking-[.1em]">MIN</span>
                    <span className="ml-3">{cooldownTime.seconds}</span>
                    <span className="ml-1 text-[10px] font-sans font-bold tracking-[.1em]">SEC</span>
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#7454A6]">
                    You can still explore and join conversations while the timer runs.
                  </p>
                </div>
              )}
              {error && (
                <p role="alert" className="mt-4 text-sm text-[#9A3650]">
                  {error}
                </p>
              )}
            </div>
          )}
        </section>
        {daily?.onboarding_question && !daily.onboarding_answered && (
          <section className="mx-auto mt-8 max-w-3xl rounded-[26px] border border-[#E7E2EA] bg-[#F0ECFA] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#7454A6]">
              Your first Duorah question
            </p>
            <h2 className="dashboard-display mt-5 max-w-2xl text-3xl leading-[1.02] tracking-[-.055em] sm:text-4xl">
              {daily.onboarding_question.text}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#6E6975]">
              You skipped this during onboarding. You can still answer it here
              whenever you’re ready.
            </p>
            <textarea
              value={onboardingAnswer}
              onChange={(event) => setOnboardingAnswer(event.target.value)}
              maxLength={500}
              disabled={saving || cooldownActive}
              placeholder="Write what’s on your mind..."
              className="mt-6 min-h-32 w-full resize-y rounded-2xl border border-[#E7E2EA] bg-white p-4 text-sm leading-6 text-[#292630] outline-none placeholder:text-[#958F9B] transition focus:border-[#7454A6] focus:ring-4 focus:ring-[#7454A6]/10"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-[#958F9B]">
              <span>{onboardingAnswer.length} / 500</span>
              <span>Shared anonymously · Appears in Moments</span>
            </div>
            <button
              type="button"
              onClick={() => void publishOnboardingThought()}
              disabled={!onboardingAnswer.trim() || saving || cooldownActive}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7454A6] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? "Sharing…" : "Share my thought"} <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}
        <section className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
          <Link
            href="/moments"
            className="group rounded-[20px] border border-[#E7E2EA] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#7454A6]"
          >
            <Search className="h-5 w-5 text-[#7454A6]" />
            <h2 className="mt-7 text-lg font-semibold">See moments</h2>
            <p className="mt-2 text-sm leading-6 text-[#6E6975]">
              See what others are thinking.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">
              Moments{" "}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/connections"
            className="group rounded-[20px] border border-[#E7E2EA] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#7454A6]"
          >
            <UsersRound className="h-5 w-5 text-[#7454A6]" />
            <h2 className="mt-7 text-lg font-semibold">Find your people</h2>
            <p className="mt-2 text-sm leading-6 text-[#6E6975]">
              Connect through shared thoughts.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7454A6]">
              Connections{" "}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </section>
        <p className="mx-auto mt-12 flex max-w-3xl items-center justify-center gap-2 text-center text-xs text-[#958F9B]">
          <Clock3 className="h-3.5 w-3.5" />
          One thoughtful answer each day. Everything else stays open.
        </p>
      </main>
    </div>
  );
}

function formatCountdown(value: number) {
  const total = Math.floor(value / 1000);
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}
