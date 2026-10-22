"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { signUp } from "@/lib/auth";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const days = Array.from({ length: 31 }, (_, index) => index + 1);
const years = Array.from({ length: 100 }, (_, index) => new Date().getFullYear() - 18 - index);

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password";
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block text-sm font-bold">
      {label}
      <span className="relative mt-2 block">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={minLength}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="duora-form-input w-full rounded-xl px-4 py-3 pr-12 font-normal outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#6F6470] transition hover:text-dark-950 focus-visible:outline-none focus-visible:text-spark-coral"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </span>
    </label>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!birthMonth || !birthDay || !birthYear) {
      setError("Add your complete date of birth to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay.padStart(2, "0")}`;
      await signUp(email, password, confirm, dateOfBirth);
      const requestedPath = new URLSearchParams(window.location.search).get(
        "next",
      );
      const destination = requestedPath?.startsWith("/i/")
        ? requestedPath
        : "/onboarding";
      router.replace(destination);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create your account.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account."
      description="Your identity stays yours. Share only what you need to get started."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-spark-coral">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm font-bold">
          Email address
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="duora-form-input mt-2 w-full rounded-xl px-4 py-3 font-normal outline-none"
          />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={10}
        />
        <PasswordField
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <label className="block text-sm font-bold">
          Date of birth
          <span className="mt-1 block text-xs font-normal text-[#6F6470]">
            Used for age verification and safety. Dorah is 18+.
          </span>
          <span className="mt-2 grid grid-cols-[1.35fr_.85fr_1fr] gap-2">
            <select value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)} required aria-label="Birth month" className="duora-form-input w-full rounded-xl px-3 py-3 font-normal outline-none">
              <option value="">Month</option>
              {months.map((month, index) => <option key={month} value={String(index + 1).padStart(2, "0")}>{month}</option>)}
            </select>
            <select value={birthDay} onChange={(event) => setBirthDay(event.target.value)} required aria-label="Birth day" className="duora-form-input w-full rounded-xl px-3 py-3 font-normal outline-none">
              <option value="">Day</option>
              {days.map((day) => <option key={day} value={String(day)}>{day}</option>)}
            </select>
            <select value={birthYear} onChange={(event) => setBirthYear(event.target.value)} required aria-label="Birth year" className="duora-form-input w-full rounded-xl px-3 py-3 font-normal outline-none">
              <option value="">Year</option>
              {years.map((year) => <option key={year} value={String(year)}>{year}</option>)}
            </select>
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#b23b58]"
          >
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="button-primary w-full rounded-full bg-[#171622] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
