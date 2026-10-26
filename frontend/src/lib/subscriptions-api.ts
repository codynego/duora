import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export type SubscriptionMembership = { id: string; name: string; category: string; source: 'marketplace' | 'manual'; access_method: string; monthly_cost: string; billing_type: 'recurring' | 'one_time'; status: 'active' | 'overdue' | 'paused' | 'cancelled'; next_renewal: string | null; icon_label: string; icon_color: string };
export type SubscriptionDashboard = { monthly_total: string; active_count: number; due_soon_count: number; memberships: SubscriptionMembership[]; due_soon: SubscriptionMembership[] };
export type SubscriptionPreferences = { id: string; renewal_reminders: boolean; weekly_spend_digest: boolean; updated_at: string };
export type MarketplaceOffer = { id: string; service: { id: string; name: string; slug: string; category: string; icon_label: string; icon_color: string; permitted_access_methods: string[] }; access_method: string; price: string; billing_type: 'recurring' | 'one_time'; billing_period: string; seats_available: number; renewal_day: number | null };
export type MarketplaceService = MarketplaceOffer['service'];
export type SellerOffer = MarketplaceOffer & { seats_total: number; status: 'draft' | 'pending_review' | 'active' | 'paused' | 'archived'; created_at: string };
export type MarketplaceOrder = { id: string; status: 'payment_pending' | 'paid' | 'provisioning' | 'active' | 'cancelled' | 'refunded'; amount: string; billing_type: 'recurring' | 'one_time'; expires_at: string; paid_at: string | null; provisioned_at: string | null; created_at: string; service_name: string; access_method: string };

async function request(path: string, init: RequestInit = {}) {
  const token = await getAccessToken({ redirectOnFailure: false });
  if (!token) throw new Error('Sign in to manage your subscriptions.');
  const response = await fetch(`${api}/api/v1/subscriptions/${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail ?? 'Could not complete that request.');
  return body.data;
}

export const getSubscriptionDashboard = () => request('dashboard/') as Promise<SubscriptionDashboard>;
export const createManualSubscription = (input: { custom_name: string; category: string; monthly_cost: string; billing_type: 'recurring' | 'one_time'; next_renewal?: string }) => request('memberships/', { method: 'POST', body: JSON.stringify({ ...input, status: 'active' }) }) as Promise<SubscriptionMembership>;
export const getSubscriptionPreferences = () => request('preferences/') as Promise<SubscriptionPreferences>;
export const saveSubscriptionPreferences = (input: Pick<SubscriptionPreferences, 'renewal_reminders' | 'weekly_spend_digest'>) => request('preferences/', { method: 'PUT', body: JSON.stringify(input) }) as Promise<SubscriptionPreferences>;

export async function getPublicMarketplaceOffers() {
  const response = await fetch(`${api}/api/v1/subscriptions/offers/`, { next: { revalidate: 300 } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail ?? 'Could not load marketplace offers.');
  return (body.data ?? []) as MarketplaceOffer[];
}
export const getMarketplaceServices = () => request('services/') as Promise<MarketplaceService[]>;
export const getSellerOffers = () => request('offers/mine/') as Promise<SellerOffer[]>;
export const createSellerOffer = (input: { service_id: string; access_method: string; price: string; billing_type: 'recurring' | 'one_time'; billing_period: string; seats_total: number; seats_available: number; renewal_day?: number | null }) => request('offers/mine/', { method: 'POST', body: JSON.stringify(input) }) as Promise<SellerOffer>;
export const reserveMarketplaceSeat = (offerId: string) => request(`offers/${offerId}/reserve/`, { method: 'POST' }) as Promise<MarketplaceOrder>;
export const getMarketplaceOrders = () => request('orders/') as Promise<MarketplaceOrder[]>;
