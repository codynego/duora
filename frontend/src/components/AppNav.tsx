"use client";

import Link from "next/link";
import { Bell, Clock3, Compass, Heart, MessageCircle, Search, UserPlus, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AutoMatchRequestNotice from "@/components/AutoMatchRequestNotice";
import { useCurrentUser } from "@/lib/current-user";
import { getAccessToken } from "@/lib/auth";

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";

const navigation = [
  { label: "Overview", href: "/home", icon: Compass },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Moments", href: "/moments", icon: Search },
  { label: "Connections", href: "/connections", icon: MessageCircle },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export default function AppNav({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const { user, ready } = useCurrentUser();
  const displayName = user?.display_name ?? "";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <>
      <header className="app-nav-mobile sticky top-0 z-[60] flex h-[68px] items-center justify-between border-b border-[#292630]/10 bg-[#F7F5F0]/95 px-5 md:hidden">
        <Link
          href="/home"
          className="font-serif text-[28px] tracking-[-.075em] text-[#292630]"
        >
          Dorah<span className="text-[#7454A6]">.</span>
        </Link>
        <div className="flex items-center gap-3">
          {!minimal && (
            <NotificationBell />
          )}
          <Link
            href={user ? "/profile" : "/login"}
            aria-label={user ? "Your profile" : "Sign in"}
            className="grid h-9 min-w-9 place-items-center rounded-full bg-[#292630] px-2 text-xs font-bold text-white"
          >
            {ready && user ? initial : ready ? "→" : "·"}
          </Link>
        </div>
      </header>
      <aside className="app-nav-desktop fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-[#292630]/10 bg-[#F7F5F0] px-4 py-7 md:flex">
        <Link
          href="/home"
          className="px-3 font-serif text-3xl tracking-[-.075em] text-[#292630]"
        >
          Dorah<span className="text-[#7454A6]">.</span>
        </Link>
        <div className="mt-4 px-3">
          <NotificationBell />
        </div>
        <nav className="mt-7 space-y-1" aria-label="Primary navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/home"
                ? pathname === "/home"
                : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-[#E9E1F1] text-[#292630]" : "text-[#6E6975] hover:bg-[#292630]/[.045] hover:text-[#292630]"}`}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <section
          className="mt-auto rounded-2xl bg-[#E9E1F1] p-4"
          aria-label="Moments invitation"
        >
          <SparkleMark />
          <p className="mt-3 text-sm font-bold tracking-[-.02em] text-[#292630]">
            Find a thought that stays.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#6E6975]">
            Your next connection can start with curiosity.
          </p>
          <Link
            href="/moments"
            className="mt-4 inline-flex text-xs font-bold text-[#7454A6] transition hover:text-[#553781]"
          >
            Open Moments →
          </Link>
        </section>
        <Link
          href={user ? "/profile" : "/login"}
          className="mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#292630] transition hover:bg-[#292630]/[.045]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#292630] text-xs font-bold text-white">
            {ready && user ? initial : "→"}
          </span>
          <span className="flex-1 truncate">
            {ready && user ? displayName : ready ? "Sign in" : "Loading…"}
          </span>
          <UserRound className="h-4 w-4 text-[#6E6975]" strokeWidth={1.8} />
        </Link>
      </aside>
      <nav
        className="app-nav-mobile fixed inset-x-0 bottom-0 z-50 border-t border-[#292630]/10 bg-[#F7F5F0]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/home"
                ? pathname === "/home"
                : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${active ? "text-[#7454A6]" : "text-[#6E6975] hover:text-[#292630]"}`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <AutoMatchRequestNotice enabled={ready && Boolean(user)} />
    </>
  );
}

function SparkleMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-[#7454A6]">
      <span className="text-lg">✦</span>
    </span>
  );
}

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  created_at: string;
};

function NotificationBell() {
  const { user, ready } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!ready || !user) {
      setItems([]);
      setUnread(0);
      return;
    }
    const token = await getAccessToken({ redirectOnFailure: false });
    if (!token) return;
    const response = await fetch(`${api}/api/v1/auth/notifications/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    const body = await response.json();
    setItems(body.data ?? []);
    setUnread(body.unread_count ?? 0);
  }, [ready, user]);

  useEffect(() => {
    void loadNotifications();
    if (!ready || !user) return;
    const interval = window.setInterval(() => void loadNotifications(), 30_000);
    const refreshOnFocus = () => void loadNotifications();
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loadNotifications, ready, user]);

  async function markRead(id?: string) {
    const token = await getAccessToken();
    if (!token) return;
    await fetch(
      `${api}/api/v1/auth/notifications/${id ? `${id}/read/` : "read-all/"}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    if (id) {
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
      setUnread((current) => Math.max(0, current - 1));
    } else {
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnread(0);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        onClick={() => {
          setOpen((current) => !current);
          if (!open) void loadNotifications();
        }}
        className="relative grid h-10 w-10 place-items-center rounded-full text-[#292630] transition hover:bg-[#E9E1F1]"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#9A3650] px-1 py-0.5 text-center text-[9px] font-bold leading-3 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed bottom-[76px] left-4 right-4 top-[76px] z-50 flex max-h-none w-auto flex-col overflow-hidden rounded-[24px] border border-[#292630]/10 bg-white shadow-[0_24px_70px_rgba(41,38,48,.16)] md:absolute md:bottom-auto md:left-0 md:right-auto md:top-12 md:max-h-[calc(100dvh-40px)] md:w-[min(390px,calc(100vw-32px))]">
          <div className="border-b border-[#292630]/10 bg-[#F7F5F0] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="dashboard-kicker"><span />Your activity</p>
                <p className="mt-2 text-lg font-bold tracking-[-.03em]">Notifications</p>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && <span className="rounded-full bg-[#E9E1F1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#7454A6]">{unread} new</span>}
                <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-[#6E6975] transition hover:bg-white hover:text-[#292630] md:hidden" aria-label="Close notifications">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {unread > 0 && <button type="button" onClick={() => void markRead()} className="mt-3 text-xs font-semibold text-[#7454A6] hover:text-[#553781]">Mark all as read</button>}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {items.length ? items.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => void markRead(item.id)} className={`flex gap-3 rounded-2xl p-3 transition hover:bg-[#F7F5F0] ${item.read ? "" : "bg-[#F1EAF6]"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${item.read ? "bg-[#F7F5F0] text-[#958F9B]" : "bg-white text-[#7454A6]"}`}>
                  <NotificationIcon kind={item.kind} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-[#292630]">{item.title}</span>
                    {!item.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7454A6]" />}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#6E6975]">{item.body}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#958F9B]"><Clock3 className="h-3 w-3" />{formatNotificationTime(item.created_at)}</span>
                </span>
              </Link>
            )) : <div className="px-4 py-10 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#E9E1F1] text-[#7454A6]"><Bell className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold">Nothing new yet</p><p className="mt-1 text-xs leading-5 text-[#958F9B]">Replies and connection activity will appear here.</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ kind }: { kind: string }) {
  if (kind === "reply") return <MessageCircle className="h-4 w-4" />;
  if (kind === "connection_request" || kind === "connection_accepted") return <UserPlus className="h-4 w-4" />;
  if (kind === "identity_reveal") return <Heart className="h-4 w-4" />;
  return <MessageCircle className="h-4 w-4" />;
}

function formatNotificationTime(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
