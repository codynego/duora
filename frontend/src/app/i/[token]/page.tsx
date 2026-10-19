"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { getAccessToken } from "@/lib/auth";

type Preview = {
  room: { title: string; duration_minutes: number };
  invited_by: string;
  creates_connection?: boolean;
  expires_at: string;
};

export default function InviteAcceptancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
  const invitePath = `/i/${token}`;

  useEffect(() => {
    async function loadPreview() {
      try {
        const authToken = await getAccessToken({ redirectOnFailure: false });
        const response = await fetch(`${api}/api/v1/rooms/invites/${encodeURIComponent(token)}/`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail ?? "This invitation is unavailable.");
        setPreview(body.data);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "This invitation is unavailable.");
      } finally {
        setLoading(false);
      }
    }
    void loadPreview();
  }, [api, token]);
  useEffect(() => {
    void getAccessToken({ redirectOnFailure: false }).then((token) =>
      setSignedIn(Boolean(token)),
    );
  }, []);

  async function accept() {
    const authToken = await getAccessToken({ redirectOnFailure: false });
    setAccepting(true);
    setError("");
    try {
      const response = await fetch(
        `${api}/api/v1/rooms/invites/${encodeURIComponent(token)}/accept/`,
        {
          method: "POST",
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(authToken ? {} : { guest_name: guestName }),
        },
      );
      const body = await response.json();
      if (!response.ok || !body.data?.room_id)
        throw new Error(body.detail ?? "This invitation is unavailable.");
      router.push(`/rooms/private/${body.data.room_id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "This invitation is unavailable.",
      );
    } finally {
      setAccepting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fffdfc] px-5 text-dark-950">
      <section className="w-full max-w-lg rounded-[30px] border border-dark-950/10 bg-white p-7 text-center shadow-[0_18px_55px_rgba(40,29,50,.08)] sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f3]">
          <LockKeyhole className="h-5 w-5 text-spark-coral" />
        </span>
        {loading ? (
          <p className="mt-7 text-sm text-[#6F6470]">
            Opening your invitation…
          </p>
        ) : preview ? (
          <>
            <p className="mt-7 section-label">Private invitation</p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-.055em]">
              {preview.invited_by} invited you to {preview.room.title}.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6F6470]">
              A private shared experience for two. Allow about{" "}
              {preview.room.duration_minutes} minutes.
            </p>
            {!signedIn && (
              <>
                <div className="mx-auto mt-7 flex max-w-sm flex-wrap justify-center gap-2">
                  <Link
                    href={`/login?next=${encodeURIComponent(invitePath)}`}
                    className="inline-flex items-center justify-center rounded-full bg-dark-950 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={`/signup?next=${encodeURIComponent(invitePath)}`}
                    className="inline-flex items-center justify-center rounded-full border border-dark-950/15 px-4 py-2.5 text-sm font-bold"
                  >
                    Create account
                  </Link>
                </div>
                <p className="mx-auto mt-4 max-w-sm text-xs leading-5 text-[#6F6470]">
                  Sign in or create an account to continue. You will return here to accept the invitation.
                </p>
                <label className="mx-auto mt-7 block max-w-sm text-left text-sm font-bold">
                  Your first name
                  <input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    maxLength={60}
                    placeholder="What should the room call you?"
                    className="mt-2 w-full rounded-xl border border-dark-950/15 px-4 py-3 font-normal outline-none focus:border-spark-coral"
                  />
                </label>
                <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-[#6F6470]">
                  Or continue as a guest. No account is required.
                </p>
              </>
            )}
            <button
              disabled={accepting || (!signedIn && !guestName.trim())}
              onClick={accept}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-70"
            >
              {accepting ? "Joining room…" : "Join private room"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-7 text-3xl font-bold tracking-[-.055em]">
              This invitation is unavailable.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6F6470]">
              It may have expired or already been used.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-dark-950 px-5 py-3 text-sm font-bold text-white"
            >
              Go to Duorah
            </Link>
          </>
        )}
        {error && (
          <p role="alert" className="mt-5 text-sm text-spark-coral">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
