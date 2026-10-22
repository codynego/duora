const apiUrl = process.env.NEXT_PUBLIC_DUORA_API_URL ?? "http://127.0.0.1:8000";
let sessionValidUntil = 0;
let credentialsConfigured = false;
let refreshInFlight: Promise<boolean> | null = null;

// This module is imported before every authenticated call. Configure this at
// import time rather than after React hydration, so the request immediately
// following a successful login includes the new HttpOnly cookie as well.
function configureApiCredentials() {
  if (typeof window === "undefined" || credentialsConfigured) return;
  const apiOrigin = new URL(apiUrl).origin;
  const nativeFetch = window.fetch;
  window.fetch = (input, init = {}) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (
      new URL(url, window.location.href).origin !== apiOrigin ||
      init.credentials
    )
      return nativeFetch(input, init);
    return nativeFetch(input, { ...init, credentials: "include" });
  };
  credentialsConfigured = true;
}

configureApiCredentials();

async function request(path: string, body: Record<string, string>) {
  const response = await fetch(`${apiUrl}/api/v1/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (response.status === 429)
    throw new Error(
      "Too many attempts from this connection. Please wait a few minutes, then try again.",
    );
  if (!response.ok)
    throw new Error(
      data?.detail ??
        Object.values(data ?? {})
          .flat()
          .join(" ") ??
        "Something went wrong.",
    );
  return data;
}

export async function signUp(
  email: string,
  password: string,
  passwordConfirm: string,
  dateOfBirth: string,
) {
  await request("register/", {
    email,
    password,
    password_confirm: passwordConfirm,
    date_of_birth: dateOfBirth,
  });
  sessionValidUntil = Date.now() + 14 * 60_000;
}
export async function logIn(username: string, password: string) {
  await request("token/", { username, password });
  sessionValidUntil = Date.now() + 14 * 60_000;
}
export async function requestPasswordReset(email: string) {
  return request("password-reset/", { email });
}

function redirectToLogin() {
  if (
    typeof window === "undefined" ||
    /^\/(login|signup|forgot-password)/.test(window.location.pathname)
  )
    return;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

export async function getAccessToken({
  redirectOnFailure = true,
}: { redirectOnFailure?: boolean } = {}) {
  if (Date.now() < sessionValidUntil) return "cookie";
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${apiUrl}/api/v1/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) return false;
        sessionValidUntil = Date.now() + 14 * 60_000;
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  const refreshed = await refreshInFlight;
  if (refreshed) return "cookie";
  sessionValidUntil = 0;
  if (redirectOnFailure) redirectToLogin();
  return null;
}

export async function logOut() {
  try {
    await fetch(`${apiUrl}/api/v1/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    sessionValidUntil = 0;
  }
}
