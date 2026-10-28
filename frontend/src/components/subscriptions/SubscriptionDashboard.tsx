'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DorahLogo from '@/components/DorahLogo';
import { type FormEvent, useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, BellRing, Check, ChevronDown, CircleAlert, CircleDollarSign, CircleHelp, LayoutDashboard, MessageCircle, MoreHorizontal, Plus, ReceiptText, Settings, ShieldCheck, Sparkles, UserRound, UsersRound, WalletCards, X } from 'lucide-react';
import { useCurrentUser } from '@/lib/current-user';
import { getFinancialOnboardingProfile, type FinancialOnboardingProfile } from '@/lib/financial-onboarding';
import { createFinanceContact, createFinanceObligation, createFinanceTransaction, getFinanceWorkspace, parseFinanceTransaction, type FinanceOverview, type FinanceWorkspace, type TransactionDraft, getBusinesses, getFinanceOverview } from '@/lib/finance-api';
import DashboardSectionContent, { TransactionDetailsModal, type DashboardSection } from './DashboardSectionContent';
import FinanceQuickCreate from './FinanceQuickCreate';

function formatMoneyInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimals] = cleaned.split('.');
  const fraction = decimals.join('').slice(0, 2);
  const grouped = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction.length ? `${grouped || '0'}.${fraction}` : grouped;
}

const workspaceItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Intelligence', href: '/dashboard/intelligence', icon: Sparkles },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ReceiptText },
  { label: 'Cash & Accounts', href: '/dashboard/cash-accounts', icon: WalletCards },
  { label: 'Customer balances', href: '/dashboard/receivables', icon: CircleDollarSign },
  { label: 'Supplier bills', href: '/dashboard/payables', icon: ReceiptText },
  { label: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
  { label: 'Customers & Suppliers', href: '/dashboard/customers-suppliers', icon: UsersRound },
];
const preferenceItems = [
  { label: 'Help', href: '/help', icon: CircleHelp },
  { label: 'Profile', href: '/dashboard/profile', icon: UserRound },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

type PreviewTransaction = { transactionId?: string; date: string; dateKey?: string; time?: string; title: string; detail: string; amount: number; direction: 'in' | 'out' | 'transfer'; category?: string; accountId?: string | null; accountName?: string | null; contactId?: string | null; contactName?: string | null };
const initialTransactions: PreviewTransaction[] = [
  { date: 'Oct 27', dateKey: '2026-10-27', title: 'Shoprite supplies', detail: 'Stock purchase', amount: 86_500, direction: 'out' },
  { date: 'Oct 26', dateKey: '2026-10-26', title: 'Amina Bello', detail: 'Customer payment', amount: 120_000, direction: 'in' },
  { date: 'Oct 25', dateKey: '2026-10-25', title: 'Lagos Water', detail: 'Utility bill', amount: 18_000, direction: 'out' },
  { date: 'Oct 24', dateKey: '2026-10-24', title: 'Walk-in sales', detail: 'Sales received', amount: 245_000, direction: 'in' },
];

function SampleTag() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-[#3157F5]/15 bg-[#EEF1FF] px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#3157F5]">Sample data</span>;
}

function Brand({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return <DorahLogo light={light} className={className} />;
}

function DashboardLoading() {
  return <main className="min-h-screen bg-[#F5F7FB] p-5 text-[#111B33] sm:p-8"><DorahLogo /><div className="mx-auto mt-16 grid max-w-6xl gap-5"><div className="h-3 w-36 animate-pulse rounded-full bg-[#DDE4F5]" /><div className="h-16 w-full max-w-2xl animate-pulse rounded-xl bg-[#E7EBF5]" /><div className="grid gap-4 sm:grid-cols-3"><div className="h-32 animate-pulse rounded-xl bg-white" /><div className="h-32 animate-pulse rounded-xl bg-white" /><div className="h-32 animate-pulse rounded-xl bg-white" /></div><p className="text-xs font-bold text-[#758096]">Loading your saved business records…</p></div></main>;
}

function FinanceAssistantCard({ financeOverview, workspace, formatAmount }: { financeOverview: FinanceOverview | null; workspace: FinanceWorkspace | null; formatAmount: (amount: number) => string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = workspace?.obligations.filter((item) => item.kind === 'receivable' && item.status !== 'settled' && item.due_date && new Date(`${item.due_date}T00:00:00`) < today) ?? [];
  const overdueTotal = overdue.reduce((sum, item) => sum + Number(item.balance), 0);
  const live = Boolean(financeOverview);
  return <article id="assistant" className="rounded-xl border border-[#111B33] bg-[#111B33] p-5 text-white sm:p-6"><header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#C9F45D]">Dorah / Finance assistant</p><h2 className="mt-2 text-xl font-black tracking-[-.045em]">A useful place to start.</h2></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#C9F45D]"><MessageCircle className="h-5 w-5" /></span></header><div className="mt-5 border border-white/10 bg-white/[.05] p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#C9F45D]" />{live ? <span className="text-[10px] font-black uppercase tracking-[.08em] text-[#C9F45D]">Saved records</span> : <SampleTag />}</div><p className="mt-3 text-sm leading-6 text-white/85">{live ? overdue.length ? `${overdue.length} customer balance${overdue.length === 1 ? '' : 's'} ${overdue.length === 1 ? 'is' : 'are'} overdue, totaling ${formatAmount(overdueTotal)}. Review the due dates and recent payment activity.` : 'No overdue customer balances found in your saved records.' : `Two customer balances are overdue, totaling ${formatAmount(215_000)}. You may want to review their due dates and recent payment activity.`}</p><p className="mt-3 text-[10px] leading-4 text-white/45">{live ? 'Based on your saved business records.' : 'Sample explanation based on the sample dashboard records above.'}</p></div><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-white/15 px-3 py-2 text-[10px] font-bold text-white/65">Who is overdue?</span><span className="rounded-full border border-white/15 px-3 py-2 text-[10px] font-bold text-white/65">What should I review?</span></div></article>;
}

export default function SubscriptionDashboard() {
  const router = useRouter();
  const { user, ready, setUser } = useCurrentUser();
  const pathname = usePathname();
  const activeNav = [...workspaceItems, ...preferenceItems].find((item) => item.href === pathname)?.label ?? 'Overview';
  const routeSection = pathname.split('/')[2] as DashboardSection | undefined;
  const findingId = routeSection === 'intelligence' ? pathname.split('/')[3] : undefined;
  const section = routeSection || 'overview';
  const [recordOpen, setRecordOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [recordNotice, setRecordNotice] = useState('');
  const [onboardingProfile, setOnboardingProfile] = useState<FinancialOnboardingProfile | null>(null);
  const [financeOverview, setFinanceOverview] = useState<FinanceOverview | null>(null);
  const [financeWorkspace, setFinanceWorkspace] = useState<FinanceWorkspace | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [businessId, setBusinessId] = useState('');
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [transactionKind, setTransactionKind] = useState<'income' | 'expense' | 'transfer'>('income');
  const [selectedObligationId, setSelectedObligationId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [selectedOverviewTransaction, setSelectedOverviewTransaction] = useState<PreviewTransaction | null>(null);
  const [selectedChecklistIndex, setSelectedChecklistIndex] = useState(0);
  const [entryMode, setEntryMode] = useState<'manual' | 'describe'>('manual');
  const [describeText, setDescribeText] = useState('');
  const [transactionDraft, setTransactionDraft] = useState<TransactionDraft | null>(null);
  const [parsingTransaction, setParsingTransaction] = useState(false);
  const [transactionFormRevision, setTransactionFormRevision] = useState(0);
  const [quickSaveRequested, setQuickSaveRequested] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOnboardingProfile(getFinancialOnboardingProfile());
    async function loadWorkspace() {
      try {
        const businesses = await getBusinesses();
        const business = businesses[0];
        if (!business) return;
        setBusinessId(business.id);
        const [overview, workspace] = await Promise.all([getFinanceOverview(business.id), getFinanceWorkspace(business.id)]);
        if (cancelled) return;
        setFinanceOverview(overview);
        setFinanceWorkspace(workspace);
      } catch (error) {
        if (!cancelled) setRecordNotice(error instanceof Error ? error.message : 'Could not load your financial records.');
      } finally {
        if (!cancelled) setWorkspaceLoading(false);
      }
    }
    void loadWorkspace();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!recordOpen) {
      setEntryMode('manual');
      setDescribeText('');
      setTransactionDraft(null);
    }
  }, [recordOpen]);

  useEffect(() => {
    if (!recordOpen) return;
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="number"]'));
    const handlers = inputs.map((input) => {
      const handler = () => { input.type = 'text'; input.value = formatMoneyInput(input.value); };
      input.addEventListener('input', handler);
      return [input, handler] as const;
    });
    return () => handlers.forEach(([input, handler]) => input.removeEventListener('input', handler));
  }, [recordOpen, entryMode, transactionDraft]);

  const currency = financeOverview?.business.currency ?? onboardingProfile?.currency ?? 'NGN';
  const dashboardTransactions = financeOverview?.transactions.length
    ? financeOverview.transactions.map((transaction) => ({
        transactionId: transaction.id,
        date: new Date(`${transaction.occurred_on}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        dateKey: transaction.occurred_on,
        time: transaction.occurred_at
          ? new Date(transaction.occurred_at).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
          : new Date(transaction.created_at).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }),
        title: transaction.description,
        detail: transaction.kind === 'transfer'
          ? `${transaction.account_name || 'Account'} → ${transaction.transfer_account_name || 'Account'}`
          : transaction.obligation_description
            ? `${transaction.contact_name || 'Contact'} · payment for ${transaction.obligation_description}`
            : transaction.contact_name || transaction.counterparty || transaction.category || (transaction.kind === 'income' ? 'Money received' : 'Money paid'),
        amount: Number(transaction.amount),
        category: transaction.category,
        accountId: transaction.account,
        accountName: transaction.account_name,
        contactId: transaction.contact,
        contactName: transaction.contact_name,
        direction: transaction.kind === 'transfer' ? 'transfer' as const : transaction.kind === 'income' ? 'in' as const : 'out' as const,
      }))
    : financeOverview ? [] : initialTransactions;
  const formatAmount = (amount: number) => {
    try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount); }
    catch { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(amount); }
  };
  const receivableRows = financeWorkspace?.obligations.filter((item) => item.kind === 'receivable' && item.status !== 'settled') ?? [];
  const payableRows = financeWorkspace?.obligations.filter((item) => item.kind === 'payable' && item.status !== 'settled') ?? [];
  const receivablesTotal = financeOverview ? Number(financeOverview.summary.receivables_outstanding ?? 0) : receivableRows.reduce((sum, item) => sum + Number(item.balance), 0);
  const payablesTotal = financeOverview ? Number(financeOverview.summary.payables_outstanding ?? 0) : payableRows.reduce((sum, item) => sum + Number(item.balance), 0);
  const actualCashflow = financeWorkspace?.performance.slice(-6) ?? [];
  const cashflowMax = Math.max(1, ...actualCashflow.flatMap((item) => [Number(item.income), Number(item.expenses)]));
  const recordKeepingHint = onboardingProfile?.recordKeeping === 'paper'
    ? 'Since you use a notebook or paper, start by recording one recent sale or expense. You can bring the rest over gradually.'
    : onboardingProfile?.recordKeeping === 'digital'
      ? 'You already keep digital records. Import a spreadsheet when you’re ready, or record a transaction now.'
      : onboardingProfile?.recordKeeping === 'unorganized'
        ? 'Start from today. Record a sale or expense and build a clearer picture over time.'
        : 'Record a sale or expense to start building your financial picture.';
  const setupHint = onboardingProfile?.setupChoice === 'balances'
    ? 'You chose to enter current balances. Confirm your starting balances whenever you’re ready.'
    : onboardingProfile?.setupChoice === 'import'
      ? 'You chose to import existing records. You can bring in a spreadsheet whenever you’re ready.'
      : onboardingProfile?.setupChoice === 'fresh'
        ? 'You chose to start fresh. Begin with activity from today.'
        : 'Setup is optional. You can add records whenever you’re ready.';
  const hasSavedTransactions = Boolean(financeOverview?.transactions.length);
  const checklistItems = [
    { title: 'Record a sale or expense', href: null, complete: hasSavedTransactions },
    { title: 'Add customer balances', href: '/dashboard/receivables', complete: Boolean(financeWorkspace?.obligations.some((item) => item.kind === 'receivable')) },
    { title: 'Add supplier bills', href: '/dashboard/payables', complete: Boolean(financeWorkspace?.obligations.some((item) => item.kind === 'payable')) },
    { title: 'Confirm starting balances', href: '/dashboard/cash-accounts', complete: Boolean(Number(financeOverview?.business.opening_balance ?? 0) !== 0 || financeWorkspace?.accounts.some((account) => Number(account.opening_balance) !== 0)) },
  ];
  const pendingChecklistItems = checklistItems.filter((item) => !item.complete);
  const pendingChecklistIndex = Math.min(selectedChecklistIndex, Math.max(0, pendingChecklistItems.length - 1));
  const selectedChecklistItem = pendingChecklistItems[pendingChecklistIndex];

  async function reloadFinanceData() {
    if (!businessId) return;
    const [overview, workspace] = await Promise.all([getFinanceOverview(businessId), getFinanceWorkspace(businessId)]);
    setFinanceOverview(overview);
    setFinanceWorkspace(workspace);
  }

  async function parseTransactionDescription() {
    if (!businessId || !describeText.trim()) return;
    setParsingTransaction(true);
    setRecordNotice('');
    try {
      const draft = await parseFinanceTransaction(businessId, describeText.trim());
      setTransactionDraft(draft);
    } catch (error) {
      setRecordNotice(error instanceof Error ? error.message : 'Could not understand that transaction.');
    } finally {
      setParsingTransaction(false);
    }
  }

  function useTransactionDraft() {
    if (!transactionDraft) return;
    if (transactionDraft.kind === 'income' || transactionDraft.kind === 'expense' || transactionDraft.kind === 'transfer') setTransactionKind(transactionDraft.kind);
    const matchedContact = transactionDraft.contact_name ? financeWorkspace?.contacts.find((contact) => contact.name.toLowerCase() === transactionDraft.contact_name?.toLowerCase()) : undefined;
    setContactSearch(transactionDraft.contact_name ?? '');
    setSelectedContactId(matchedContact?.id ?? '');
    setTransactionFormRevision((revision) => revision + 1);
    setEntryMode('manual');
  }

  function quickSaveTransaction() {
    if (!transactionDraft || transactionDraft.missing_details.length > 0) return;
    useTransactionDraft();
    setQuickSaveRequested(true);
  }

  useEffect(() => {
    if (!quickSaveRequested || entryMode !== 'manual') return;
    const form = document.querySelector<HTMLFormElement>('form[data-transaction-form="true"]');
    if (!form) return;
    setQuickSaveRequested(false);
    form.requestSubmit();
  }, [quickSaveRequested, entryMode, transactionFormRevision]);

  async function addPreviewTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const amount = String(form.get('amount') ?? '').trim().replace(/,/g, '');
    const totalAmount = String(form.get('total_amount') ?? amount).trim().replace(/,/g, '');
    const paidNow = String(form.get('paid_now') ?? amount).trim().replace(/,/g, '');
    const numericAmount = Number(amount || paidNow);
    const numericTotalAmount = Number(totalAmount);
    const numericPaidNow = Number(paidNow);
    const dueDate = String(form.get('due_date') ?? transactionDraft?.due_date ?? '').trim() || null;
    const now = new Date();
    const occurredOn = now.toLocaleDateString('en-CA');
    const occurredAtInput = now.toTimeString().slice(0, 5);
    const obligationId = String(form.get('obligation') ?? '') || null;
    const obligation = obligationId ? financeWorkspace?.obligations.find((item) => item.id === obligationId) : null;
    const kind = obligation ? (obligation.kind === 'receivable' ? 'income' : 'expense') : transactionKind;
    const accountId = String(form.get('account') ?? '') || null;
    const transferAccountId = String(form.get('transfer_account') ?? '') || null;
    const contactInput = contactSearch.trim();
    const expectedContactKind = kind === 'income' ? 'customer' : kind === 'expense' ? 'supplier' : null;
    const matchingContacts = expectedContactKind ? (financeWorkspace?.contacts ?? []).filter((contact) => contact.kind === expectedContactKind) : [];
    const normalizedContactInput = contactInput.toLowerCase();
    const existingContact = matchingContacts.find((contact) => contact.name.toLowerCase() === normalizedContactInput || Boolean(contact.phone && contact.phone.toLowerCase() === normalizedContactInput));
    const isNewSaleOrBill = !obligationId && kind !== 'transfer';
    if (!name || !Number.isFinite(numericAmount) || (!isNewSaleOrBill && numericAmount <= 0)) return;
    if (isNewSaleOrBill && (!Number.isFinite(numericTotalAmount) || numericTotalAmount <= 0 || !Number.isFinite(numericPaidNow) || numericPaidNow < 0 || numericPaidNow > numericTotalAmount)) {
      setRecordNotice('Enter a valid total and an amount paid now that is not greater than the total.');
      return;
    }
    if (kind === 'transfer' && (!accountId || !transferAccountId || accountId === transferAccountId)) return;
    if (!businessId) {
      setRecordNotice('Complete business setup before saving transactions to your account.');
      return;
    }
    setSavingTransaction(true);
    try {
      if (contactInput && expectedContactKind && !selectedContactId && existingContact) {
        setRecordNotice('Select the matching contact suggestion before saving.');
        setSavingTransaction(false);
        return;
      }
      let contactId = selectedContactId || null;
      if (!obligationId && expectedContactKind && contactInput && !contactId) {
        const looksLikePhone = /^[+\d][\d\s()\-]{5,}$/.test(contactInput);
        const contactName = newContactName.trim() || (looksLikePhone ? '' : contactInput);
        const contactPhone = newContactPhone.trim() || (looksLikePhone ? contactInput : '');
        if (!contactName) {
          setRecordNotice('Add the contact name before saving this transaction.');
          setSavingTransaction(false);
          return;
        }
        const createdContact = await createFinanceContact(businessId, { kind: expectedContactKind, name: contactName, phone: contactPhone || undefined, email: newContactEmail.trim() || undefined });
        contactId = createdContact.id;
      }
      let createdObligationId = obligationId;
      const outstandingAmount = isNewSaleOrBill ? numericTotalAmount - numericPaidNow : 0;
      if (isNewSaleOrBill && outstandingAmount > 0) {
        if (!contactId || !expectedContactKind) {
          setRecordNotice(`Select or create the ${kind === 'income' ? 'customer' : 'supplier'} so Dorah can track the remaining balance.`);
          setSavingTransaction(false);
          return;
        }
        const createdObligation = await createFinanceObligation(businessId, {
          contact: contactId,
          kind: kind === 'income' ? 'receivable' : 'payable',
          description: name,
          amount: String(numericTotalAmount),
          due_date: dueDate,
          affects_performance: true,
        });
        createdObligationId = createdObligation.id;
      }
      if (numericPaidNow <= 0) {
        await reloadFinanceData();
        setRecordNotice('Balance saved. Record the first payment whenever it arrives.');
        setRecordOpen(false);
        setSavingTransaction(false);
        return;
      }
      await createFinanceTransaction(businessId, {
        kind,
        description: name,
        amount: isNewSaleOrBill ? paidNow : amount,
        occurred_on: occurredOn,
        occurred_at: occurredAtInput ? `${occurredOn}T${occurredAtInput}:00` : null,
        account: accountId,
        transfer_account: transferAccountId,
        contact: contactId,
        obligation: createdObligationId,
      });
      await reloadFinanceData();
      setRecordNotice('Transaction saved to your business records.');
      setRecordOpen(false);
      setTransactionKind('income');
      setSelectedObligationId(''); setSelectedContactId('');
      setContactSearch('');
      setNewContactName('');
      setNewContactPhone('');
      setNewContactEmail('');
      router.push('/dashboard/transactions');
    } catch (error) {
      setRecordNotice(error instanceof Error ? error.message : 'Could not save this transaction.');
    } finally {
      setSavingTransaction(false);
    }
  }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#F5F7FB] text-sm font-bold text-[#64708A]">Opening your dashboard…</main>;
  if (!user) return <main className="min-h-screen bg-[#F5F7FB] p-5 text-[#111B33]"><Brand /><section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">Your business, in clearer view</p><h1 className="mt-4 font-[Aptos_Display,Arial,sans-serif] text-[clamp(3.2rem,8vw,6.5rem)] font-black leading-[.86] tracking-[-.08em]">Know where your<br />money stands.</h1><p className="mt-6 max-w-xl text-base leading-7 text-[#64708A]">Sign in to open your financial overview and keep important business activity in view.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/login?next=%2Fdashboard" className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#3157F5] px-5 text-sm font-black text-white">Sign in <ArrowRight className="h-4 w-4" /></Link><Link href="/signup" className="inline-flex h-12 items-center rounded-lg border border-[#111B33]/15 bg-white px-5 text-sm font-black">Create account</Link></div></section></main>;
  if (workspaceLoading) return <DashboardLoading />;

  const firstName = user.display_name.split(' ')[0] || user.display_name;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  return <div className="min-h-screen bg-[#F5F7FB] pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-[#111B33] lg:pb-0">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col bg-[#111B33] p-4 text-white lg:flex">
      <div className="dorah-sidebar-brand px-2">
        <Brand light />
        <p className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[.16em] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-[#C9F45D]" />Financial intelligence</p>
      </div>
      <button type="button" onClick={() => { setRecordNotice(''); setRecordOpen(true); }} className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#C9F45D] px-3 text-xs font-black text-[#111B33] hover:bg-[#D7FA7D]"><Plus className="h-4 w-4" />Record transaction</button>
      <p className="mt-7 px-3 text-[9px] font-black uppercase tracking-[.16em] text-white/35">Workspace</p>
      <nav className="mt-2 grid gap-0.5" aria-label="Workspace navigation">{workspaceItems.map(({ label, href, icon: Icon }) => <Link key={label} href={href} aria-current={activeNav === label ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-bold transition ${activeNav === label ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[.07] hover:text-white'}`}><Icon className={`h-4 w-4 shrink-0 ${activeNav === label ? 'text-[#C9F45D]' : 'text-white/45'}`} />{label}</Link>)}</nav>
      <p className="mt-5 px-3 text-[9px] font-black uppercase tracking-[.16em] text-white/35">Preferences</p>
      <nav className="mt-2 grid gap-0.5" aria-label="Preferences">{preferenceItems.map(({ label, href, icon: Icon }) => <Link key={label} href={href} aria-current={activeNav === label ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-bold transition ${activeNav === label ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[.07] hover:text-white'}`}><Icon className={`h-4 w-4 ${activeNav === label ? 'text-[#C9F45D]' : 'text-white/45'}`} />{label}</Link>)}</nav>
      <div className="mt-auto border-t border-white/10 pt-3"><div className="flex items-center gap-2"><Link href="/" className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-bold text-white/55 hover:bg-white/10 hover:text-white"><ArrowRight className="h-4 w-4 shrink-0 rotate-180" />Back to site</Link><div className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C9F45D] text-[10px] font-black text-[#111B33]">{firstName.slice(0, 1).toUpperCase()}</span></div></div></div>
    </aside>

    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#111B33]/10 bg-[#F5F7FB]/95 px-4 backdrop-blur lg:hidden"><Brand /><button type="button" onClick={() => { setRecordNotice(''); setRecordOpen(true); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#3157F5] px-3 text-xs font-black text-white"><Plus className="h-4 w-4" />Record</button></header>
    <main id="overview" className="pb-24 lg:ml-[250px] lg:pb-0"><div className="mx-auto w-[min(1190px,calc(100%-32px))] px-1 py-6 sm:w-[min(1190px,calc(100%-40px))] sm:px-5 sm:py-10 lg:px-8 lg:py-12">
      {section === 'overview' ? <>

      <header className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0 max-w-full"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date())} · {financeOverview?.business.name || onboardingProfile?.businessName || 'Business overview'}</p><h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] max-w-full break-words text-[clamp(2.15rem,8vw,4.6rem)] font-black sm:text-[clamp(2.8rem,5vw,4.6rem)] leading-[.9] tracking-[-.075em]">{greeting}, {firstName}.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#64708A]">Here’s what’s happening across your business money this month.</p></div><button type="button" onClick={() => { setRecordNotice(''); setRecordOpen(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-4 text-sm font-black text-white shadow-[0_4px_0_rgba(49,87,245,.18)]"><Plus className="h-4 w-4" />Record transaction</button></header>

      {!hasSavedTransactions && <section className="mt-6 grid gap-4 rounded-xl border border-[#111B33]/10 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Your first step</p><h2 className="mt-2 text-lg font-black">{financeOverview?.business.name || onboardingProfile?.businessName ? `A good place to start at ${financeOverview?.business.name || onboardingProfile?.businessName}` : 'Build your financial picture one step at a time'}</h2>{(financeOverview?.business.business_type || onboardingProfile?.businessType) && <p className="mt-1 text-[10px] font-bold text-[#758096]">{financeOverview?.business.business_type || onboardingProfile?.businessType} · {financeOverview?.business.industry || onboardingProfile?.industry} · {currency}</p>}<p className="mt-2 max-w-2xl text-xs leading-5 text-[#64708A]">{recordKeepingHint} {setupHint}</p><p className="mt-2 text-[10px] text-[#758096]">Business details and saved transactions are stored in your account.</p></div><div className="grid gap-2"><button type="button" onClick={() => { setRecordNotice(''); setRecordOpen(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-4 text-sm font-black text-white"><Plus className="h-4 w-4" />Record your first transaction</button>{!businessId && <Link href="/onboarding" className="text-center text-[10px] font-bold text-[#3157F5]">Complete business setup</Link>}</div></section>}

      {pendingChecklistItems.length ? <section className="mt-4 rounded-xl border border-dashed border-[#111B33]/20 bg-white/70 p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Getting started</p><h2 className="mt-1 text-base font-black">A checklist you can finish over time</h2></div><span className="text-[10px] font-bold text-[#758096]">Optional · Nothing blocks your dashboard</span></div><div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><label className="relative block"><span className="sr-only">Choose an unfinished getting started step</span><select value={pendingChecklistIndex} onChange={(event) => setSelectedChecklistIndex(Number(event.target.value))} className="h-11 w-full appearance-none rounded-lg border border-[#111B33]/12 bg-white px-3 pr-10 text-xs font-black text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10">{pendingChecklistItems.map((item, index) => <option key={item.title} value={index}>{index + 1}. {item.title}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#758096]" /></label><div className="flex items-center gap-2 rounded-lg border border-[#111B33]/[.08] bg-[#F8F9FC] px-3 py-2.5 text-xs"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EEF1FF] text-[10px] font-black text-[#3157F5]">{pendingChecklistIndex + 1}</span>{selectedChecklistItem.href ? <a href={selectedChecklistItem.href} className="font-bold text-[#46516A] hover:text-[#3157F5]">{selectedChecklistItem.title}</a> : <button type="button" onClick={() => { setRecordNotice(''); setRecordOpen(true); }} className="text-left font-bold text-[#46516A] hover:text-[#3157F5]">{selectedChecklistItem.title}</button>}</div></div></section> : <section className="mt-4 rounded-xl border border-[#C9F45D]/40 bg-[#F7FBEA] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#C9F45D] text-[#111B33]"><Check className="h-4 w-4" /></span><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#557516]">Getting started</p><p className="mt-1 text-sm font-black text-[#3F541E]">You’re all set.</p></div></div></section>}
      <section id="cash-accounts" className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Financial summary">
        <article className="relative overflow-hidden rounded-xl border border-[#3157F5] bg-[#3157F5] p-5 text-white"><div className="flex items-center justify-between"><p className="text-xs font-bold text-white/75">Recorded cash position</p></div><strong className="relative z-10 mt-5 block text-3xl font-black tracking-[-.06em]">{formatAmount(Number(financeOverview?.summary.cash_position ?? 2_480_000))}</strong><span className="mt-2 block text-[10px] text-white/65">{financeOverview ? 'Opening balance plus recorded transactions' : 'Based on sample opening balance'}</span><WalletCards className="absolute -bottom-4 right-2 h-20 w-20 text-white/10" /></article>
        <article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#EDF8DC] text-[#557516]"><ArrowDownLeft className="h-4 w-4" /></span></div><p className="mt-4 text-xs font-bold text-[#758096]">Money received</p><strong className="mt-1 block text-2xl font-black tracking-[-.05em]">{formatAmount(Number(financeOverview?.summary.income_this_month ?? 3_260_000))}</strong><small className="mt-1 block text-[10px] text-[#758096]">This month{financeOverview ? '' : ' · sample'}</small></article>
        <article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFF1E9] text-[#B4552A]"><ArrowUpRight className="h-4 w-4" /></span></div><p className="mt-4 text-xs font-bold text-[#758096]">Expenses recorded</p><strong className="mt-1 block text-2xl font-black tracking-[-.05em]">{formatAmount(Number(financeOverview?.summary.expenses_this_month ?? 1_140_000))}</strong><small className="mt-1 block text-[10px] text-[#758096]">This month{financeOverview ? '' : ' · sample'}</small></article>
        <article className="rounded-xl border border-[#111B33]/10 bg-white p-5"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><UsersRound className="h-4 w-4" /></span></div><p className="mt-4 text-xs font-bold text-[#758096]">Customers owe you</p><strong className="mt-1 block text-2xl font-black tracking-[-.05em]">{formatAmount(financeOverview ? receivablesTotal : 485_000)}</strong><small className="mt-1 block text-[10px] text-[#758096]">{financeOverview ? `${receivableRows.length} saved open balances` : 'Across 8 sample balances'}</small></article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <article id="performance" className="rounded-xl border border-[#111B33]/10 bg-white p-5 sm:p-6"><header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Cash flow</p><h2 className="mt-2 text-xl font-black tracking-[-.045em]">Money in and out</h2><p className="mt-1 text-xs text-[#758096]">{financeOverview ? 'Monthly totals from saved transactions' : 'Illustrative monthly view'}</p></div></header><div className="mt-7 grid h-48 grid-cols-6 items-end gap-3 border-b border-l border-[#111B33]/10 px-3 pb-2 sm:h-56 sm:gap-5">{financeOverview ? actualCashflow.map((item) => <div key={item.month} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><span className="w-3 rounded-t-sm bg-[#3157F5] sm:w-5" style={{ height: `${Math.max(3, Number(item.income) / cashflowMax * 100)}%` }} /><span className="w-3 rounded-t-sm bg-[#C9F45D] sm:w-5" style={{ height: `${Math.max(3, Number(item.expenses) / cashflowMax * 100)}%` }} /></div><span className="text-[9px] font-bold text-[#758096]">{new Date(`${item.month}-01T00:00:00`).toLocaleDateString('en', { month: 'short' })}</span></div>) : [['May','53%','30%'],['Jun','65%','42%'],['Jul','48%','35%'],['Aug','78%','46%'],['Sep','60%','39%'],['Oct','88%','52%']].map(([month, incoming, outgoing]) => <div key={month} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end justify-center gap-1"><span className="w-3 rounded-t-sm bg-[#3157F5] sm:w-5" style={{ height: incoming }} /><span className="w-3 rounded-t-sm bg-[#C9F45D] sm:w-5" style={{ height: outgoing }} /></div><span className="text-[9px] font-bold text-[#758096]">{month}</span></div>)}</div><div className="mt-4 flex flex-wrap gap-4 text-[10px] font-bold text-[#64708A]"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#3157F5]" />Money in</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#C9F45D]" />Money out</span></div></article>

        <article id="intelligence" className="rounded-xl border border-[#111B33]/10 bg-white p-5 sm:p-6"><header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Intelligence</p><h2 className="mt-2 text-xl font-black tracking-[-.045em]">Worth reviewing</h2></div></header><div className="mt-5 grid gap-3">{financeOverview ? financeWorkspace?.insights.length ? financeWorkspace.insights.slice(0, 2).map((finding) => <div key={finding.id} className="flex gap-3 border border-[#111B33]/10 p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><CircleAlert className="h-4 w-4" /></span><div><strong className="text-xs">{finding.title}</strong><p className="mt-1 text-[10px] leading-4 text-[#758096]">{finding.detail}</p></div></div>) : <p className="border border-[#111B33]/10 p-3 text-xs leading-5 text-[#64708A]">No rule-based findings from saved records.</p> : <><div className="flex gap-3 border border-[#F0DFAF] bg-[#FFF9E8] p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F8EDC9] text-[#9A7311]"><CircleAlert className="h-4 w-4" /></span><div><strong className="text-xs">Possible duplicate transaction</strong><p className="mt-1 text-[10px] leading-4 text-[#786B4C]">Sample check against preview transactions.</p></div></div><div className="flex gap-3 border border-[#111B33]/10 p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EEF1FF] text-[#3157F5]"><BellRing className="h-4 w-4" /></span><div><strong className="text-xs">Customer payments may be overdue</strong><p className="mt-1 text-[10px] leading-4 text-[#758096]">Sample balances past their due date.</p></div></div></>}<Link href="/dashboard/intelligence" className="mt-1 inline-flex items-center gap-1 text-xs font-black text-[#3157F5]">Review findings <ArrowRight className="h-3.5 w-3.5" /></Link></div></article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article id="transactions" className="overflow-hidden rounded-xl border border-[#111B33]/10 bg-white"><header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#111B33]/10 p-5 sm:p-6"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Latest activity</p><h2 className="mt-2 text-xl font-black tracking-[-.045em]">Recent transactions</h2></div>{financeOverview ? <span className="text-[9px] font-black uppercase tracking-wide text-[#557516]">Saved records</span> : <SampleTag />}</header><div className="divide-y divide-[#111B33]/[.08]">{dashboardTransactions.length ? dashboardTransactions.slice(0, 5).map(({ transactionId, date, time, title, detail, amount, direction, accountId, accountName, contactId, contactName }, index) => <div key={`${date}-${title}-${index}`} role="button" tabIndex={0} onClick={() => transactionId && setSelectedOverviewTransaction({ transactionId, date, time, title, detail, amount, direction, accountId, accountName, contactId, contactName })} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && transactionId) setSelectedOverviewTransaction({ transactionId, date, time, title, detail, amount, direction, accountId, accountName, contactId, contactName }); }} className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-2 px-5 py-3.5 transition hover:bg-[#F8F9FC] sm:grid-cols-[75px_1fr_120px_100px] sm:px-6"><span className="hidden text-[10px] font-bold text-[#758096] sm:block">{date}</span><div className="flex min-w-0 items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${direction === 'in' ? 'bg-[#EDF8DC] text-[#557516]' : direction === 'transfer' ? 'bg-[#EEF1FF] text-[#3157F5]' : 'bg-[#F2F4F9] text-[#68738A]'}`}>{direction === 'in' ? <ArrowDownLeft className="h-4 w-4" /> : direction === 'transfer' ? <WalletCards className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span><div className="min-w-0"><strong className="block truncate text-xs">{title}</strong><small className="text-[10px] text-[#758096]">{detail} · {date}{time ? ` · ${time}` : ''}</small></div></div><span className="hidden text-[10px] font-bold text-[#758096] sm:block">{financeOverview ? 'Saved' : 'Preview'}</span><strong className={`text-right text-xs ${direction === 'in' ? 'text-[#557516]' : direction === 'transfer' ? 'text-[#3157F5]' : 'text-[#111B33]'}`}>{direction === 'transfer' ? '↔ ' : direction === 'in' ? '+' : '−'}{formatAmount(amount)}</strong></div>) : <p className="px-5 py-8 text-center text-xs text-[#758096]">No transactions yet. Record your first sale or expense to begin.</p>}</div><a href="#overview" className="flex items-center justify-between border-t border-[#111B33]/10 bg-[#FAFBFD] px-5 py-3 text-xs font-black text-[#3157F5] sm:px-6">{financeOverview ? 'Your saved transactions' : 'Sample transactions'} <ArrowRight className="h-4 w-4" /></a></article>

        <article id="receivables" className="rounded-xl border border-[#111B33]/10 bg-white p-5 sm:p-6"><header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Customer balances</p><h2 className="mt-2 text-xl font-black tracking-[-.045em]">Who owes you</h2></div></header><div className="mt-4 divide-y divide-[#111B33]/[.08]">{financeOverview ? receivableRows.length ? receivableRows.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EEF1FF] text-[10px] font-black text-[#3157F5]">{item.contact_name.split(' ').map((part) => part[0]).join('')}</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.contact_name}</strong><small className="text-[10px] text-[#758096]">{item.due_date ?? 'No due date'} · {item.status}</small></div><strong className="text-xs">{formatAmount(Number(item.balance))}</strong></div>) : <p className="py-4 text-xs text-[#758096]">No customer balances recorded.</p> : [['Amina Bello','Due Oct 29',180_000],['Dayo Stores','Overdue 6 days',125_000],['Kemi Foods','Overdue 2 days',90_000]].map(([name, due, amount], index) => <div key={String(name)} className="flex items-center gap-3 py-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-black ${index === 0 ? 'bg-[#EEF1FF] text-[#3157F5]' : 'bg-[#F2F4F9] text-[#56627A]'}`}>{String(name).split(' ').map((part) => part[0]).join('')}</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{name}</strong><small className="text-[10px] text-[#758096]">{due} · sample</small></div><strong className="text-xs">{formatAmount(Number(amount))}</strong></div>)}</div><div id="contacts" className="mt-4 border-t border-[#111B33]/10 pt-4"><div className="flex items-center justify-between"><h3 className="text-xs font-black">Customers &amp; suppliers</h3></div><div className="mt-3 grid gap-2 text-xs">{financeOverview ? (financeWorkspace?.contacts.slice(0, 2) ?? []).map((contact) => <div key={contact.id} className="flex items-center justify-between"><span className="text-[#64708A]">{contact.name}<small className="ml-1 text-[10px]">· {contact.kind}</small></span><strong>{formatAmount(Number(contact.outstanding_balance))} due</strong></div>) : <><div className="flex items-center justify-between"><span className="text-[#64708A]">Northstar Foods <small className="ml-1 text-[10px]">· customer</small></span><strong>{formatAmount(125_000)} due</strong></div><div className="flex items-center justify-between"><span className="text-[#64708A]">Brightline Packaging <small className="ml-1 text-[10px]">· supplier</small></span><strong>{formatAmount(215_000)} due</strong></div></>}</div></div></article>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article id="payables" className="rounded-xl border border-[#111B33]/10 bg-white p-5 sm:p-6"><header className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Supplier bills</p><h2 className="mt-2 text-xl font-black tracking-[-.045em]">Bills and obligations</h2></div></header><div className="mt-4 grid gap-2">{financeOverview ? payableRows.length ? payableRows.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3 border border-[#111B33]/[.08] p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#F2F4F9] text-center text-[9px] font-black leading-3 text-[#3157F5]">{item.due_date ? new Date(`${item.due_date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.description}</strong><small className="text-[10px] text-[#758096]">{item.contact_name} · {item.status}</small></div><strong className="text-xs">{formatAmount(Number(item.balance))}</strong></div>) : <p className="py-4 text-xs text-[#758096]">No supplier bills recorded.</p> : [['Oct 29','Supplier invoice',215_000],['Oct 31','Shop rent',350_000],['Nov 03','Power and internet',42_500]].map(([date, title, amount]) => <div key={String(title)} className="flex items-center gap-3 border border-[#111B33]/[.08] p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#F2F4F9] text-center text-[9px] font-black leading-3 text-[#3157F5]">{String(date).split(' ')[0]}<br />{String(date).split(' ')[1]}</span><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{title}</strong><small className="text-[10px] text-[#758096]">Due {date} · sample</small></div><strong className="text-xs">{formatAmount(Number(amount))}</strong></div>)}</div></article>

        <FinanceAssistantCard financeOverview={financeOverview} workspace={financeWorkspace} formatAmount={formatAmount} />
      </section>


      </> : <><DashboardSectionContent section={section} findingId={findingId} formatAmount={formatAmount} transactions={dashboardTransactions} hasLiveRecords={Boolean(financeOverview)} workspace={financeWorkspace} summary={financeOverview?.summary} businessId={businessId} business={financeOverview?.business ?? null} currentUser={user} onUserUpdated={setUser} onRefresh={reloadFinanceData} onRecord={() => { setRecordNotice(''); setRecordOpen(true); }} financeAction={businessId && (section === 'receivables' || section === 'payables' || section === 'customers-suppliers') ? <FinanceQuickCreate businessId={businessId} contacts={financeWorkspace?.contacts ?? []} mode={section === 'receivables' ? 'receivable' : section === 'payables' ? 'payable' : 'contact'} onSaved={reloadFinanceData} /> : undefined} /></>}
      {recordNotice && <p role="status" className="mt-4 border border-[#A5CD4A] bg-[#F2FADA] px-4 py-3 text-xs font-bold text-[#46661A]">{recordNotice}</p>}
    </div></main>

    {mobileMoreOpen && <><button type="button" aria-label="Close more menu" onClick={() => setMobileMoreOpen(false)} className="fixed inset-0 z-40 bg-[#111B33]/25 backdrop-blur-[2px] transition-opacity lg:hidden" /><section role="dialog" aria-modal="true" aria-label="More dashboard pages" className="pwa-mobile-sheet fixed inset-x-3 bottom-[calc(5.35rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-[#111B33]/10 bg-white p-4 shadow-[0_20px_60px_rgba(17,27,51,.2)] lg:hidden"><div className="mb-3 flex items-start justify-between"><div><p className="text-sm font-black">More in your workspace</p><p className="mt-1 text-[10px] text-[#758096]">Your records, accounts, and settings.</p></div><button type="button" onClick={() => setMobileMoreOpen(false)} aria-label="Close more pages" className="grid h-8 w-8 place-items-center rounded-lg text-[#758096] transition hover:bg-[#F5F7FB] hover:text-[#111B33]"><X className="h-4 w-4" /></button></div><div className="grid grid-cols-2 gap-2">{[...workspaceItems.slice(3), ...preferenceItems].map(({ label, href, icon: Icon }) => <Link key={label} href={href} onClick={() => setMobileMoreOpen(false)} aria-current={activeNav === label ? 'page' : undefined} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-[11px] font-bold transition active:scale-[.98] ${activeNav === label ? 'border-[#3157F5]/20 bg-[#EEF1FF] text-[#3157F5]' : 'border-[#111B33]/[.06] text-[#536078] hover:bg-[#F8F9FC]'}`}><Icon className="h-4 w-4 shrink-0" />{label}</Link>)}</div></section></>}
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#111B33]/[.08] bg-white/95 px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_30px_rgba(17,27,51,.08)] backdrop-blur-xl lg:hidden" aria-label="Dashboard sections"><div className="mx-auto grid max-w-lg grid-cols-5 items-end gap-1"><Link href="/dashboard" aria-current={activeNav === 'Overview' ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black transition active:scale-95 ${activeNav === 'Overview' ? 'text-[#3157F5]' : 'text-[#758096]'}`}><LayoutDashboard className="h-[18px] w-[18px]" /><span>Overview</span></Link><Link href="/dashboard/intelligence" aria-current={activeNav === 'Intelligence' ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black transition active:scale-95 ${activeNav === 'Intelligence' ? 'text-[#3157F5]' : 'text-[#758096]'}`}><Sparkles className="h-[18px] w-[18px]" /><span>Intelligence</span></Link><button type="button" onClick={() => { setRecordNotice(''); setRecordOpen(true); }} className="-mt-5 mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#3157F5] text-white shadow-[0_8px_18px_rgba(49,87,245,.3)] transition hover:-translate-y-0.5 hover:bg-[#2748D8] active:scale-95" aria-label="Record a transaction"><Plus className="h-5 w-5" /></button><Link href="/dashboard/transactions" aria-current={activeNav === 'Transactions' ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black transition active:scale-95 ${activeNav === 'Transactions' ? 'text-[#3157F5]' : 'text-[#758096]'}`}><ReceiptText className="h-[18px] w-[18px]" /><span>Activity</span></Link><button type="button" onClick={() => setMobileMoreOpen((open) => !open)} aria-expanded={mobileMoreOpen} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-black transition active:scale-95 ${mobileMoreOpen || [...workspaceItems.slice(3), ...preferenceItems].some((item) => item.label === activeNav) ? 'text-[#3157F5]' : 'text-[#758096]'}`}><MoreHorizontal className="h-[18px] w-[18px]" /><span>More</span></button></div></nav>

    {selectedOverviewTransaction && <TransactionDetailsModal businessId={businessId} transaction={selectedOverviewTransaction} accounts={financeWorkspace?.accounts ?? []} formatAmount={formatAmount} onClose={() => setSelectedOverviewTransaction(null)} onRefresh={reloadFinanceData} />}

    {recordOpen && <div className="fixed inset-0 z-[100] flex justify-end overflow-y-auto bg-[#0A1125]/60 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingTransaction) { setRecordOpen(false); setSelectedObligationId(''); setSelectedContactId(''); setTransactionKind('income'); } }}><section role="dialog" aria-modal="true" aria-labelledby="record-transaction-title" className="min-h-full w-full max-w-lg overflow-y-auto overscroll-contain border-l border-[#111B33]/15 bg-white shadow-2xl sm:rounded-l-2xl"><header className="flex items-start justify-between border-b border-[#111B33]/10 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#3157F5]">{businessId ? 'Business record' : 'Preview entry'}</p><h2 id="record-transaction-title" className="mt-2 text-2xl font-black tracking-[-.05em]">Record a sale or expense</h2></div><button type="button" onClick={() => { setRecordOpen(false); setSelectedObligationId(''); setSelectedContactId(''); setTransactionKind('income'); }} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F2F4F9]"><X className="h-4 w-4" /></button></header><div className="flex gap-2 border-b border-[#111B33]/10 p-4 sm:px-5"><button type="button" onClick={() => setEntryMode('manual')} className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-black ${entryMode === 'manual' ? 'bg-[#3157F5] text-white' : 'bg-[#F2F4F9] text-[#64708A]'}`}>Enter manually</button><button type="button" onClick={() => setEntryMode('describe')} className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-black ${entryMode === 'describe' ? 'bg-[#3157F5] text-white' : 'bg-[#F2F4F9] text-[#64708A]'}`}>Describe transaction</button></div>{entryMode === 'describe' && <div className="grid gap-3 p-4 sm:p-5"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">What happened?<textarea value={describeText} onChange={(event) => setDescribeText(event.target.value)} rows={5} maxLength={2000} placeholder="I sold 10 bags of rice to Emeka for ₦180,000. He paid ₦100,000 cash and will pay the balance next week." className="resize-none rounded-lg border border-[#111B33]/15 p-3 text-sm font-normal outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>{transactionDraft && <div className="rounded-xl border border-[#3157F5]/20 bg-[#F7F8FF] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#3157F5]">Review extracted transaction</p><strong className="mt-2 block text-base">{transactionDraft.description || 'Untitled transaction'}</strong><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><span><b className="block text-[10px] text-[#758096]">Type</b>{transactionDraft.kind}</span><span><b className="block text-[10px] text-[#758096]">Customer / supplier</b>{transactionDraft.contact_name || 'Not identified'}</span><span><b className="block text-[10px] text-[#758096]">Total</b>{transactionDraft.total_amount == null ? 'Not identified' : formatAmount(transactionDraft.total_amount)}</span><span><b className="block text-[10px] text-[#758096]">Paid now</b>{transactionDraft.paid_amount == null ? 'Not identified' : formatAmount(transactionDraft.paid_amount)}</span></div>{transactionDraft.missing_details.length > 0 && <p className="mt-3 text-[10px] leading-4 text-[#8E3329]">Still confirm: {transactionDraft.missing_details.join(', ')}.</p>}<p className="mt-3 text-[10px] leading-4 text-[#64708A]">{transactionDraft.note}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={useTransactionDraft} className="h-10 rounded-lg border border-[#3157F5]/25 bg-white px-4 text-xs font-black text-[#3157F5]">Edit draft</button><button type="button" disabled={savingTransaction || transactionDraft.missing_details.length > 0} onClick={quickSaveTransaction} className="h-10 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{savingTransaction ? 'Saving…' : 'Quick save'}</button></div></div>}<button type="button" disabled={parsingTransaction || !describeText.trim() || !businessId} onClick={() => void parseTransactionDescription()} className="h-10 rounded-lg bg-[#111B33] px-4 text-xs font-black text-white disabled:opacity-50">{parsingTransaction ? 'Understanding…' : 'Extract transaction details'}</button><p className="text-[10px] leading-4 text-[#758096]">Dorah will suggest fields. Review every detail before saving.</p></div>}{entryMode === 'manual' && <form data-transaction-form="true" key={transactionFormRevision} onSubmit={addPreviewTransaction} className="grid gap-4 p-4 sm:p-5">
      {selectedContactId && (financeWorkspace?.obligations.filter((item) => item.contact === selectedContactId && item.status !== 'settled').length ?? 0) > 0 && <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Apply payment to an outstanding balance<select name="obligation" value={selectedObligationId} onChange={(event) => { const value = event.target.value; setSelectedObligationId(value); const selected = financeWorkspace?.obligations.find((item) => item.id === value); if (selected) setTransactionKind(selected.kind === 'receivable' ? 'income' : 'expense'); }} className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-normal text-[#111B33]"><option value="">No outstanding balance</option>{financeWorkspace?.obligations.filter((item) => item.contact === selectedContactId && item.status !== 'settled').map((item) => <option key={item.id} value={item.id}>{item.contact_name} · {item.description} · {formatAmount(Number(item.balance))} remaining</option>)}</select><span className="text-[10px] font-normal text-[#758096]">Partial payments are allowed and update the remaining balance.</span></label>}
      {selectedContactId && !(financeWorkspace?.obligations ?? []).some((item) => item.contact === selectedContactId && item.status !== 'settled') && <p className="rounded-lg border border-[#111B33]/10 bg-[#F8F9FC] p-3 text-[10px] leading-4 text-[#64708A]">This contact has no recorded outstanding balances. You can still record money received.</p>}      <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Description<input name="name" required maxLength={120} defaultValue={transactionDraft?.description ?? ''} placeholder={selectedObligationId ? 'e.g. Part payment' : 'e.g. Customer payment'} className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>
      <p className="rounded-lg border border-[#111B33]/10 bg-[#F8F9FC] px-3 py-2 text-[10px] leading-4 text-[#64708A]">Date and time are recorded automatically when you save this movement.</p>
      <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Type{selectedObligationId ? <span className="flex h-11 items-center rounded-lg bg-[#F5F7FB] px-3 text-sm font-normal text-[#758096]">{transactionKind === 'income' ? 'Customer payment received' : 'Supplier bill payment'}</span> : <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#F2F4F9] p-1"><button type="button" onClick={() => setTransactionKind('income')} className={`min-h-10 rounded-md px-2 text-[10px] font-black transition ${transactionKind === 'income' ? 'bg-white text-[#3157F5] shadow-sm' : 'text-[#64708A]'}`}>Money received</button><button type="button" onClick={() => setTransactionKind('expense')} className={`min-h-10 rounded-md px-2 text-[10px] font-black transition ${transactionKind === 'expense' ? 'bg-white text-[#3157F5] shadow-sm' : 'text-[#64708A]'}`}>Money paid</button><button type="button" onClick={() => setTransactionKind('transfer')} className={`min-h-10 rounded-md px-2 text-[10px] font-black transition ${transactionKind === 'transfer' ? 'bg-white text-[#3157F5] shadow-sm' : 'text-[#64708A]'}`}>Transfer</button></div>}</label>{!selectedObligationId && transactionKind !== 'transfer' && <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Total amount<input name="total_amount" type="number" min="0.01" step="0.01" defaultValue={transactionDraft?.total_amount ?? ''} required placeholder="0.00" className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label>}<label className="grid gap-1.5 text-xs font-bold text-[#536078]">{!selectedObligationId && transactionKind !== 'transfer' ? "Paid now" : "Amount"}<input name="amount" type="number" min={selectedObligationId ? '0.01' : '0'} step="0.01" defaultValue={transactionDraft?.paid_amount ?? ''} required placeholder="0.00" className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /></label></div>
      {financeWorkspace?.accounts.length ? <><label className="grid gap-1.5 text-xs font-bold text-[#536078]">{transactionKind === 'transfer' ? 'Money leaves this account' : 'Account'}<select name="account" required={transactionKind === 'transfer'} defaultValue="" className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-normal text-[#111B33]"><option value="">{transactionKind === 'transfer' ? 'Choose source account' : 'No account selected'}</option>{financeWorkspace.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>{transactionKind === 'transfer' && <label className="grid gap-1.5 text-xs font-bold text-[#536078]">Money goes to<select name="transfer_account" required defaultValue="" className="h-11 rounded-lg border border-[#111B33]/15 bg-white px-3 text-sm font-normal text-[#111B33]"><option value="">Choose destination account</option>{financeWorkspace.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>}</> : transactionKind === 'transfer' ? <p role="alert" className="text-xs text-[#A4362B]">Add two accounts before recording a transfer.</p> : null}
      {!selectedObligationId && transactionKind !== 'transfer' && <div className="grid gap-2"><label className="grid gap-1.5 text-xs font-bold text-[#536078]">Customer or supplier<input name="contact_search" value={contactSearch} onChange={(event) => { setContactSearch(event.target.value); setSelectedContactId(''); setSelectedObligationId(''); const value = event.target.value.trim().toLowerCase(); const expectedKind = transactionKind === 'income' ? 'customer' : 'supplier'; const found = financeWorkspace?.contacts.find((contact) => contact.kind === expectedKind && (contact.name.toLowerCase() === value || contact.phone?.toLowerCase() === value)); if (found) { setNewContactName(found.name); setNewContactPhone(found.phone || ''); setNewContactEmail(found.email || ''); } else if (/^[+\d][\d\s()\-]{5,}$/.test(event.target.value.trim())) { setNewContactName(''); setNewContactPhone(event.target.value.trim()); setNewContactEmail(''); } else { setNewContactName(event.target.value); setNewContactPhone(''); setNewContactEmail(''); } }} list="transaction-contacts" placeholder="Search by name or phone (optional)" className="h-11 rounded-lg border border-[#111B33]/15 px-3 text-sm font-normal text-[#111B33] outline-none focus:border-[#3157F5] focus:ring-4 focus:ring-[#3157F5]/10" /><datalist id="transaction-contacts">{(financeWorkspace?.contacts ?? []).filter((contact) => contact.kind === (transactionKind === 'income' ? 'customer' : 'supplier')).flatMap((contact) => [<option key={`${contact.id}-name`} value={contact.name}>{contact.phone || contact.kind}</option>, ...(contact.phone ? [<option key={`${contact.id}-phone`} value={contact.phone}>{contact.name}</option>] : [])])}</datalist>{contactSearch.trim() && !selectedContactId && <div className="grid max-h-40 gap-1 overflow-y-auto rounded-lg border border-[#111B33]/10 bg-white p-1 shadow-sm">{(financeWorkspace?.contacts ?? []).filter((contact) => { const query = contactSearch.trim().toLowerCase(); return contact.kind === (transactionKind === 'income' ? 'customer' : 'supplier') && (contact.name.toLowerCase().includes(query) || contact.phone?.toLowerCase().includes(query)); }).map((contact) => <button key={contact.id} type="button" onClick={() => { setSelectedContactId(contact.id); setContactSearch(contact.name); setNewContactName(contact.name); setNewContactPhone(contact.phone || ''); setNewContactEmail(contact.email || ''); }} className="flex items-center justify-between rounded-md px-3 py-2 text-left text-xs transition hover:bg-[#EEF1FF]"><span className="font-bold">{contact.name}</span><span className="text-[10px] text-[#758096]">{contact.phone || 'Existing contact'}</span></button>)}</div>}</label>{contactSearch.trim() && !((financeWorkspace?.contacts ?? []).some((contact) => { const value = contactSearch.trim().toLowerCase(); return contact.kind === (transactionKind === 'income' ? 'customer' : 'supplier') && (contact.name.toLowerCase() === value || contact.phone?.toLowerCase() === value); })) && <div className="grid gap-2 rounded-lg border border-[#3157F5]/15 bg-[#F7F8FF] p-3"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#3157F5]">New {transactionKind === 'income' ? 'customer' : 'supplier'}</p><p className="text-[10px] leading-4 text-[#64708A]">No matching record found. Add the details below and link it to this transaction.</p><input value={newContactName} onChange={(event) => setNewContactName(event.target.value)} placeholder="Name" required className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs outline-none" /><div className="grid grid-cols-2 gap-2"><input value={newContactPhone} onChange={(event) => setNewContactPhone(event.target.value)} placeholder="Phone" className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs outline-none" /><input value={newContactEmail} onChange={(event) => setNewContactEmail(event.target.value)} type="email" placeholder="Email" className="h-10 rounded-lg border border-[#111B33]/15 bg-white px-3 text-xs outline-none" /></div></div>}{contactSearch.trim() && (financeWorkspace?.contacts ?? []).some((contact) => { const value = contactSearch.trim().toLowerCase(); return contact.kind === (transactionKind === 'income' ? 'customer' : 'supplier') && (contact.name.toLowerCase() === value || contact.phone?.toLowerCase() === value); }) && <p className="text-[10px] font-bold text-[#557516]">Existing {transactionKind === 'income' ? 'customer' : 'supplier'} found. This transaction will be linked to that record.</p>}</div>}
      <footer className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"><button type="button" disabled={savingTransaction} onClick={() => { setRecordOpen(false); setSelectedObligationId(''); setSelectedContactId(''); setTransactionKind('income'); setContactSearch(''); setNewContactName(''); setNewContactPhone(''); setNewContactEmail(''); }} className="h-10 rounded-lg border border-[#111B33]/15 px-4 text-xs font-black disabled:opacity-60">Cancel</button><button disabled={savingTransaction || !businessId || (transactionKind === 'transfer' && (financeWorkspace?.accounts.length ?? 0) < 2)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#3157F5] px-4 text-xs font-black text-white disabled:opacity-50">{savingTransaction ? 'Saving…' : 'Save record'} {!savingTransaction && <ArrowRight className="h-4 w-4" />}</button></footer></form>}</section></div>}
  </div>;
}
