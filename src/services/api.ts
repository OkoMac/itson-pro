/**
 * Base API client — all service modules build on top of this.
 *
 * In demo mode: returns from local seed data (see each service file).
 * In production: calls the real REST/Supabase backend.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Auth token store ─────────────────────────────────────────────────────────
// Set by AuthContext after login so every API call carries the Bearer token.

let _authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  _authToken = token;
}

export function getAuthToken(): string | null {
  return _authToken;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    let code: string | undefined;
    let message = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const json = await res.json();
      code = json.code;
      if (json.error) message = json.error;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('GET', path, undefined, headers),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>('POST', path, body, headers),
  put: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>('PUT', path, body, headers),
  patch: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>('PATCH', path, body, headers),
  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('DELETE', path, undefined, headers),
};
