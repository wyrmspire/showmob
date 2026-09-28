import React, { useEffect, useState } from "react";
import { supabase, useAuth } from "./auth";

export function Account({ home }: { home: () => void }) {
  const { session, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    setAdmin(false);
    if (!supabase || !session?.user.id) return;
    let active = true;
    supabase.from("showmob_profiles").select("is_admin").eq("id", session.user.id).single()
      .then(({ data }) => { if (active) setAdmin(data?.is_admin === true); });
    return () => { active = false; };
  }, [session?.user.id]);
  async function sendLink(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true); setNotice("");
    // The origin is derived from the current site, not user input.
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: {
      emailRedirectTo: `${location.origin}/account`, shouldCreateUser: true,
    } });
    setNotice(error ? `Could not send link: ${error.message}` : "Check your email for a sign-in link. You can close this page and return from the link.");
    setBusy(false);
  }
  return <main className="artifact theme-paper"><header className="toolbar"><button className="plain" onClick={home}>← Ideas</button></header>
    <div className="shell"><section className="block account-panel">
      <span className="eyebrow">Showmob account</span><h1>Your pages, your data</h1>
      {!supabase ? <p>Sign-in is not configured on this deployment yet. The site can still show its public pages.</p>
        : !ready ? <p role="status">Checking your session…</p>
        : session ? <><p>Signed in as <strong>{session.user.email}</strong>{admin ? " · Admin" : ""}.</p>
          <p>Your activity log belongs to this account. Admin access is provisioned by the site owner, never from this page.</p>
          <button className="file-button" onClick={async () => { setBusy(true); const { error } = await supabase!.auth.signOut(); setNotice(error?.message ?? "Signed out."); setBusy(false); }} disabled={busy}>Sign out</button></>
        : <><p>Sign in with an email link. New accounts can be created here; no password is needed. Opening the link signs you into this browser.</p>
          <form onSubmit={sendLink}><label htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="file-button" type="submit" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button></form></>}
      {notice && <p role="status">{notice}</p>}
    </section></div></main>;
}
