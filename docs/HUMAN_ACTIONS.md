# Human actions

This file records infrastructure blockers that an authorized coding agent cannot safely resolve alone. Do not put passwords, tokens, service-role keys, OAuth codes, or other credentials here.

## HA-001 — Restore `showmob-dev`

**Status:** Blocked — owner billing/project-cap decision required  
**Recorded:** 2026-11-20  
**Supabase project:** `showmob-dev` (`vsasmtsifuylhfrrsrso`)  
**Resume phase:** Backend activation Phase 1

### Verified blocker

An authorized `restore_project` request reached Supabase and failed with:

> The following organization members have reached their maximum limits for the number of active free projects within organizations where they are an administrator or owner: wyrmspire (2 project limit).

The connected project inventory shows `mogmine` (`kyolbemnjzubluyuctuq`) active and `showmob-dev` inactive. The limit response refers to two active free projects across organizations where the owner is an administrator or owner, so this repository does not identify another project that is safe to pause.

### Smallest safe owner action

Choose exactly one in the Supabase dashboard:

1. Upgrade the applicable Supabase organization/plan so another project may be active; or
2. Identify a different active project that is safe to pause, then pause that project.

Do **not** pause or delete `mogmine` merely to clear this ticket unless the owner separately decides that its active database can be unavailable. Do not create a replacement ShowMob project.

After capacity is available, restore the existing project from:

https://supabase.com/dashboard/project/vsasmtsifuylhfrrsrso

### Agent verification after the owner action

1. Query project status until `vsasmtsifuylhfrrsrso` is `ACTIVE_HEALTHY`.
2. List remote migration history.
3. Run read-only catalog queries for `showmob_%` tables, functions, constraints, triggers, grants, and RLS policies.
4. Compare live history and objects with every repository migration, including `20260928131000_account_activity.sql`.
5. Preserve historical rows; do not run `supabase db reset` or an unreviewed bulk push.
6. Continue Vercel credential smoke tests and authoring API activation only after database health and schema are verified.

### Evidence already collected

- GitHub `main`: `2c8add9aadafae0c104c1520082ae4d742077b66`
- Open PRs #131, #132, and #133 were left untouched.
- Vercel project `maddyup/showmob` exists and its latest production deployment was `READY`.
- Required Vercel variable names exist. Public URL is `https://vsasmtsifuylhfrrsrso.supabase.co`; protected values were not decrypted or exposed.
- Production homepage returned HTTP 200.
- The authoring route could not be conclusively smoke-tested through the Vercel authenticated-fetch helper; re-test with a normal HTTP client after Supabase is healthy.
