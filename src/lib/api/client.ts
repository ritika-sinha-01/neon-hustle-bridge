import { getAccessToken, clearAuthSession } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login' as any;
    }
    throw new Error('Unauthorized. Please login.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Request failed");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || "Request failed");
  }

  return json.data as T;
}

export const apiClient = {
  get: <T>(path: string) => api<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    api<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    api<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    api<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => api<T>(path, { method: "DELETE" }),
};
