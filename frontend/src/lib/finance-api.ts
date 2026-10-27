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
  kind: 'income' | 'expense';
  description: string;
  amount: string;
  category: string;
  counterparty: string;
  occurred_on: string;
  created_at: string;
};

export type FinanceOverview = {
  business: FinanceBusiness;
  summary: {
    cash_position: string;
    income_this_month: string;
    expenses_this_month: string;
    net_this_month: string;
    transactions_this_month: number;
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

export async function createFinanceTransaction(businessId: string, input: {
  kind: 'income' | 'expense';
  description: string;
  amount: number;
  occurred_on: string;
}) {
  const response = await financeRequest<{ data: FinanceTransaction }>(`businesses/${businessId}/transactions/`, {
    method: 'POST', body: JSON.stringify(input),
  });
  return response.data;
}
