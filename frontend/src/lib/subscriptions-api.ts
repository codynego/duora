import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export type SubscriptionMembership = { id: string; name: string; category: string; source: 'marketplace' | 'manual'; access_method: string; monthly_cost: string; status: 'active' | 'overdue' | 'paused' | 'cancelled'; next_renewal: string | null; icon_label: string; icon_color: string };
export type SubscriptionDashboard = { monthly_total: string; active_count: number; due_soon_count: number; memberships: SubscriptionMembership[]; due_soon: SubscriptionMembership[] };

async function request(path: string, init: RequestInit = {}) {
  const token = await getAccessToken({ redirectOnFailure: false });
  if (!token) throw new Error('Sign in to manage your subscriptions.');
  const response = await fetch(`${api}/api/v1/subscriptions/${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail ?? 'Could not complete that request.');
  return body.data;
}

export const getSubscriptionDashboard = () => request('dashboard/') as Promise<SubscriptionDashboard>;
export const createManualSubscription = (input: { custom_name: string; category: string; monthly_cost: string; next_renewal: string }) => request('memberships/', { method: 'POST', body: JSON.stringify({ ...input, status: 'active' }) }) as Promise<SubscriptionMembership>;
