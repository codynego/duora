"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { logIn } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        : "/home";
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
      description="Pick up where your last good conversation left off."
      footer={
        <>
          New to Duorah?{" "}
          <Link href="/signup" className="font-bold text-spark-coral">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm font-bold">
          Email address or username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="you@example.com"
            className="duora-form-input mt-2 w-full rounded-xl px-4 py-3 font-normal outline-none"
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
              className="duora-form-input w-full rounded-xl px-4 py-3 pr-12 font-normal outline-none"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((value) => !value)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#6F6470] transition hover:text-dark-950 focus-visible:outline-none focus-visible:text-spark-coral"
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
          className="button-primary w-full rounded-full bg-[#171622] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <Link
          href="/forgot-password"
          className="block text-center text-sm font-bold text-[#806BE4]"
        >
          Forgot password?
        </Link>
      </form>
    </AuthShell>
  );
}
