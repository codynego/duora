'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Building2, CheckCircle2, CircleAlert, ClipboardList, Mail, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';
import { getAdminOperations, type AdminOperations } from '@/lib/admin-api';

export type AdminTab = 'overview' | 'users' | 'businesses' | 'onboarding' | 'email' | 'support' | 'audit';

const tabs: Array<{ id: AdminTab; label: string; href: string; icon: typeof UsersRound }> = [
  { id: 'overview', label: 'Overview', href: '/operation', icon: ClipboardList },
  { id: 'users', label: 'Users', href: '/operation/users', icon: UsersRound },
  { id: 'businesses', label: 'Businesses', href: '/operation/businesses', icon: Building2 },
  { id: 'onboarding', label: 'Onboarding', href: '/operation/onboarding', icon: CheckCircle2 },
  { id: 'email', label: 'Email operations', href: '/operation/email', icon: Mail },
  { id: 'support', label: 'Support', href: '/operation/support', icon: CircleAlert },
  { id: 'audit', label: 'Audit log', href: '/operation/audit', icon: ShieldCheck },
];

function date(value: string) {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <article className="rounded-2xl border border-[#111B33]/10 bg-white p-5 shadow-[0_12px_35px_rgba(17,27,51,.05)]"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{label}</p><strong className="mt-3 block text-3xl font-black tracking-[-.06em] text-[#111B33]">{value}</strong>{note && <p className="mt-2 text-xs text-[#758096]">{note}</p>}</article>;
}

export function AdminOperationsPage({ initialTab = 'overview' }: { initialTab?: AdminTab }) {
  const router = useRouter();
  const [data, setData] = useState<AdminOperations | null>(null);
  const [tab] = useState<AdminTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try { setData(await getAdminOperations()); }
    catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Could not load admin operations.';
      setError(message);
      if (message.includes('Sign in')) router.replace('/login?next=%2Foperation');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const title = useMemo(() => tabs.find((item) => item.id === tab)?.label ?? 'Overview', [tab]);

  return <main className="min-h-screen bg-[#F5F7FB] text-[#111B33]">
    <header className="border-b border-[#111B33]/10 bg-[#111B33] px-5 py-5 text-white sm:px-8"><div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">Dorah operations</p><h1 className="mt-2 text-2xl font-black tracking-[-.06em] sm:text-3xl">Admin workspace</h1></div><div className="flex items-center gap-2"><button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-black text-white/80 hover:bg-white/10"><RefreshCw className="h-3.5 w-3.5" />Refresh</button><Link href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9F45D] px-3 text-xs font-black text-[#111B33]"><ArrowLeft className="h-3.5 w-3.5" />Dashboard</Link></div></div></header>
    <div className="mx-auto grid max-w-[1380px] gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-8">
      <nav className="flex gap-2 overflow-x-auto lg:grid lg:content-start" aria-label="Admin sections">{tabs.map(({ id, label, href, icon: Icon }) => <Link key={id} href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-black transition lg:w-full ${tab === id ? 'bg-[#111B33] text-white' : 'bg-white text-[#64708A] hover:bg-[#EEF1FF] hover:text-[#3157F5]'}`}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
      <section className="min-w-0"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Operations / {title}</p><h2 className="mt-2 text-3xl font-black tracking-[-.07em]">{title}</h2></div>{data && <p className="text-right text-xs text-[#758096]">Staff access only<br />Live snapshot</p>}</div>
        {loading && <div className="rounded-2xl border border-[#111B33]/10 bg-white p-8 text-sm text-[#64708A]">Loading operational data…</div>}
        {!loading && error && <div className="rounded-2xl border border-[#E8B4AD] bg-[#FFF4F2] p-5 text-sm text-[#8E3329]"><strong>{error}</strong><p className="mt-2 text-xs">Use a Django staff account. If access was just granted, refresh this page.</p></div>}
        {!loading && data && tab === 'overview' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Total users" value={data.overview.total_users} note={`${data.overview.new_users_7d} joined in 7 days`} /><Metric label="Active users" value={data.overview.active_users} note={`${data.overview.unverified_users} awaiting verification`} /><Metric label="Businesses" value={data.overview.businesses} note={`${data.overview.new_businesses_7d} created in 7 days`} /><Metric label="WhatsApp opt-ins" value={data.overview.whatsapp_opt_ins} note="Marketing follow-up consent" /><Metric label="Transactions" value={data.overview.transactions_7d} note="Recorded in the last 7 days" /><Metric label="Onboarding queue" value={data.onboarding.length} note="Verified users without a workspace" /><Metric label="Email provider" value={data.email.configured ? 'Ready' : 'Missing'} note={data.email.configured ? data.email.from_email : 'Configure RESEND_API_KEY'} /><Metric label="Support inbox" value={data.support.inbox_connected ? 'Connected' : 'Manual'} note={data.support.email} /></div>}
        {!loading && data && tab === 'users' && <div className="overflow-hidden rounded-2xl border border-[#111B33]/10 bg-white"><TableHeader columns={['Email', 'Status', 'Businesses', 'Joined']} />{data.users.map((user) => <div key={user.id} className="grid min-w-[620px] grid-cols-[minmax(220px,1fr)_120px_100px_130px] items-center gap-4 border-t border-[#111B33]/[.08] px-5 py-4 text-xs"><span className="font-bold">{user.email}</span><span className={user.is_active ? 'font-bold text-[#557516]' : 'font-bold text-[#B4552A]'}>{user.is_active ? 'Verified' : 'Unverified'}{user.is_staff ? ' · Staff' : ''}</span><span>{user.business_count}</span><span className="text-[#758096]">{date(user.date_joined)}</span></div>)}</div>}
        {!loading && data && tab === 'businesses' && <div className="overflow-hidden rounded-2xl border border-[#111B33]/10 bg-white"><TableHeader columns={['Business', 'Owner', 'Plan', 'Setup', 'Created']} />{data.businesses.map((business) => <div key={business.id} className="grid min-w-[760px] grid-cols-[minmax(180px,1fr)_minmax(190px,1fr)_90px_100px_130px] items-center gap-4 border-t border-[#111B33]/[.08] px-5 py-4 text-xs"><span className="font-bold">{business.name}</span><span className="text-[#64708A]">{business.owner_email}</span><span className="font-black capitalize text-[#3157F5]">{business.plan}</span><span className="capitalize text-[#64708A]">{business.setup_choice}</span><span className="text-[#758096]">{date(business.created_at)}</span></div>)}</div>}
        {!loading && data && tab === 'onboarding' && <Panel title="Verified users still to set up" description="These users can be followed up without blocking their account access.">{data.onboarding.length ? <div className="grid gap-3">{data.onboarding.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#111B33]/10 p-4"><div><strong className="text-sm">{user.email}</strong><p className="mt-1 text-xs text-[#758096]">Verified {date(user.date_joined)} · no business workspace yet</p></div><a href={`mailto:${user.email}?subject=Dorah%20workspace%20setup`} className="rounded-lg bg-[#3157F5] px-3 py-2 text-xs font-black text-white">Follow up</a></div>)}</div> : <Empty text="Everyone verified has a workspace." />}</Panel>}
        {!loading && data && tab === 'email' && <div className="grid gap-4 md:grid-cols-2"><Panel title="Resend delivery" description="Account email flows currently connected to the product."><div className="grid gap-3 text-sm"><InfoRow label="Provider" value={data.email.provider} /><InfoRow label="Sender" value={data.email.from_email} /><InfoRow label="Configuration" value={data.email.configured ? 'Ready' : 'Missing API key'} good={data.email.configured} /><InfoRow label="Delivery history" value={data.email.delivery_history_available ? 'Available' : 'Not yet tracked'} /></div></Panel><Panel title="Supported flows" description="These flows use the server-side Resend integration."><div className="flex flex-wrap gap-2">{data.email.supported_flows.map((flow) => <span key={flow} className="rounded-full bg-[#EEF1FF] px-3 py-2 text-xs font-black capitalize text-[#3157F5]">{flow.replace('_', ' ')}</span>)}</div><p className="mt-5 text-xs leading-5 text-[#758096]">Next operational improvement: store delivery IDs and failure events so failed emails can be retried from this page.</p></Panel></div>}
        {!loading && data && tab === 'support' && <Panel title="Support desk" description="A lightweight handoff until a connected support inbox is added."><div className="rounded-xl border border-[#C9F45D]/50 bg-[#F7FBEA] p-4"><p className="text-sm font-black text-[#3F541E]">Support inbox is manual</p><p className="mt-2 text-xs leading-5 text-[#557516]">{data.support.note}</p><a href={`mailto:${data.support.email}`} className="mt-4 inline-flex rounded-lg bg-[#111B33] px-4 py-2.5 text-xs font-black text-white">Open {data.support.email}</a></div></Panel>}
        {!loading && data && tab === 'audit' && <Panel title="Recent financial audit events" description="Latest transaction changes recorded by the finance service.">{data.audit.length ? <div className="grid gap-3">{data.audit.map((event) => <div key={event.id} className="rounded-xl border border-[#111B33]/10 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm capitalize">{event.action} · {event.transaction_description}</strong><span className="text-[10px] text-[#758096]">{date(event.created_at)}</span></div><p className="mt-1 text-xs text-[#64708A]">{event.business_name} · {event.actor_email}</p></div>)}</div> : <Empty text="No financial audit events yet." />}</Panel>}
      </section>
    </div>
  </main>;
}

export default function AdminPage() {
  return <AdminOperationsPage />;
}

function TableHeader({ columns }: { columns: string[] }) { const grid = columns.length === 5 ? 'grid-cols-[minmax(180px,1fr)_minmax(190px,1fr)_90px_100px_130px]' : 'grid-cols-[minmax(220px,1fr)_120px_100px_130px]'; return <div className={`grid min-w-[620px] ${grid} gap-4 bg-[#F8F9FC] px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#758096]`}>{columns.map((column) => <span key={column}>{column}</span>)}</div>; }
function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="rounded-2xl border border-[#111B33]/10 bg-white p-5 shadow-[0_12px_35px_rgba(17,27,51,.05)] sm:p-6"><h3 className="text-lg font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-[#758096]">{description}</p><div className="mt-5">{children}</div></section>; }
function InfoRow({ label, value, good }: { label: string; value: string; good?: boolean }) { return <div className="flex items-center justify-between gap-4 border-b border-[#111B33]/[.08] pb-3"><span className="text-xs text-[#758096]">{label}</span><strong className={good ? 'text-[#557516]' : 'text-right text-xs'}>{value}</strong></div>; }
function Empty({ text }: { text: string }) { return <p className="rounded-xl border border-dashed border-[#111B33]/15 p-8 text-center text-xs text-[#758096]">{text}</p>; }
