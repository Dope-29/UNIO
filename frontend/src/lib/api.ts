const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

type Envelope<T> = { data: T };
export type ApiPage<T> = Envelope<T[]> & { total: number; page: number; take: number };

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Cannot reach the backend. Check that the API server is running and the frontend URL is configured correctly.', 0);
  }

  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    const fallback = response.status >= 500
      ? 'The backend could not process the request. Check the API server and database connection.'
      : `Request failed (HTTP ${response.status}).`;
    throw new ApiError(error?.message ?? fallback, response.status, error?.code, error?.fields);
  }
  return body as T;
}

export const get = <T>(path: string) => api<T>(path);
export const post = <T>(path: string, data: unknown = {}) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(data) });
export const patch = <T>(path: string, data: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(data) });
export const del = (path: string) => api<void>(path, { method: 'DELETE' });

export function messageFrom(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Unable to reach the server. Please try again.';
}
