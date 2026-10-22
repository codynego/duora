"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";

const interestOptions = [
  ["Relationships", "The people we choose and the ways we show up"],
  ["Friendship", "Finding your people, at your own pace"],
  ["Business & ambition", "Ideas, work, momentum, and what drives us"],
  ["Personal growth", "Becoming, unlearning, and starting again"],
  ["Deep conversations", "Questions that stay with you"],
  ["Fun & everyday life", "Small joys, strong opinions, and ordinary stories"],
];

function questionFor(interests: string[]) {
  if (interests.includes("Relationships"))
    return "What is something you wish people understood about you?";
  if (interests.includes("Personal growth"))
    return "What are you learning to be gentler with yourself about?";
  if (interests.includes("Business & ambition"))
    return "What are you quietly working toward right now?";
  if (interests.includes("Fun & everyday life"))
    return "What small thing has made your week better lately?";
  return "What is something you have been thinking about more than expected?";
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [identity, setIdentity] = useState({ display_name: "", username: "" });
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function loadIdentity() {
      const token = await getAccessToken({ redirectOnFailure: false });
      if (!token) return;
      const api =
        process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${api}/api/v1/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const body = await response.json();
      setIdentity({
        display_name:
          body.data?.anonymous_display_name ?? body.data?.display_name ?? "",
        username: body.data?.anonymous_username ?? "",
      });
    }
    void loadIdentity();
  }, []);

  async function regenerateIdentity() {
    const token = await getAccessToken();
    if (!token) return;
    setRegenerating(true);
    try {
      const api =
        process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${api}/api/v1/auth/me/identity/regenerate/`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) setIdentity((await response.json()).data);
    } finally {
      setRegenerating(false);
    }
  }

  const toggleInterest = (interest: string) =>
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );

  async function prepareQuestion() {
    setQuestionText(questionFor(selected));
    const token = await getAccessToken();
    if (!token) return;
    const api =
      process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(`${api}/api/v1/social/questions/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    const body = (await response.json()) as {
      data?: { id: string; text: string; category: string }[];
    };
    const available = body.data ?? [];
    const normalizeCategory = (value: string) =>
      value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
    const selectedCategories = new Set(selected.map(normalizeCategory));
    const relevant = available.filter((question) =>
      selectedCategories.has(normalizeCategory(question.category)),
    );
    const pool = relevant.length ? relevant : available;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    if (chosen) {
      setQuestionId(chosen.id);
      setQuestionText(chosen.text);
    }
  }

  useEffect(() => {
    if (step === 3) void prepareQuestion();
  }, [step]);

  async function finish(shareThought: boolean) {
    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const api =
        process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
      if (shareThought && answer.trim() && questionId) {
        const thoughtResponse = await fetch(`${api}/api/v1/social/thoughts/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_id: questionId,
            body: answer.trim(),
            onboarding: true,
          }),
        });
        if (!thoughtResponse.ok)
          throw new Error("Your thought could not be shared.");
      }
      const response = await fetch(`${api}/api/v1/discovery/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interests: selected,
          onboarding_completed: true,
          onboarding_question_id: questionId || null,
        }),
      });
      if (!response.ok)
        throw new Error("Your starting point could not be saved.");
      router.replace("/discover");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Your starting point could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page min-h-screen bg-[#F3F1EC] px-5 py-6 text-[#171622] sm:px-8">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="font-serif text-3xl tracking-[-.075em]">
            Duorah<span className="text-[#9B84F7]">.</span>
          </Link>
          <button
            type="button"
            onClick={() => void finish(false)}
            disabled={saving}
            className="text-sm font-semibold text-[#666372] hover:text-[#171622]"
          >
            Skip for now
          </button>
        </header>
        <div
          className="mt-8 flex gap-2"
          aria-label={`Onboarding step ${step} of 3`}
        >
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-1 flex-1 rounded-full transition-colors ${item <= step ? "bg-[#9B84F7]" : "bg-[#171622]/10"}`}
            />
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center py-14">
          {step === 1 && (
            <section className="w-full">
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Welcome to Duorah
              </p>
              <h1 className="display-heading mt-6 max-w-2xl text-6xl leading-[.92] tracking-[-.07em] sm:text-8xl">
                Meet through minds<span className="text-[#9B84F7]">.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#666372] sm:text-xl">
                Discover people through the things they think, the answers they
                give, and the conversations they start. You can stay anonymous
                until a connection feels worth opening.
              </p>
              <div className="mt-9 rounded-[24px] border border-[#171622]/10 bg-[#FAF9F5]/80 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DCD4FF] text-[#806BE4]">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#806BE4]">
                      Your Duorah identity
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {identity.display_name || "Creating your identity…"}
                    </p>
                    <p className="text-sm text-[#85818c]">
                      {identity.username
                        ? `@${identity.username}`
                        : "A private identity for public conversations"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void regenerateIdentity()}
                    disabled={regenerating || !identity.username}
                    className="ml-auto rounded-full border border-[#171622]/12 px-3 py-2 text-xs font-semibold text-[#666372] disabled:opacity-50"
                  >
                    {regenerating ? "Generating…" : "Generate another"}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="button-primary mt-10 inline-flex items-center gap-3 rounded-full bg-[#171622] px-6 py-4 text-sm font-bold text-white"
              >
                Let’s begin <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-5 flex items-center gap-2 text-xs text-[#85818c]">
                <Eye className="h-3.5 w-3.5" />
                Anonymous to start · You choose what happens next
              </p>
            </section>
          )}

          {step === 2 && (
            <section className="w-full">
              <p className="eyebrow">
                <span className="eyebrow-dot" />A little context
              </p>
              <h1 className="display-heading mt-6 text-5xl leading-[.94] tracking-[-.07em] sm:text-7xl">
                Choose what you’re curious about.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#666372]">
                Pick a few interests to help shape the thoughts and
                conversations you see. There is no wrong answer, and you can
                change this later.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {interestOptions.map(([title, description]) => {
                  const active = selected.includes(title);
                  return (
                    <button
                      type="button"
                      key={title}
                      onClick={() => toggleInterest(title)}
                      aria-pressed={active}
                      className={`group rounded-[20px] border p-5 text-left transition ${active ? "border-[#9B84F7] bg-[#DCD4FF]" : "border-[#171622]/12 bg-[#FAF9F5]/80 hover:-translate-y-0.5 hover:border-[#9B84F7]"}`}
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span>
                          <span className="block text-base font-semibold tracking-[-.02em]">
                            {title}
                          </span>
                          <span className="mt-1.5 block text-sm leading-5 text-[#666372]">
                            {description}
                          </span>
                        </span>
                        {active && (
                          <Check className="h-5 w-5 shrink-0 text-[#806BE4]" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#666372]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="button-primary inline-flex items-center gap-3 rounded-full bg-[#171622] px-6 py-4 text-sm font-bold text-white"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 text-right text-xs text-[#85818c]">
                You can skip this
              </p>
            </section>
          )}

          {step === 3 && (
            <section className="w-full">
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Your first Duorah question
              </p>
              <div className="mt-8 rounded-[30px] bg-[#171622] p-6 text-white shadow-[0_24px_70px_rgba(23,22,34,.18)] sm:p-10">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] text-[#B9A7FF]">
                  <span>A thought to begin with</span>
                  <MessageCircle className="h-4 w-4" />
                </div>
                <h1 className="mt-10 max-w-2xl font-serif text-4xl leading-[.98] tracking-[-.05em] sm:text-6xl">
                  {questionText || "Finding a question for you…"}
                </h1>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  maxLength={1000}
                  placeholder="Write your answer..."
                  aria-label="Your anonymous answer"
                  className="mt-10 min-h-36 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-base leading-7 text-white outline-none placeholder:text-white/35 focus:border-[#B9A7FF] focus:ring-4 focus:ring-[#B9A7FF]/15"
                />
                <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                  <span>Anonymous until you choose otherwise</span>
                  <span>{answer.length}/1000</span>
                </div>
              </div>
              <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#666372]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => void finish(false)}
                    disabled={saving}
                    className="px-3 py-3 text-sm font-semibold text-[#666372] hover:text-[#171622]"
                  >
                    Skip this question
                  </button>
                  <button
                    type="button"
                    onClick={() => void finish(true)}
                    disabled={saving || !answer.trim()}
                    className="button-primary inline-flex items-center justify-center gap-3 rounded-full bg-[#171622] px-6 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {saving ? "Opening Explore…" : "Share my thought"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {error && (
                <p role="alert" className="mt-5 text-sm text-[#B23B58]">
                  {error}
                </p>
              )}
              <p className="mt-5 flex items-center gap-2 text-xs text-[#85818c]">
                <Sparkles className="h-3.5 w-3.5 text-[#806BE4]" />
                This is the beginning, not a test. You can skip it and start
                exploring.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
