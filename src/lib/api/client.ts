import { getAccessToken, clearAuthSession } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

interface ApiErrorBody {
  success?: boolean;
  error?: {
    message?: string;
    details?: Array<{ msg?: string; path?: string }>;
  };
  message?: string;
}

function parseErrorMessage(body: ApiErrorBody, fallback: string): string {
  const details = body.error?.details;
  if (details?.length) {
    return details.map((d) => d.msg).filter(Boolean).join(". ");
  }
  return body.error?.message || body.message || fallback;
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection and try again.",
    );
  }

  if (res.status === 401) {
    clearAuthSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    const body: ApiErrorBody = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(body, res.statusText || "Request failed"));
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(parseErrorMessage(json, "Request failed"));
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
