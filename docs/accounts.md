# Account and activity-log preview

The content library stays in repository JSON. Accounts here only identify readers and store the `activity-week` widget's dated log. The authoring API and grading passcode remain separate; an admin profile does not grant access to either of them.

## Decision: open email-link signup

A reader can request a passwordless link and create an account. This fits a public reader-facing activity log better than a hand-created user list. Supabase's email provider, redirect allowlist and rate limits must be reviewed before enabling this in the hosted project. Opening an email link authenticates that inbox; merely knowing or entering an address never grants a session. No password, social feed, admin dashboard, or public activity data is included.

## Activation (not performed by merging a PR)

1. Review and apply `supabase/migrations/20260928131000_account_activity.sql` to **showmob-dev** using the Supabase SQL editor. The earlier migrations in this repo were applied manually and do not have matching CLI history. Do **not** run `supabase db push` without first reconciling migration history.
2. In the private SQL editor, insert the approved first-admin email into `public.showmob_admin_allowlist` in lowercase, before that person confirms an email link. Do not put the address in this public repository. Example with a placeholder:
   ```sql
   insert into public.showmob_admin_allowlist(email)
   values (lower('ADMIN_EMAIL_FROM_OWNER'))
   on conflict (email) do nothing;
   ```
   The auth-user-created trigger creates a non-admin profile; Auth email confirmation promotes a matching, verified inbox to admin. If that account already exists and is already verified, use a reviewed manual update of its `showmob_profiles` row after confirming that user's UUID; this PR does not run that update. The allowlist is service-side only and cannot be read or edited by the browser. Changing an allowlist row later does not change existing profiles automatically.
3. Enable Auth email signup in the hosted project (the `config.toml` edit is only for local CLI use). Configure the email provider, site URL `https://showmob.vercel.app`, redirect allowlist `https://showmob.vercel.app/account`, and production email sending/rate limits. Configure the equivalent preview URLs only for trusted testing. Check the live dashboard rather than assuming local config propagates.
4. Set Vercel `VITE_SUPABASE_URL` to the public project URL and `VITE_SUPABASE_ANON_KEY` to its **publishable/anon** key for the desired environments. Never use a service-role key. Redeploy and verify `/account` plus an email-link round trip. The auth callback returns to `/account` on the same browser. Re-check the Vercel Production deployment manually: the Git hook has failed to update it before.
5. Check with two disposable accounts that each sees only its own week; confirm cross-user API reads/writes fail, sign-out clears the visible log, and Chris's profile displays Admin. Test an invalid redirect and expired link. Do not call it live until all checks pass.

Until those settings and migration are applied, `/account` honestly says sign-in is not configured and the tracker is unavailable. No admin user or live Supabase setup is created by this PR alone.

## Data and limits

Each signed-in person gets one row per artifact slug, block ID and Monday-start calendar week (browser local timezone). Seven validated days contain moderate minutes and a strength-day flag. The client loads before enabling edits, then saves on explicit click. A failed save leaves the draft in this tab and says it failed. A week rollover starts a new row; previous weeks remain in the database but history UI/export and deletion are not built. Reset clears the on-screen week only until Save. No localStorage fallback is used for signed-out activity, to avoid a misleading second source of truth. Existing device-only activity logs from the earlier preview are not uploaded or erased automatically.

RLS and grants limit reads/writes to `auth.uid() = user_id`; profile admin state is readable only by its owner and not client-editable. This first admin flag is reserved for future permissions, not a way to self-create users or edit other people's logs. Pages and artifact revisions have not become per-user database rows.
