'use client';

const apiOrigin = new URL(process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000').origin;
let configured = false;

/** Ensures every API request carries the HttpOnly session cookie. */
export function ApiCredentials() {
  if (!configured) {
    const nativeFetch = window.fetch;
    window.fetch = (input, init = {}) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (new URL(url, window.location.href).origin !== apiOrigin || init.credentials) return nativeFetch(input, init);
      return nativeFetch(input, { ...init, credentials: 'include' });
    };
    configured = true;
  }
  return null;
}
