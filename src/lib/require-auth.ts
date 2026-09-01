import { redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";

/** Redirect unauthenticated users to login (client-side only; SSR skips check). */
export function requireAuth() {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    throw redirect({ to: "/login" });
  }
}
