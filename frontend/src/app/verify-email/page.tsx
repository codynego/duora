"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { resendVerification, verifyEmail } from "@/lib/auth";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "verified" | "error">("checking");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
    const uid = params.get("uid");
    const token = params.get("token");
    if (!uid || !token) {
      setStatus("ready");
      return;
    }
    verifyEmail(uid, token)
      .then(() => {
        setStatus("verified");
        setMessage("Your email is verified. Your Dorah workspace is ready to set up.");
      })
      .catch((reason) => {
        setStatus("error");
        setMessage(reason instanceof Error ? reason.message : "This verification link is invalid or expired.");
      });
  }, []);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    try {
      await resendVerification(email);
      setMessage("If that email has an unverified Dorah account, a new link is on its way.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not resend the verification email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthShell
      title={status === "verified" ? "You’re verified." : "Check your inbox."}
      description="We use email verification to keep your account and financial workspace secure."
      footer={<Link href="/login" className="font-black text-[#3157F5]">Back to sign in</Link>}
    >
      <div className="mt-8 rounded-2xl border border-[#111B33]/10 bg-white p-5 shadow-[0_16px_40px_rgba(17,27,51,.06)]">
        {status === "checking" ? (
          <div className="flex items-center gap-3 text-sm text-[#64708A]"><LoaderCircle className="h-5 w-5 animate-spin text-[#3157F5]" />Checking your link…</div>
        ) : status === "verified" ? (
          <>
            <MailCheck className="h-8 w-8 text-[#3157F5]" />
            <p className="mt-4 text-sm leading-6 text-[#536078]">{message}</p>
            <Link href="/onboarding" className="button-primary mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white">Set up my workspace</Link>
          </>
        ) : (
          <>
            <p className="text-sm leading-6 text-[#536078]">{message || "We sent a verification link to your email. Open it to activate your account."}</p>
            <form onSubmit={(event) => void resend(event)} className="mt-6 space-y-4">
              <label className="block text-sm font-bold text-[#536078]">Email address<input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="duora-form-input mt-2 h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 font-normal text-[#111B33] outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>
              <button disabled={sending} className="button-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white disabled:opacity-50">{sending && <LoaderCircle className="h-4 w-4 animate-spin" />}{sending ? "Sending…" : "Resend verification email"}</button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
