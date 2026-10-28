import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export type FinanceBusiness = {
  id: string;
  name: string;
  business_type: string;
  industry: string;
  country: string;
  currency: string;
  record_keeping: string;
  setup_choice: string;
  plan: string;
  opening_balance: string;
};

export type FinanceTransaction = {
  id: string;
  kind: 'income' | 'expense' | 'transfer';
  description: string;
  amount: string;
  category: string;
  counterparty: string;
  account: string | null;
  account_name: string | null;
  transfer_account: string | null;
  transfer_account_name: string | null;
  contact: string | null;
  contact_name: string | null;
  obligation: string | null;
  obligation_description: string | null;
  occurred_on: string;
  occurred_at: string | null;
  created_at: string;
};

export type FinanceAccount = {
  id: string; name: string; kind: 'cash' | 'bank' | 'other'; currency: string;
  opening_balance: string; balance: string; is_active: boolean;
};

export type FinanceContact = {
  id: string; kind: 'customer' | 'supplier'; name: string; email: string; phone: string;
  notes: string; outstanding_balance: string; last_transaction_on: string | null;
};

export type FinanceObligation = {
  id: string; contact: string; contact_name: string; kind: 'receivable' | 'payable';
  description: string; reference: string; amount: string; balance: string;
  due_date: string | null; status: 'open' | 'partial' | 'disputed' | 'settled';
  affects_performance: boolean;
};

export type FinanceInsight = {
  id: string; severity: 'high' | 'review'; status: string; title: string; detail: string;
  evidence_count: number; source: string; action_url: string; transaction_ids?: string[];
  impact_amount?: string; action_label?: string; suggestion?: string;
  period_start?: string; period_end?: string; comparison_start?: string; comparison_end?: string;
  evidence?: Array<{ id: string; contact?: string; description: string; due_date?: string; balance?: string; date?: string; amount?: string; counterparty?: string; period?: 'current' | 'previous' }>;
};

export type FinancePerformanceMonth = { month: string; income: string; expenses: string; net: string };

export type FinanceWorkspace = {
  accounts: FinanceAccount[]; contacts: FinanceContact[]; obligations: FinanceObligation[];
  insights: FinanceInsight[]; intelligenceSummary: { open_findings: number; potential_impact: string };
  performance: FinancePerformanceMonth[];
};

export type FinanceOverview = {
  business: FinanceBusiness;
  summary: {
    cash_position: string;
    income_this_month: string;
    expenses_this_month: string;
    net_this_month: string;
    transactions_this_month: number;
    receivables_outstanding?: string;
    payables_outstanding?: string;
    receivables_overdue?: string;
    payables_overdue?: string;
    receivables_due_soon?: string;
    payables_due_soon?: string;
    payables_due_today?: string;
  };
  transactions: FinanceTransaction[];
  is_sample: false;
};

async function financeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  const response = await fetch(`${api}/api/v1/finance/${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.detail ?? Object.values(payload ?? {}).flat().join(' ');
    throw new Error(typeof detail === 'string' && detail ? detail : 'We could not save your financial information.');
  }
  return payload as T;
}

export async function getBusinesses() {
  const response = await financeRequest<{ data: FinanceBusiness[] }>('businesses/');
  return response.data;
}

export async function updateFinanceBusiness(businessId: string, input: Partial<Pick<FinanceBusiness,
  'name' | 'business_type' | 'industry' | 'country' | 'currency' | 'record_keeping' | 'setup_choice' | 'opening_balance'>>) {
  const response = await financeRequest<{ data: FinanceBusiness }>(`businesses/${businessId}/`, {
    method: 'PATCH', body: JSON.stringify(input),
  });
  return response.data;
}

export async function createBusiness(input: {
  name: string;
  business_type: string;
  industry: string;
  country: string;
  currency: string;
  record_keeping: string;
  setup_choice: string;
}) {
  const response = await financeRequest<{ data: FinanceBusiness }>('businesses/', {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}

export async function getFinanceOverview(businessId: string) {
  return financeRequest<FinanceOverview>(`businesses/${businessId}/overview/`);
}

export async function getFinanceWorkspace(businessId: string): Promise<FinanceWorkspace> {
  const [accounts, contacts, obligations, insights, performance] = await Promise.all([
    financeRequest<{ data: FinanceAccount[] }>(`businesses/${businessId}/accounts/`),
    financeRequest<{ data: FinanceContact[] }>(`businesses/${businessId}/contacts/`),
    financeRequest<{ data: FinanceObligation[] }>(`businesses/${businessId}/obligations/`),
    financeRequest<{ data: FinanceInsight[]; summary?: { open_findings: number; potential_impact: string } }>(`businesses/${businessId}/intelligence/`),
    financeRequest<{ data: FinancePerformanceMonth[] }>(`businesses/${businessId}/performance/`),
  ]);
  return { accounts: accounts.data, contacts: contacts.data, obligations: obligations.data,
    insights: insights.data,
    intelligenceSummary: insights.summary ?? { open_findings: insights.data.length, potential_impact: '0.00' },
    performance: performance.data };
}

export async function createFinanceContact(businessId: string, input: {
  kind: 'customer' | 'supplier'; name: string; email?: string; phone?: string; notes?: string;
}) {
  const response = await financeRequest<{ data: FinanceContact }>(`businesses/${businessId}/contacts/`, {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}

export async function createFinanceAccount(businessId: string, input: {
  name: string; kind: 'cash' | 'bank' | 'other'; currency?: string; opening_balance?: string;
}) {
  const response = await financeRequest<{ data: FinanceAccount }>(`businesses/${businessId}/accounts/`, {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}

export async function createFinanceObligation(businessId: string, input: {
  contact: string; kind: 'receivable' | 'payable'; description: string; reference?: string;
  amount: string; due_date?: string | null; affects_performance?: boolean;
}) {
  const response = await financeRequest<{ data: FinanceObligation }>(`businesses/${businessId}/obligations/`, {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateFinanceObligation(businessId: string, obligationId: string, input: Partial<{
  description: string; reference: string; amount: string; due_date: string | null; affects_performance: boolean;
}>) {
  const response = await financeRequest<{ data: FinanceObligation }>(`businesses/${businessId}/obligations/${obligationId}/`, {
    method: 'PATCH', body: JSON.stringify(input),
  });
  return response.data;
}

export async function deleteFinanceObligation(businessId: string, obligationId: string) {
  await financeRequest<unknown>(`businesses/${businessId}/obligations/${obligationId}/`, { method: 'DELETE' });
}

export async function createFinanceTransaction(businessId: string, input: {
  kind: 'income' | 'expense' | 'transfer';
  description: string;
  amount: string;
  occurred_on: string;
  occurred_at?: string | null;
  account?: string | null;
  transfer_account?: string | null;
  contact?: string | null;
  obligation?: string | null;
}) {
  const response = await financeRequest<{ data: FinanceTransaction }>(`businesses/${businessId}/transactions/`, {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}

export type TransactionDraft = {
  kind: 'income' | 'expense' | 'transfer' | 'unknown';
  description: string;
  total_amount: number | null;
  paid_amount: number | null;
  contact_name: string | null;
  account_name: string | null;
  transfer_account_name: string | null;
  due_date: string | null;
  payment_method: string | null;
  missing_details: string[];
  note: string;
};

export async function parseFinanceTransaction(businessId: string, text: string) {
  const response = await financeRequest<{ data: TransactionDraft }>(`businesses/${businessId}/transactions/parse/`, {
    method: 'POST', body: JSON.stringify({ text }),
  });
  return response.data;
}

export async function updateFinanceTransaction(businessId: string, transactionId: string, input: Partial<{
  description: string; amount: string; occurred_on: string; occurred_at: string | null;
  category: string; counterparty: string; account: string | null;
}>) {
  const response = await financeRequest<{ data: FinanceTransaction }>(`businesses/${businessId}/transactions/${transactionId}/`, {
    method: 'PATCH', body: JSON.stringify(input),
  });
  return response.data;
}

export async function voidFinanceTransaction(businessId: string, transactionId: string, reason?: string) {
  const response = await financeRequest<{ data: FinanceTransaction }>(`businesses/${businessId}/transactions/${transactionId}/`, {
    method: 'DELETE', body: JSON.stringify({ reason }),
  });
  return response.data;
}
