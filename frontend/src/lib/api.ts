// Typed fetch client for the Shuroku backend.
// Access token lives in memory; refresh token is an httpOnly cookie the
// browser sends automatically to /auth/* (credentials: 'include').

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};
export const getAccessToken = () => accessToken;

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean; // attach bearer token
  _retry?: boolean;
}

async function refresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken: string };
    accessToken = data.accessToken;
    return true;
  } catch {
    return false;
  }
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, _retry, headers, ...rest } = opts;
  const h = new Headers(headers);
  if (body !== undefined) h.set('Content-Type', 'application/json');
  if (auth && accessToken) h.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: h,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // One transparent refresh attempt on expired access token.
  if (res.status === 401 && auth && !_retry) {
    if (await refresh()) {
      return api<T>(path, { ...opts, _retry: true });
    }
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (data as any).error ?? 'Request failed', (data as any).details);
  }
  return data as T;
}

// Try to restore a session on app load (refresh cookie may still be valid).
export async function bootstrapSession(): Promise<boolean> {
  return refresh();
}
