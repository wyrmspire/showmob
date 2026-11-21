# Human actions

This file records infrastructure blockers that an authorized coding agent cannot safely resolve alone. Do not put passwords, tokens, service-role keys, OAuth codes, or other credentials here.

## HA-001 — Restore `showmob-dev`

**Status:** Completed — project restored and verified  
**Recorded:** 2026-11-20  
**Supabase project:** `showmob-dev` (`vsasmtsifuylhfrrsrso`)  
**Completed phase:** Backend activation Phase 1

### Original blocker

An authorized `restore_project` request reached Supabase and failed with:

> The following organization members have reached their maximum limits for the number of active free projects within organizations where they are an administrator or owner: wyrmspire (2 project limit).

The connected project inventory shows `mogmine` (`kyolbemnjzubluyuctuq`) active and `showmob-dev` inactive. The limit response refers to two active free projects across organizations where the owner is an administrator or owner, so this repository does not identify another project that is safe to pause.

### Resolution

With the owner's approval, the unused `mogmine` project was paused without deletion. The existing `showmob-dev` project was then restored and reached `ACTIVE_HEALTHY`. No replacement project was created.

### Verification completed

- Project status reached `ACTIVE_HEALTHY`.
- Historical counts were preserved: 54 artifact revisions, 110 grading subjects, and 121 grade rows.
- All `showmob_%` tables have RLS enabled. Authoring RPCs remain service-role-only.
- The seven previously recorded migrations match the repository.
- The account/activity tables, policies, grants, functions, and triggers matched `20260928131000_account_activity.sql`; its missing migration-history row was reconciled without rerunning the SQL.
- Production `/api/authoring/discover` returns 401 for missing and invalid bearer tokens, confirming the route is active and fails closed.
- Disposable run `e4000eb5-07d6-4496-a7f7-65341987ddad` proved saved steps, recovery, workspace isolation, stale-revision rejection, and idempotent retry.

### Evidence already collected

- GitHub `main`: `2c8add9aadafae0c104c1520082ae4d742077b66`
- Open PRs #131, #132, and #133 were left untouched.
- Vercel project `maddyup/showmob` exists and its latest production deployment was `READY`.
- Required Vercel variable names exist. Public URL is `https://vsasmtsifuylhfrrsrso.supabase.co`; protected values were not decrypted or exposed.
- Production homepage returned HTTP 200.
- The production authoring route was tested from a temporary Vercel sandbox: missing and wrong bearer credentials both returned JSON 401 responses.
- The configured valid token remains secret and was not exposed or rotated; authenticated HTTP discovery still requires a client that already possesses that credential.
