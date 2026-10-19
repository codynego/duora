const apiUrl = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';
let sessionValidUntil = 0;

async function request(path: string, body: Record<string, string>) {
  const response = await fetch(`${apiUrl}/api/v1/auth/${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail ?? Object.values(data ?? {}).flat().join(' ') ?? 'Something went wrong.');
  return data;
}

export async function signUp(username: string, password: string, passwordConfirm: string, gender = '') {
  await request('register/', { username, password, password_confirm: passwordConfirm, gender });
  sessionValidUntil = Date.now() + 14 * 60_000;
}
export async function logIn(username: string, password: string) {
  await request('token/', { username, password });
  sessionValidUntil = Date.now() + 14 * 60_000;
}
export async function requestPasswordReset(email: string) { return request('password-reset/', { email }); }

export async function getAccessToken() {
  if (Date.now() < sessionValidUntil) return 'cookie';
  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/token/refresh/`, { method: 'POST', credentials: 'include' });
    if (!response.ok) throw new Error('Refresh failed');
    sessionValidUntil = Date.now() + 14 * 60_000;
    return 'cookie';
  } catch { sessionValidUntil = 0; return null; }
}

export async function logOut() {
  try { await fetch(`${apiUrl}/api/v1/auth/logout/`, { method: 'POST', credentials: 'include' }); } finally { sessionValidUntil = 0; }
}
