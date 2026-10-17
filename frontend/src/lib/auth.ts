const apiUrl = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

function clearStoredTokens() { localStorage.removeItem('duora_access'); localStorage.removeItem('duora_refresh'); }

function expiresSoon(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp !== 'number' || payload.exp * 1000 - Date.now() < 60_000;
  } catch { return true; }
}

async function request(path: string, body: Record<string, string>) {
  const response = await fetch(`${apiUrl}/api/v1/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail ?? Object.values(data ?? {}).flat().join(' ') ?? 'Something went wrong.');
  return data;
}

export async function signUp(username: string, password: string, passwordConfirm: string) {
  const data = await request('register/', { username, password, password_confirm: passwordConfirm });
  localStorage.setItem('duora_access', data.access); localStorage.setItem('duora_refresh', data.refresh);
}
export async function logIn(username: string, password: string) {
  const data = await request('token/', { username, password });
  localStorage.setItem('duora_access', data.access); localStorage.setItem('duora_refresh', data.refresh);
}
export async function requestPasswordReset(email: string) { return request('password-reset/', { email }); }

export async function getAccessToken() {
  const access = localStorage.getItem('duora_access');
  if (access && !expiresSoon(access)) return access;
  const refresh = localStorage.getItem('duora_refresh');
  if (!refresh) return null;
  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/token/refresh/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) });
    const data = await response.json();
    if (!response.ok || !data.access) throw new Error('Refresh failed');
    localStorage.setItem('duora_access', data.access);
    if (data.refresh) localStorage.setItem('duora_refresh', data.refresh);
    return data.access as string;
  } catch { clearStoredTokens(); return null; }
}

export async function logOut() {
  const refresh = localStorage.getItem('duora_refresh');
  try { if (refresh) await fetch(`${apiUrl}/api/v1/auth/logout/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) }); } finally { clearStoredTokens(); }
}
