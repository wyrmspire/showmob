# Supabase foundation (development only)

This folder is the **database side of the persistence foundation**. It is not a production cutover.

- The live Vite site still reads repository JSON under `app/src/content/`.
- The renderer does not import the persistence adapter.
- Connecting a cloud or local Supabase project is optional and separate from shipping content.
- Artifact `preview` / `draft` / `published` / `archived` lifecycle is a catalog/content rule. It is independent of whether Supabase is running.

## Layout

| Path | Purpose |
| --- | --- |
| [`config.toml`](config.toml) | Supabase CLI local defaults. Public signup disabled. No secrets. |
| [`migrations/`](migrations/) | Ordered SQL. Identity + immutable revisions, then lifecycle/ownership columns. |
| [`../app/src/persistence/revisions.ts`](../app/src/persistence/revisions.ts) | Typed save/read/export/import boundary. Unused by production rendering. |
| [`../.env.example`](../.env.example) | Placeholder public URL + anon key only. Copy to gitignored `.env` if needed. |

## Migrations

1. [`migrations/20260923140000_artifact_revisions.sql`](migrations/20260923140000_artifact_revisions.sql)
   - `showmob_artifacts`: identity (slug) and pointer to the current revision.
   - `showmob_artifact_revisions`: complete `schemaVersion: 1` document as JSONB, sha256, parent revision, request id, note.
   - Trigger rejects `UPDATE` / `DELETE` / `TRUNCATE` on revisions (including for privileged roles).
   - `showmob_save_revision` / `showmob_get_revision` / `showmob_list_revisions`: service_role only.
   - RLS enabled with **no** policies. `anon` and `authenticated` have no grants.
2. [`migrations/20260923154500_artifact_lifecycle_ownership.sql`](migrations/20260923154500_artifact_lifecycle_ownership.sql)
   - Denormalized `status` (`draft` \| `preview` \| `published` \| `archived`) synced from the document on save.
   - Nullable `owner_id` ownership boundary placeholder for future Auth (Phase 4). No Auth policies yet.
3. [`migrations/20260924135500_grading_night.sql`](migrations/20260924135500_grading_night.sql)
   - `showmob_gn_subjects` (the ~100 grading-night subjects) and `showmob_gn_grades` (one row per grade). See [`../docs/grading-night.md`](../docs/grading-night.md).
   - `showmob_gn_list_subjects` / `showmob_gn_record_grade` / `showmob_gn_list_grades`: service_role only. RLS on, no policies.

## How to configure a future development project

1. Create or start an isolated **development** project (local via `supabase start`, or a separate cloud project). Do not point production at it.
2. Copy [`.env.example`](../.env.example) to `.env` and fill only the public URL and anon key if a browser client is later needed. Never put a service-role key or database password in `VITE_*` variables.
3. Apply migrations with the Supabase CLI (`supabase db reset` locally, or `supabase db push` to a linked **dev** project after review).
4. Keep `SHOWMOB_DATABASE_URL` (if used) in your shell or password manager for the optional live script only.

Offline proof (no database required):

```sh
# Node.js 22.18+ or Node.js 24 (strip-types). Node 20 cannot run this flag.
node --experimental-strip-types --test tests/*.test.mjs
```

Optional live check (needs a real database URL and `psql`; not run by CI or this foundation branch by default):

```sh
SHOWMOB_DATABASE_URL='postgresql://…' \
  node --experimental-strip-types scripts/milestone-one-check.mjs showmob-guide
```

## Grading subjects snapshot (CI)

[`snapshots/gn-subjects.json`](snapshots/gn-subjects.json) is a slim, checked-in copy of `showmob_gn_subjects` so CI can run `scripts/check-gn-slugs.mjs` without the grader passcode. It holds only `id`, `title`, `status`, `artifact_slug`, `ab_pair`. No `generator`, no `axis_note` (that would be a second answer key for the blind), no grades. `tests/gn-subjects-snapshot.test.mjs` fails if any other field shows up.

Refresh it after the subjects table changes (a human runs this locally with the passcode, reads the diff, and commits it):

```sh
GRADING_PASSCODE=... node scripts/snapshot-gn-subjects.mjs
git diff supabase/snapshots/gn-subjects.json
```

CI job `gn-slugs` fails when a built/assigned/graded subject resolves to no page or two subjects share one page. Pending subjects, pending-only shares and orphan `gn-*` pages are warnings. The snapshot is only as fresh as its last commit, so a stale snapshot shows up as warnings or failures after the table moves; refresh it rather than editing it by hand.

## Agent dump (printcode)

From the repo root, dump only this foundation slice for another agent:

```sh
./printcode-supa.sh
# or: ./printcode.sh --area supabase --output-prefix dump-supa
```

That writes `dump-supa00.md` … covering `supabase/`, `app/src/persistence/`, the milestone check script, foundation tests, `.env.example`, and `ROADMAP.md`. It does **not** include `.env`, service-role keys, or the database password.

## Secrets

- Commit placeholders only (`.env.example`).
- Never commit `.env`, service-role keys, database passwords, or JWT secrets.
- CLI state under `supabase/.temp/` and `supabase/.branches/` is gitignored.

## Not in this foundation

Hosted production reads/writes, public signup, Auth membership policies, a Showmob API, Storage/media, backups/restore drills, switching any page from repository JSON to the database, or hardcoded users/passwords.
