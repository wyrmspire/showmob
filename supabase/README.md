# Supabase: milestone one

This folder holds the database side of milestone one: save one artifact with immutable revisions and prove JSON export/import parity. It is a development proof. The live site still reads repository JSON and does not talk to Supabase.

## What exists

- **Project:** `showmob-dev` in the `Showmob` organization (Free plan, $0/month), region `ca-central-1`. Data API on, new tables not auto-exposed, automatic RLS on.
- **Migration:** [`migrations/20260923140000_artifact_revisions.sql`](migrations/20260923140000_artifact_revisions.sql), applied 2026-09-23.
  - `showmob_artifacts`: identity (slug) and a pointer to the current revision.
  - `showmob_artifact_revisions`: the complete `schemaVersion: 1` document as JSONB, its sha256, parent revision, request id and note.
  - A trigger rejects `UPDATE`, `DELETE` and `TRUNCATE` on revisions for every role, including the table owner. Old revisions cannot change.
  - `showmob_save_revision(slug, document, expected_revision, request_id, note)` appends a revision and moves the pointer in one transaction. A stale `expected_revision` fails with SQLSTATE `P0409`. A retried `request_id` returns the first result.
  - `showmob_get_revision(slug, revision)` returns a revision (or the head) and whether its stored hash still matches.
  - `showmob_list_revisions(slug)` returns history without documents.
  - RLS is on with no policies. Nothing is granted to `anon` or `authenticated`. Only `service_role` can run the functions.
- **App side:** [`app/src/persistence/revisions.ts`](../app/src/persistence/revisions.ts): validation before save, export, import, canonical comparison, restore-as-new-revision, an in-memory store with the same rules, and a store over the SQL functions. The renderer does not import it.

## How parity is proved

1. Offline, every commit: `node --experimental-strip-types --test tests/*.test.mjs` runs `tests/persistence.test.mjs` against the in-memory store.
2. Live, on demand:

   ```sh
   SHOWMOB_DATABASE_URL='postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres?sslmode=require' \
     node --experimental-strip-types scripts/milestone-one-check.mjs showmob-guide
   ```

   It saves the repository file as a new revision, reads it back, exports it, imports the export, saves that as the next revision, and checks both revisions have the same database hash. It then checks retry, stale-write rejection, that UPDATE/DELETE fail for `service_role` and `postgres`, that `anon` can't read or write, and that the old revision didn't change. Each run appends two revisions and edits nothing.

"Same artifact" means the same parsed JSON: key order and whitespace don't count. Postgres JSONB sorts object keys, so an export isn't byte-for-byte the repository file, but it has the same content.

## Secrets

The database URL (with password) is a server-side secret. It lives in the owner's password vault and a local shell. Never put it in this repository, in Vercel browser env vars, or in a `VITE_*` variable. No secret or service-role key is used by this milestone.

## Not in this milestone

Hosted reads or writes, auth and ownership policies, a Showmob API, Storage/media, backups/restore drills, and switching any page from repository JSON to the database.
