"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  Link2,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import AppNav from "@/components/AppNav";
import { getAccessToken } from "@/lib/auth";

const categories = [
  {
    key: "play",
    title: "Play",
    detail: "Games, competition, guessing and challenges",
    question: "What are we playing?",
  },
  {
    key: "talk",
    title: "Talk",
    detail: "Conversation prompts, debates and getting to know people",
    question: "What do you want to talk about?",
  },
  {
    key: "together",
    title: "Do Something Together",
    detail:
      "Date planning, shared challenges, long-distance activities and memories",
    question: "What do you want to do together?",
  },
] as const;
type Category = (typeof categories)[number]["key"];

const experiences = [
  {
    key: "most-likely-to",
    title: "Most Likely To",
    category: "play",
    detail: "Funny group voting, surprising reveals, and lighthearted banter.",
    flow: "Everyone votes privately, results reveal together, and reactions fly.",
    limit: 6,
    duration: "12 minutes",
  },
  {
    key: "truth-or-dare",
    title: "Truth or Dare",
    category: "play",
    detail: "Take on bold challenges or truths with zero-pressure skip controls.",
    flow: "Choose truth or dare, complete or pass safely, and take turns.",
    limit: 6,
    duration: "15 minutes",
  },
  {
    key: "guess-my-answer",
    title: "Guess My Answer",
    category: "play",
    detail: "Test how well you know someone by predicting their answers.",
    flow: "One person answers privately, others predict, and matches reveal.",
    limit: 4,
    duration: "10 minutes",
  },
  {
    key: "word-battle",
    title: "Word Battle",
    category: "play",
    detail: "Fast-paced word associations, prompt battles, and live scores.",
    flow: "Quick rounds with instant input validation, timers, and scores.",
    limit: 4,
    duration: "8 minutes",
  },
  {
    key: "build-a-story",
    title: "Build a Story",
    category: "play",
    detail: "Collaborative storytelling where everyone adds one sentence.",
    flow: "Take turns adding lines to a shared canvas and enjoy the finished tale.",
    limit: 6,
    duration: "12 minutes",
  },
  {
    key: "open-conversation",
    title: "Open Conversation",
    category: "talk",
    detail: "Calm, editorial topic discussion with no scores or timer pressure.",
    flow: "Discuss freely at your own pace. Anyone can suggest an angle or change topics.",
    limit: 6,
    duration: "15 minutes",
  },
  {
    key: "guided-conversation",
    title: "Guided Conversation",
    category: "talk",
    detail: "A question journey with subtle progress and simultaneous reveals.",
    flow: "Answer privately or verbally, reveal together, and follow deep-dive prompts.",
    limit: 4,
    duration: "15 minutes",
  },
  {
    key: "debate",
    title: "Debate",
    category: "talk",
    detail: "Private stance voting, group reveals, and exploring different views.",
    flow: "Read the statement, pick a stance privately, reveal together, and argue your take.",
    limit: 6,
    duration: "12 minutes",
  },
  {
    key: "quick-takes",
    title: "Quick Takes",
    category: "talk",
    detail: "Fast single-tap reactions and rapid-fire opinions on bold statements.",
    flow: "Quick single-tap reactions, instant breakdown bars, and fast next-take pacing.",
    limit: 6,
    duration: "8 minutes",
  },
  {
    key: "plan-something-together",
    title: "Plan Something Together",
    category: "together",
    detail: "Compare time, budget, and mood to find overlapping date ideas.",
    flow: "Both choose privately, Duora highlights overlap, and saves your date.",
    limit: 2,
    duration: "10 minutes",
  },
  {
    key: "shared-challenges",
    title: "Shared Challenges",
    category: "together",
    detail: "Complete fun, shared mini-goals and track joint progress together.",
    flow: "Choose a challenge, complete tasks, and celebrate finishing together.",
    limit: 2,
    duration: "15 minutes",
  },
  {
    key: "date-night-anywhere",
    title: "Date Night Anywhere",
    category: "together",
    detail: "A curated 3-part date: playful warm-up, honest talk, and a keepsake.",
    flow: "Designed for two people in person or remote to connect deeply.",
    limit: 2,
    duration: "20 minutes",
  },
] as const;

export default function CreateExperiencePage() {
  return (
    <Suspense fallback={<CreateExperienceLoading />}>
      <CreateExperienceFlow />
    </Suspense>
  );
}

function CreateExperienceFlow() {
  const router = useRouter();
  const search = useSearchParams();
  const selectedByUrl = experiences.find(
    (item) => item.key === search.get("experience"),
  );
  const queryCategory = search.get("category");
  const initialCategory: Category =
    selectedByUrl?.category ??
    (categories.some((item) => item.key === queryCategory)
      ? (queryCategory as Category)
      : "play");
  const [category, setCategory] = useState<Category>(initialCategory);
  const [selected, setSelected] = useState(() =>
    Math.max(
      0,
      experiences.findIndex(
        (item) =>
          selectedByUrl ? item.key === selectedByUrl.key : item.category === initialCategory,
      ),
    ),
  );
  const [step, setStep] = useState(selectedByUrl ? 3 : 1);
  const [talkTopic, setTalkTopic] = useState("");
  const [talkDescription, setTalkDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [tone, setTone] = useState("Easygoing");
  const [audience, setAudience] = useState("adults");
  const [maxMembers, setMaxMembers] = useState(2);
  const [city, setCity] = useState("");
  const [startMode, setStartMode] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const experience = experiences[selected];
  const family = categories.find((item) => item.key === category)!;
  const choices = experiences.filter((item) => item.category === category);
  const capacities = [2, 4, 6].filter((value) => value <= experience.limit);
  const totalSteps =
    category === "together"
      ? 3
      : visibility === "public"
        ? category === "talk"
          ? 6
          : 5
        : 4;
  const stepName =
    step === 1
      ? "Choose an experience family"
      : step === 2
        ? `Choose a ${family.title.toLowerCase()} experience`
        : step === 3 && category === "together"
          ? "Invite your person"
        : step === 3 && category === "talk"
          ? "Set the conversation"
          : step === 3
            ? "Room type"
            : step === 4 && category === "talk"
              ? "Room type"
            : step === totalSteps
              ? "Review"
              : "Room details";
  const scheduleLabel = startMode === "now" ? "Starts now" : scheduledDate && scheduledTime ? `${scheduledDate} at ${scheduledTime}` : "Schedule not set";

  function chooseExperience(index: number) {
    setSelected(index);
    setMaxMembers(Math.min(maxMembers, experiences[index].limit));
  }
  function chooseCategory(next: Category) {
    const index = experiences.findIndex((item) => item.category === next);
    setCategory(next);
    chooseExperience(index);
    if (next === "together") {
      setVisibility("private");
      setMaxMembers(2);
    }
    setStep(2);
    router.replace(`/experiences/create?category=${next}`);
  }
  function chooseExperienceAndContinue(index: number) {
    chooseExperience(index);
    setStep(category === "talk" ? 3 : 3);
  }
  async function createRoom() {
    const token = await getAccessToken();
    if (!token) {
      setError("Sign in to create an experience.");
      return;
    }
    if (category === "talk" && (!talkTopic.trim() || !talkDescription.trim())) {
      setError("Add a topic and a short discussion description first.");
      setStep(3);
      return;
    }
    if (startMode === "scheduled" && (!scheduledDate || !scheduledTime)) {
      setError("Choose a date and time for the scheduled room.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const api =
        process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
      const details =
        category === "talk"
          ? {
              topic: talkTopic.trim(),
              discussion_description: talkDescription.trim(),
            }
          : {};
      const schedule = startMode === "scheduled"
        ? { starts_at: new Date(`${scheduledDate}T${scheduledTime}`).toISOString() }
        : {};
      const body =
        visibility === "private"
          ? { experience: experience.key, ...details, ...schedule }
          : {
              experience: experience.key,
              tone,
              audience,
              max_members: maxMembers,
              city,
              ...details,
              ...schedule,
            };
      const response = await fetch(
        `${api}/api/v1/rooms/${visibility === "private" ? "private" : "public"}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.detail ??
            Object.values(data).flat().join(" ") ??
            "Could not create this experience.",
        );
      if (visibility === "private") {
        const inviteToken = data?.data?.invite?.token;
        if (!inviteToken)
          throw new Error("The invite link could not be created.");
        setInviteUrl(`${window.location.origin}/i/${inviteToken}`);
      } else router.push("/discover");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not create this experience.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6470]"
        >
          <ArrowLeft className="h-4 w-4" />
          Experiences
        </Link>
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <p className="section-label">Create an experience</p>
            <p className="text-xs font-bold text-[#6F6470]">
              Step {step} of {totalSteps}
            </p>
          </div>
          <div
            className="mt-3 grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalSteps }, (_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full ${index + 1 <= step ? "bg-spark-coral" : "bg-dark-950/10"}`}
              />
            ))}
          </div>
          <h1 className="mt-7 text-3xl font-bold tracking-[-.06em] sm:text-5xl">
            {stepName}
          </h1>
        </section>
        <section className="mt-8 rounded-[30px] border border-dark-950/10 bg-white p-5 shadow-[0_16px_50px_rgba(40,29,50,.06)] sm:p-8">
          {step === 1 && (
            <>
              <p className="max-w-lg text-sm leading-6 text-[#6F6470]">What kind of moment do you want to make?</p>
              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {categories.map((item) => (
                  <button key={item.key} onClick={() => chooseCategory(item.key)} className="rounded-2xl border border-dark-950/10 p-4 text-left transition hover:border-spark-coral hover:bg-[#fffaf8]">
                    <b className="block text-sm">{item.title}</b><span className="mt-1 block text-xs leading-5 text-[#6F6470]">{item.detail}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && category === "talk" && (
            <>
              <p className="max-w-lg text-sm leading-6 text-[#6F6470]">Give the room a clear subject so everyone knows what they are stepping into.</p>
              <div className="mt-7 grid gap-5">
                <label className="text-sm font-bold">Discussion topic<input value={talkTopic} onChange={(event) => setTalkTopic(event.target.value)} maxLength={120} placeholder="e.g. What does a good life look like to you?" className="mt-2 w-full rounded-xl border border-dark-950/12 px-3 py-3 text-sm font-medium outline-none focus:border-spark-coral" /></label>
                <label className="text-sm font-bold">Discussion description<span className="mt-1 block text-xs font-normal text-[#6F6470]">This appears in the room intro and helps people decide how to join in.</span><textarea value={talkDescription} onChange={(event) => setTalkDescription(event.target.value)} maxLength={500} rows={5} placeholder="Share the angle, boundaries, or context for the conversation…" className="mt-2 w-full resize-none rounded-xl border border-dark-950/12 px-3 py-3 text-sm font-medium leading-6 outline-none focus:border-spark-coral" /></label>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-[#6F6470]">← Change family</button>
              <p className="mt-5 text-[10px] font-bold tracking-[.14em] text-spark-coral">{family.title.toUpperCase()}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">{family.question}</h2>
              <div className="mt-4 grid gap-2 sm:gap-2.5">
                {choices.map((item) => {
                  const index = experiences.indexOf(item);
                  return (
                    <button
                      key={item.key}
                      onClick={() => chooseExperienceAndContinue(index)}
                      className="group rounded-2xl border border-dark-950/10 px-4 py-3 text-left transition hover:border-spark-coral hover:bg-[#fffaf8] sm:px-5 sm:py-3.5"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span className="min-w-0">
                          <b className="block text-sm font-bold tracking-tight text-dark-950">
                            {item.title}
                          </b>
                          <span className="mt-0.5 block text-xs leading-relaxed text-[#6F6470]">
                            {item.detail}
                          </span>
                          <span className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-spark-coral">
                            <UsersRound className="h-3 w-3" />
                            Up to {item.limit} people · {item.duration}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-spark-coral/60 transition group-hover:translate-x-0.5 group-hover:text-spark-coral" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {step === 3 && category === "together" && (
            <>
              <p className="max-w-lg text-sm leading-6 text-[#6F6470]">
                Together is an intimate format designed exclusively for two people.
              </p>
              <div className="mt-7 rounded-2xl border border-spark-coral/20 bg-[#fff9fa] p-6">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-spark-coral/10 text-spark-coral">
                    <LockKeyhole className="h-6 w-6" />
                  </span>
                  <div>
                    <b className="block text-sm font-bold text-dark-950">Private 1-on-1 Invitation</b>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[#6F6470]">
                      Only the person who receives your link can join. Together rooms are strictly for 2 people and are never listed publicly in Discover.
                    </span>
                  </div>
                </div>
              </div>
              <ScheduleFields mode={startMode} setMode={setStartMode} date={scheduledDate} setDate={setScheduledDate} time={scheduledTime} setTime={setScheduledTime} />
              <div className="mt-8 flex justify-end">
                <button
                  disabled={creating}
                  onClick={createRoom}
                  className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-6 py-3 text-sm font-bold text-white transition hover:bg-spark-flame disabled:opacity-50"
                >
                  {creating ? "Creating invite…" : "Generate private invite link"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
          {((step === 3 && category !== "talk" && category !== "together") || (step === 4 && category === "talk")) && (
            <>
              <p className="max-w-lg text-sm leading-6 text-[#6F6470]">
                Choose who can find this room.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <button
                  onClick={() => setVisibility("private")}
                  className={`group rounded-2xl border px-4 py-3.5 text-left transition ${
                    visibility === "private"
                      ? "border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral"
                      : "border-dark-950/10 bg-white hover:border-dark-950/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-spark-coral/10 text-spark-coral">
                      <LockKeyhole className="h-4 w-4" />
                    </span>
                    <b className="text-sm font-bold text-dark-950">Private invitation</b>
                  </div>
                  <span className="mt-2 block text-xs leading-relaxed text-[#6F6470]">
                    Create one private link for someone you choose.
                  </span>
                </button>
                <button
                  onClick={() => setVisibility("public")}
                  className={`group rounded-2xl border px-4 py-3.5 text-left transition ${
                    visibility === "public"
                      ? "border-spark-coral bg-[#fff0f3] ring-1 ring-spark-coral"
                      : "border-dark-950/10 bg-white hover:border-dark-950/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-spark-coral/10 text-spark-coral">
                      <Globe2 className="h-4 w-4" />
                    </span>
                    <b className="text-sm font-bold text-dark-950">Public room</b>
                  </div>
                  <span className="mt-2 block text-xs leading-relaxed text-[#6F6470]">
                    Publish a small room where people can find it in Discover.
                  </span>
                </button>
              </div>
              <ScheduleFields mode={startMode} setMode={setStartMode} date={scheduledDate} setDate={setScheduledDate} time={scheduledTime} setTime={setScheduledTime} />
            </>
          )}
          {((step === 4 && category !== "talk") || (step === 5 && category === "talk")) && visibility === "public" && (
            <>
              <p className="max-w-lg text-sm leading-6 text-[#6F6470]">
                Set a few boundaries so the right people know what they are
                joining.
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  Tone
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-dark-950/12 bg-white px-3 py-2.5 text-sm font-medium"
                  >
                    <option>Easygoing</option>
                    <option>Playful</option>
                    <option>Thoughtful</option>
                    <option>Flirty</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Audience
                  <select
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-dark-950/12 bg-white px-3 py-2.5 text-sm font-medium"
                  >
                    <option value="adults">Adults (18+)</option>
                    <option value="all">Everyone</option>
                  </select>
                </label>
                <div>
                  <p className="text-sm font-bold">Maximum people</p>
                  <div className="mt-2 flex gap-2">
                    {capacities.map((capacity) => (
                      <button
                        key={capacity}
                        onClick={() => setMaxMembers(capacity)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${maxMembers === capacity ? "bg-dark-950 text-white" : "bg-dark-950/5 text-[#6F6470]"}`}
                      >
                        {capacity}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="text-sm font-bold">
                  City{" "}
                  <span className="font-normal text-[#6F6470]">optional</span>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    maxLength={100}
                    placeholder="Online or your city"
                    className="mt-2 w-full rounded-xl border border-dark-950/12 px-3 py-2.5 text-sm font-medium"
                  />
                </label>
              </div>
            </>
          )}
          {step === totalSteps && (
            <>
              <p className="text-sm leading-6 text-[#6F6470]">
                Check the room before it is created.
              </p>
              <div className="mt-7 divide-y divide-dark-950/8 rounded-2xl border border-dark-950/10">
                <Row label="Experience" value={experience.title} />
                <Row label="Experience family" value={family.title} />
                <Row label="When" value={scheduleLabel} />
                <div className="p-4">
                  <span className="text-sm text-[#6F6470]">What happens</span>
                  <p className="mt-1 text-sm leading-6">{experience.flow}</p>
                </div>
                <Row
                  label="Room type"
                  value={
                    visibility === "private"
                      ? "Private invitation"
                      : "Public room"
                  }
                />
                {visibility === "public" && (
                  <>
                    <Row label="Tone" value={tone} />
                    <Row
                      label="Audience"
                      value={
                        audience === "adults" ? "Adults (18+)" : "Everyone"
                      }
                    />
                    <Row label="Capacity" value={`${maxMembers} people`} />
                  </>
                )}
              </div>
              {visibility === "public" && (
                <p className="mt-5 rounded-2xl bg-[#fff8dc] p-4 text-sm leading-6 text-[#7a5b19]">
                  This room will appear in Discover once published.
                </p>
              )}
            </>
          )}
          {inviteUrl && (
            <div className="mt-7 rounded-2xl bg-dark-950 p-5 text-white">
              <p className="text-xs font-bold tracking-[.14em] text-spark-rose">
                PRIVATE LINK READY
              </p>
              <p className="mt-2 break-all text-sm">{inviteUrl}</p>
              <button
                onClick={() => navigator.clipboard?.writeText(inviteUrl)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-spark-coral px-4 py-2.5 text-sm font-bold"
              >
                <Link2 className="h-4 w-4" />
                Copy link
              </button>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-5 text-sm text-spark-coral">
              {error}
            </p>
          )}
          <footer className="mt-8 flex items-center justify-between gap-3 border-t border-dark-950/8 pt-5">
            {step > 1 ? (
              <button
                onClick={() => {
                  setError("");
                  setStep((current) => Math.max(1, current - 1));
                }}
                className="rounded-full px-4 py-2.5 text-sm font-bold text-[#6F6470]"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < totalSteps ? (
              <button
                onClick={() => {
                  setError("");
                  setStep((current) => Math.min(totalSteps, current + 1));
                }}
                className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              !inviteUrl && (
                <button
                  disabled={creating}
                  onClick={createRoom}
                  className="inline-flex items-center gap-2 rounded-full bg-spark-coral px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {creating
                    ? "Creating…"
                    : visibility === "public"
                      ? "Publish to Discover"
                      : "Create private link"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            )}
          </footer>
        </section>
      </main>
    </div>
  );
}

function CreateExperienceLoading() {
  return (
    <div className="min-h-screen bg-[#fffdfc] text-dark-950 md:pl-[244px]">
      <AppNav />
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12 md:pb-14">
        <div className="h-4 w-24 animate-pulse rounded bg-dark-950/10" />
        <div className="mt-10 h-12 max-w-md animate-pulse rounded-2xl bg-dark-950/10" />
        <div className="mt-8 h-72 animate-pulse rounded-[30px] bg-dark-950/5" />
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <span className="text-sm text-[#6F6470]">{label}</span>
      <b className="text-right text-sm">{value}</b>
    </div>
  );
}

function ScheduleFields({ mode, setMode, date, setDate, time, setTime }: { mode: "now" | "scheduled"; setMode: (value: "now" | "scheduled") => void; date: string; setDate: (value: string) => void; time: string; setTime: (value: string) => void }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <div className="mt-7 rounded-2xl border border-dark-950/8 bg-[#fffaf8] p-4"><p className="text-sm font-bold">When should it happen?</p><p className="mt-1 text-xs leading-5 text-[#6F6470]">Start right away or give people time to plan.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setMode("now")} className={`rounded-xl border px-3 py-3 text-left text-sm font-bold ${mode === "now" ? "border-spark-coral bg-[#fff0f3]" : "border-dark-950/10 bg-white"}`}>Start now<span className="mt-1 block text-xs font-normal text-[#6F6470]">Open as soon as it is created.</span></button><button type="button" onClick={() => setMode("scheduled")} className={`rounded-xl border px-3 py-3 text-left text-sm font-bold ${mode === "scheduled" ? "border-spark-coral bg-[#fff0f3]" : "border-dark-950/10 bg-white"}`}>Schedule for later<span className="mt-1 block text-xs font-normal text-[#6F6470]">Everyone sees the planned start.</span></button></div>{mode === "scheduled" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Date<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-dark-950/12 bg-white px-3 py-2.5 text-sm font-medium" /></label><label className="text-xs font-bold">Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1.5 w-full rounded-xl border border-dark-950/12 bg-white px-3 py-2.5 text-sm font-medium" /><span className="mt-1 block font-normal text-[#6F6470]">Timezone: {timezone}</span></label></div>}</div>;
}
