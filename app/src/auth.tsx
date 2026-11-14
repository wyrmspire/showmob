import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
// This is a publishable key, never a service-role key. RLS owns every data access.
// Implicit flow on purpose: a PKCE magic link only completes in the browser
// that requested it (the code verifier lives there), so on a phone — where
// Mail/Gmail opens the link in a different browser than the one that asked
// for it — sign-in silently fails and the owner is thrown back to
// "create an account" every time. Implicit links carry the session in the
// link itself and complete in whichever browser opens them.
export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: { flowType: "implicit", detectSessionInUrl: true, autoRefreshToken: true, persistSession: true } })
  : null;

type AuthState = { session: Session | null; ready: boolean };
const AuthContext = createContext<AuthState>({ session: null, ready: false });
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, ready: !supabase });
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, ready: true });
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (active) setState((current) => ({ session: error ? null : (current.session ?? data.session), ready: true }));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
