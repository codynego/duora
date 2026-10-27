"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { signUp } from "@/lib/auth";

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
          className="duora-form-input h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 pr-12 font-normal outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"
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
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#64708A] transition hover:text-[#111B33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3157F5]"
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signUp(email, password, confirm);
      router.replace("/onboarding");
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
      description="Start with your email and password. You can add your business details and financial records after signup."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#3157F5]">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-bold">
          Email address
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="duora-form-input mt-2 h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 font-normal outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"
          />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={10}
        />
        <p className="-mt-3 text-[11px] leading-5 text-[#758096]">Use at least 10 characters. A password manager can help you create and store a strong one.</p>
        <PasswordField
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
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
          className="button-primary h-12 w-full rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_5px_0_rgba(49,87,245,.2)] disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
