import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export type AdminOperations = {
  overview: {
    total_users: number; active_users: number; unverified_users: number; new_users_7d: number;
    businesses: number; new_businesses_7d: number; whatsapp_opt_ins: number; transactions_7d: number;
  };
  users: Array<{ id: number; email: string; is_active: boolean; is_staff: boolean; date_joined: string; business_count: number }>;
  businesses: Array<{ id: string; name: string; owner_email: string; plan: string; setup_choice: string; created_at: string; whatsapp_number: string; whatsapp_marketing_opt_in: boolean }>;
  onboarding: Array<{ id: number; email: string; verified: boolean; business_count: number; date_joined: string }>;
  email: { provider: string; configured: boolean; from_email: string; supported_flows: string[]; delivery_history_available: boolean };
  support: { email: string; inbox_connected: boolean; note: string };
  audit: Array<{ id: string; action: string; actor_email: string; business_name: string; transaction_description: string; created_at: string }>;
};

export async function getAdminOperations() {
  const token = await getAccessToken({ redirectOnFailure: false });
  if (!token) throw new Error('Sign in with an admin account to open operations.');
  const response = await fetch(`${api}/api/v1/auth/admin/operations/`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 403) throw new Error('This account does not have admin access.');
  if (!response.ok) throw new Error(payload?.detail ?? 'Could not load admin operations.');
  return payload as AdminOperations;
}
