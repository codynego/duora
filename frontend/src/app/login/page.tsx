"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { logIn } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await logIn(username, password);
      const requestedPath = new URLSearchParams(window.location.search).get(
        "next",
      );
      const destination = requestedPath?.startsWith("/")
        ? requestedPath
        : "/dashboard";
      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to see your business cash, recorded activity, and items that need attention."
      footer={
        <>
          New to Dorah?{" "}
          <Link href="/signup" className="font-bold text-[#3157F5]">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-bold">
          Email address or username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="you@example.com"
            className="duora-form-input mt-2 h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 font-normal outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"
          />
        </label>
        <label className="block text-sm font-bold">
          Password
          <span className="relative mt-2 block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              className="duora-form-input h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 pr-12 font-normal outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((value) => !value)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#64708A] transition hover:text-[#111B33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3157F5]"
            >
              {passwordVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
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
          aria-busy={loading}
          className="button-primary h-12 w-full rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white shadow-[0_5px_0_rgba(49,87,245,.2)] disabled:opacity-50"
        >
          {loading ? <><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />Signing in…</> : "Sign in"}
        </button>
        <Link
          href="/forgot-password"
          className="block text-center text-xs font-black text-[#3157F5]"
        >
          Forgot password?
        </Link>
      </form>
    </AuthShell>
  );
}
