# Supabase: current state

Checked against the live database on 2026-09-28. The site still reads repository JSON for content. The grading-night test center (`/grading`) uses `/api/gn` and the private agent authoring API uses its own server-side connection. Neither gives the browser a database service key. This documents database state, not proof that the latest app code has deployed to Production.

## What exists now

- **Project:** `showmob-dev` (ref `vsasmtsifuylhfrrsrso`) in the `Showmob` organization, region `ca-central-1`, Free plan.
- **Migrations applied:** all seven files in [`supabase/migrations/`](../supabase/migrations/), verified against live objects and `supabase_migrations.schema_migrations`:
  1. `20260923140000_artifact_revisions.sql`
  2. `20260923154500_artifact_lifecycle_ownership.sql`
  3. `20260924135500_grading_night.sql`
  4. `20260924143000_gn_amend_plan_judgment.sql`
  5. `20260926120000_gn_grade_content_hash.sql`
  6. `20260926123000_gn_subject_probe.sql`
  7. `20260927214900_authoring_workspace.sql`
- **Tables (schema `public`):**
  - `showmob_artifacts`: `id`, `slug` (unique), `current_revision`, `status`, `owner_id`, `created_at`, `updated_at`.
  - `showmob_artifact_revisions`: `artifact_id`, `revision`, `document` (full `schemaVersion: 1` artifact as JSONB), `document_sha256`, `parent_revision`, `request_id`, `note`, `created_at`. Append-only: a trigger rejects `UPDATE` / `DELETE` / `TRUNCATE`.
  - `showmob_gn_subjects`: the grading-night subjects (`GN-001`..`GN-100`): `title`, `bucket` (number 1-12), `density`, `interaction`, `shape`, `register`, `lifetime`, `generator`, `axis_note`, `ab_pair`, `status` (`pending` / `assigned` / `built` / `graded`), `artifact_slug`, `probe`, `created_at`. See [`grading-night.md`](grading-night.md).
  - `showmob_gn_grades`: one row per grade: `subject_id`, `artifact_slug`, `scores` (jsonb), `suggestion`, `behavior` (jsonb), `document_sha256`, `supersedes`, `graded_at`. Amendments append a superseding row rather than edit the original; privileged deletion remains possible.
- **Functions:** grading list/record/amend RPCs (service role only); record accepts optional `document_sha256`, and amend appends a superseding row. Artifact revision and private authoring functions also exist. See the migration files for signatures.
  - `showmob_authoring_runs` and `showmob_authoring_steps`: private agent working records; RLS enabled, no browser grants.
- **Access:** RLS is on for the artifact, grading and authoring tables with no browser policies or grants. Server-side roles have narrowly scoped permissions; the browser cannot read these tables.
- **Data at the September 28 check:** 54 artifact revisions, 110 grading subjects, 121 grade rows, and ten non-null probes (GN-101..GN-110). Counts can change.

There is no separate `showmob` schema and no `events` table. If an older note mentions `showmob.artifacts` or `showmob.events`, it is out of date. The repo migrations are the source of truth.

## Migration history is reconciled

The six older migrations were applied by hand. On September 28, their SQL objects were checked against the live database and their versions were recorded as applied in `supabase_migrations.schema_migrations`; the September 27 authoring migration was already tracked. The live history now lists all seven repository versions in order. The six baselined records have no original statements stored because their SQL ran before migration tracking. **Do not run the old files again.** Before any future `db push`, verify the project's link and list the remote migration history against the repo; never assume a local CLI link is configured from this document.

```sql
select version, name from supabase_migrations.schema_migrations order by version;
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

select to_regclass('supabase_migrations.schema_migrations');  -- now present
```

Update this page when the database changes.
