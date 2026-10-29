"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { confirmPasswordReset } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUid(params.get("uid") ?? "");
    setToken(params.get("token") ?? "");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await confirmPasswordReset(uid, token, password, confirmation);
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reset your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Choose a new password." description="Use a strong password you do not reuse elsewhere." footer={<Link href="/login" className="font-black text-[#3157F5]">Back to sign in</Link>}>
      {done ? (
        <div className="mt-8 rounded-2xl border border-[#A5CD4A] bg-[#F2FADA] p-5 text-sm leading-6 text-[#496436]">Your password has been reset. <Link href="/login" className="font-black underline">Sign in to Dorah</Link>.</div>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-[#536078]">New password<span className="relative mt-2 block"><input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} type={visible ? "text" : "password"} autoComplete="new-password" className="duora-form-input h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 pr-12 font-normal text-[#111B33] outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /><button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 w-11 text-[#64708A]">{visible ? <EyeOff className="mx-auto h-4 w-4" /> : <Eye className="mx-auto h-4 w-4" />}</button></span></label>
          <label className="block text-sm font-bold text-[#536078]">Confirm password<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={10} type={visible ? "text" : "password"} autoComplete="new-password" className="duora-form-input mt-2 h-12 w-full rounded-xl border-[#111B33]/15 bg-white px-4 font-normal text-[#111B33] outline-none transition focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>
          {error && <p role="alert" className="rounded-xl bg-[#FFF0F0] p-3 text-sm text-[#A4362B]">{error}</p>}
          <button disabled={saving || !uid || !token} className="button-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3157F5] px-5 text-sm font-black text-white disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{saving ? "Saving…" : "Reset password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
