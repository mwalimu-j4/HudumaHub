// Auth Feature — API Layer
import type { AuthUser } from "./types";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://huduma-jqiq.onrender.com/api";

/**
 * Fetch the currently authenticated user's profile.
 * Returns null if not authenticated (401).
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { success: boolean; data: AuthUser };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Log out the current user (destroys server session).
 */
export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Get the Google OAuth login URL.
 * The server will redirect to Google, then back to the callback.
 */
export function getGoogleAuthUrl(): string {
  return `${API_BASE}/auth/google`;
}
