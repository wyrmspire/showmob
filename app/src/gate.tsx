import React, { useState } from "react";

/**
 * Shared grader passcode gate (used by /grading and /everything).
 *
 * The passcode is the same one the grading API expects in the
 * `x-grading-passcode` header (configured server-side, never in the repo).
 * The browser remembers it in localStorage; every gated surface verifies it
 * against /api/gn before rendering, so entering it once unlocks all of them.
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

/** Verify a passcode against the grading API. Loads nothing on success. */
export async function verifyPasscode(
  code: string,
): Promise<"ok" | "bad" | "error"> {
  try {
    const res = await fetch("/api/gn", {
      cache: "no-store",
      headers: { "x-grading-passcode": code },
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
        <small>Asked once; this browser remembers it.</small>
      </p>
    </form>
  );
}
