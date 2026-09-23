# Supabase: current state

Checked against the live database on 2026-09-23. The site still reads repository JSON. Nothing in the renderer talks to Supabase.

## What exists now

- **Project:** `showmob-dev` (ref `vsasmtsifuylhfrrsrso`) in the `Showmob` organization, region `ca-central-1`, Free plan.
- **Migrations applied:** both files in [`supabase/migrations/`](../supabase/migrations/):
  1. `20260923140000_artifact_revisions.sql`
  2. `20260923154500_artifact_lifecycle_ownership.sql`
- **Tables (schema `public`):**
  - `showmob_artifacts`: `id`, `slug` (unique), `current_revision`, `status`, `owner_id`, `created_at`, `updated_at`.
  - `showmob_artifact_revisions`: `artifact_id`, `revision`, `document` (full `schemaVersion: 1` artifact as JSONB), `document_sha256`, `parent_revision`, `request_id`, `note`, `created_at`. Append-only: a trigger rejects `UPDATE` / `DELETE` / `TRUNCATE`.
- **Functions:** `showmob_save_revision`, `showmob_get_revision`, `showmob_list_revisions` (service role only), plus the `showmob_reject_revision_change` trigger function.
- **Access:** RLS is on for both tables with zero policies, and `anon` / `authenticated` have no grants. Only the service role can read or write. Browser access is denied on purpose.
- **Data:** one artifact (`showmob-guide`) with 4 revisions (test data from the milestone-one check).

There is no separate `showmob` schema and no `events` table. If an older note mentions `showmob.artifacts` or `showmob.events`, it is out of date. The repo migrations are the source of truth.

## Caveat: migration history is not tracked

The migrations were applied by hand (SQL run directly against the database), not with `supabase db push`. The `supabase_migrations.schema_migrations` table does not exist on the remote. So the Supabase CLI thinks nothing has been applied, and a first `db push` would try to run both files again. The first migration uses plain `create table` and would fail on existing tables.

Before the first `db push`, mark both as applied:

```sh
supabase link --project-ref vsasmtsifuylhfrrsrso
supabase migration repair --status applied 20260923140000 20260923154500
supabase migration list   # both should show on local and remote
```

## How an agent uses it

1. Read [`supabase/README.md`](../supabase/README.md) for the schema, tests, and the optional live check.
2. Sign in to the Supabase dashboard with GitHub (Chris's account), open org `Showmob`, project `showmob-dev`.
3. Use the dashboard SQL editor for reads and one-off SQL. That's the easy path.
4. For CLI or `psql` work you need the database password. Ask the owner for it. It never goes in the repo, in `.env.example`, or in any `VITE_*` variable.

## How to check current state

- Dashboard → Table Editor → schema `public`: `showmob_artifacts` and `showmob_artifact_revisions` should be listed.
- Or in the SQL editor:

```sql
select table_schema, table_name
from information_schema.tables
where table_name like 'showmob%';

select to_regclass('supabase_migrations.schema_migrations');  -- null until baselined
```

Update this page when the database changes.
