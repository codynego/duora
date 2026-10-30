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
  whatsapp_number: string;
  whatsapp_marketing_opt_in: boolean;
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

export type FinanceProduct = {
  id: string; name: string; sku: string; category: string; description: string;
  product_type: 'product' | 'service'; selling_price: string; cost_price: string | null;
  is_active: boolean; status: 'active' | 'archived';
};

export type FinanceInsight = {
  id: string; severity: 'high' | 'review'; status: string; title: string; detail: string;
  evidence_count: number; source: string; action_url: string; transaction_ids?: string[];
  impact_amount?: string; action_label?: string; suggestion?: string;
  period_start?: string; period_end?: string; comparison_start?: string; comparison_end?: string;
  feedback?: '' | 'useful' | 'not_relevant' | 'handled'; first_seen_at?: string; last_seen_at?: string;
  risk_label?: string; why_it_matters?: string;
  metrics?: Array<{ label: string; value: string | number; format: 'currency' | 'number' | 'percent' | 'signed_percent' }>;
  suggested_questions?: string[];
  evidence?: Array<{ id: string; contact?: string; description: string; due_date?: string; balance?: string; date?: string; amount?: string; counterparty?: string; period?: 'current' | 'previous' }>;
};

export async function updateFinanceFinding(businessId: string, findingId: string, input: {
  status?: 'new' | 'planning' | 'resolved';
  feedback?: '' | 'useful' | 'not_relevant' | 'handled';
}) {
  const response = await financeRequest<{ data: FinanceInsight }>(
    `businesses/${businessId}/intelligence/findings/${encodeURIComponent(findingId)}/`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
  return response.data;
}

export type FinancePerformanceMonth = { month: string; income: string; expenses: string; net: string };
export type FinancePerformanceDay = { date: string; income: string; expenses: string; net: string };
export type FinanceForecastEvent = { date: string; direction: 'inflow' | 'outflow'; amount: string; description: string; contact?: string; source: string; source_id?: string | null };
export type FinanceForecastDay = { date: string; opening_balance: string; inflows: string; outflows: string; closing_balance: string; events: FinanceForecastEvent[] };
export type FinanceForecast = {
  currency: string; basis: string; horizon_days: number; period_start: string; period_end: string;
  opening_balance: string; projected_closing_balance: string; lowest_balance: string; lowest_balance_date: string;
  cash_buffer: string; first_buffer_breach: string | null; timeline: FinanceForecastDay[];
  assumptions: string[]; limitations: { undated_open_obligations: { receivables: number; payables: number }; overdue_amounts_not_assigned_a_future_date: { receivables: string; payables: string } };
};
export type FinancialHealth = {
  status: 'needs_review' | 'steady' | 'limited'; title: string; detail: string;
  data_quality: { status: 'ready' | 'limited'; record_count: number; account_count: number; note: string };
  performance: { status: 'ready' | 'limited'; period_start: string; period_end: string; comparison_start: string; comparison_end: string; income: string; expenses: string; net_recorded_movement: string; income_change_percent: number | null; expense_change_percent: number | null };
  cash_flow: { status: 'needs_review' | 'ready' | 'limited'; recorded_cash: string; known_payables_next_7_days: string; cash_after_known_payables: string; overdue_receivables: string; note: string };
};

export type FinanceWorkspace = {
  accounts: FinanceAccount[]; contacts: FinanceContact[]; obligations: FinanceObligation[];
  products: FinanceProduct[];
  insights: FinanceInsight[]; intelligenceSummary: { open_findings: number; potential_impact: string }; financialHealth?: FinancialHealth;
  performance: FinancePerformanceMonth[]; performanceDaily: FinancePerformanceDay[];
  forecast?: FinanceForecast;
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
  'name' | 'business_type' | 'industry' | 'country' | 'currency' | 'record_keeping' | 'setup_choice' | 'whatsapp_number' | 'whatsapp_marketing_opt_in' | 'opening_balance'>>) {
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
  whatsapp_number?: string;
  whatsapp_marketing_opt_in?: boolean;
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
  const [accounts, contacts, obligations, products, insights, performance, forecast] = await Promise.all([
    financeRequest<{ data: FinanceAccount[] }>(`businesses/${businessId}/accounts/`),
    financeRequest<{ data: FinanceContact[] }>(`businesses/${businessId}/contacts/`),
    financeRequest<{ data: FinanceObligation[] }>(`businesses/${businessId}/obligations/`),
    financeRequest<{ data: FinanceProduct[] }>(`businesses/${businessId}/products/`),
    financeRequest<{ data: FinanceInsight[]; summary?: { open_findings: number; potential_impact: string }; health?: FinancialHealth }>(`businesses/${businessId}/intelligence/`),
    financeRequest<{ data: FinancePerformanceMonth[]; daily_data?: FinancePerformanceDay[] }>(`businesses/${businessId}/performance/`),
    financeRequest<{ data: FinanceForecast }>(`businesses/${businessId}/forecast/?horizon_days=30`),
  ]);
  return { accounts: accounts.data, contacts: contacts.data, obligations: obligations.data, products: products.data,
    insights: insights.data,
    intelligenceSummary: insights.summary ?? { open_findings: insights.data.length, potential_impact: '0.00' },
    financialHealth: insights.health,
    performance: performance.data, performanceDaily: performance.daily_data ?? [], forecast: forecast.data };
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
  line_items?: Array<{ product: string; quantity: string; unit_price: string; discount_amount?: string }>;
}) {
  const response = await financeRequest<{ data: FinanceTransaction }>(`businesses/${businessId}/transactions/`, {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}

export async function createFinanceProduct(businessId: string, input: {
  name: string; sku?: string; category?: string; description?: string; product_type: 'product' | 'service';
  selling_price: string; cost_price?: string | null;
}) {
  const response = await financeRequest<{ data: FinanceProduct }>(`businesses/${businessId}/products/`, {
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

export type FinanceChatChart = { type: 'bar'; title: string; labels: string[]; values: Array<string | number> };
export type FinanceChatMessage = { role: 'user' | 'assistant'; content: string; chart?: FinanceChatChart | null };

export async function askFinanceController(businessId: string, question: string, history: FinanceChatMessage[] = []) {
  const response = await financeRequest<{ data: { answer: string; grounded: boolean; chart?: FinanceChatChart | null } }>(`businesses/${businessId}/intelligence/chat/`, {
    method: 'POST', body: JSON.stringify({ question, history: history.slice(-8) }),
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
