import { getAccessToken, clearAuthSession } from "@/lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

interface ApiErrorBody {
  success?: boolean;
  error?: {
    message?: string;
    code?: string;
    details?: Array<{ msg?: string; path?: string }>;
  };
  message?: string;
}

function isAuthRoute(path: string): boolean {
  return path.startsWith("/auth/login") || path.startsWith("/auth/register");
}

function parseErrorMessage(body: ApiErrorBody, fallback: string): string {
  const details = body.error?.details;
  if (details?.length) {
    return details.map((d) => d.msg).filter(Boolean).join(". ");
  }
  return body.error?.message || body.message || fallback;
}

function friendlyStatusMessage(status: number, body: ApiErrorBody): string {
  const parsed = parseErrorMessage(body, "");
  if (parsed) return parsed;

  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Invalid email or password.";
    case 409:
      return "Email is already registered. Try signing in instead.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return status >= 500
        ? "Server error. Please try again later."
        : "Request failed. Please try again.";
  }
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const authRoute = isAuthRoute(path);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && !authRoute ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection and try again.",
    );
  }

  if (res.status === 401 && !authRoute) {
    clearAuthSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    const body: ApiErrorBody = await res.json().catch(() => ({}));
    throw new Error(friendlyStatusMessage(res.status, body));
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

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: "student" | "client";
    fullName?: string;
    companyName?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
