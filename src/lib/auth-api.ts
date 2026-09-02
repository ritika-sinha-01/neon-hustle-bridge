import type { User } from "@/lib/auth";
import { apiClient, type AuthResponse } from "@/lib/api/client";

export interface RegisterPayload {
  email: string;
  password: string;
  role: "student" | "client";
  fullName?: string;
  companyName?: string;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

export function validateRegisterForm(input: {
  role: "student" | "client";
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  companyName: string;
}): string | null {
  if (input.role !== "student" && input.role !== "client") {
    return "Please select a valid account type.";
  }

  if (input.role === "student" && !input.fullName.trim()) {
    return "Full name is required.";
  }

  if (input.role === "client" && !input.companyName.trim()) {
    return "Company name is required.";
  }

  const emailError = validateEmail(input.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(input.password);
  if (passwordError) return passwordError;

  if (input.password !== input.confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthResponse> {
  const body: Record<string, string> = {
    email: payload.email.trim(),
    password: payload.password,
    role: payload.role,
  };

  if (payload.role === "student") {
    body.fullName = payload.fullName?.trim() ?? "";
  } else {
    body.companyName = payload.companyName?.trim() ?? "";
  }

  return apiClient.post<AuthResponse>("/auth/register", body);
}

export async function loginAccount(email: string, password: string): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", {
    email: email.trim(),
    password,
  });
}

export function authUserFromResponse(response: AuthResponse): User {
  return {
    id: response.user.id,
    email: response.user.email,
    role: response.user.role,
    fullName: response.user.fullName,
    companyName: response.user.companyName,
  };
}
