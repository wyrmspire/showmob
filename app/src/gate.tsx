import React, { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./auth";

/**
 * Shared grader passcode gate (used by /grading and /everything).
 *
 * The passcode is the same one the grading API expects in the
 * `x-grading-passcode` header (configured server-side, never in the repo).
 * The browser remembers it in localStorage; every gated surface verifies it
 * against /api/gn before rendering, so entering it once unlocks all of them.
 *
 * A signed-in admin account is the other way in: the grading API also
 * accepts an admin's account token, so the site owner never needs the
 * passcode at all. The passcode remains for graders without an account.
 */
const PASSCODE_KEY = "showmob-grading-passcode";

export function loadPasscode(): string {
  try {
    return localStorage.getItem(PASSCODE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePasscode(code: string): void {
  try {
    localStorage.setItem(PASSCODE_KEY, code);
  } catch {
    // Private mode: keep it for this session only.
  }
}

export function clearPasscode(): void {
  try {
    localStorage.removeItem(PASSCODE_KEY);
  } catch {
    // nothing stored
  }
}

/**
 * The current account session, waiting briefly for one to appear. A browser
 * that just opened a sign-in link processes the session from the URL
 * asynchronously, so an instant check would miss it.
 */
async function currentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const client = supabase;
  const { data } = await client.auth.getSession();
  if (data.session) return data.session;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      subscription.unsubscribe();
      resolve(null);
    }, 2500);
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          clearTimeout(timer);
          subscription.unsubscribe();
          resolve(session);
        }
      },
    );
  });
}

/**
 * The signed-in admin's access token, or null. Admin is read from the
 * account's own profile row (RLS lets an owner read only their own), and
 * the grading API re-checks it server-side before accepting it.
 */
export async function adminAccessToken(): Promise<string | null> {
  try {
    if (!supabase) return null;
    const session = await currentSession();
    if (!session?.user.id) return null;
    const { data } = await supabase
      .from("showmob_profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();
    return data?.is_admin === true ? session.access_token : null;
  } catch {
    return null;
  }
}

/**
 * Auth headers for the grading API: the passcode when one was entered,
 * otherwise the signed-in admin's account token.
 */
export async function gnAuthHeaders(
  code: string,
): Promise<Record<string, string>> {
  if (code) return { "x-grading-passcode": code };
  const token = await adminAccessToken();
  if (token) return { authorization: `Bearer ${token}` };
  return { "x-grading-passcode": code };
}

/** Verify a passcode against the grading API. Loads nothing on success. */
export async function verifyPasscode(
  code: string,
): Promise<"ok" | "bad" | "error"> {
  try {
    const res = await fetch("/api/gn", {
      cache: "no-store",
      headers: await gnAuthHeaders(code),
    });
    if (res.status === 401) return "bad";
    if (!res.ok) return "error";
    // Drain the body so the connection can be reused; content is ignored.
    await res.json().catch(() => undefined);
    return "ok";
  } catch {
    return "error";
  }
}

export function PasscodeGate({
  onSubmit,
  error,
  label = "Grader passcode",
}: {
  onSubmit: (code: string) => void;
  error: string;
  label?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="gn-gate"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label>
        {label}
        <input
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      </label>
      <button type="submit">Unlock</button>
      {error && <p className="gn-error">{error}</p>}
      <p>
        <small>
          Asked once; this browser remembers it. Signed in as the site
          admin? You skip this — your account unlocks it.
        </small>
      </p>
    </form>
  );
}
