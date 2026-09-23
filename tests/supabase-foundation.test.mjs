// Offline contract checks for the Supabase foundation layout.
// Does not connect to a database or claim a live round trip.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import test from 'node:test';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const migrationFiles = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
const sql = migrationFiles.map((name) => readFileSync(join(migrationsDir, name), 'utf8')).join('\n');

test('Supabase CLI foundation files exist', () => {
  assert.ok(existsSync(join(root, 'supabase', 'config.toml')));
  assert.ok(existsSync(join(root, 'supabase', 'README.md')));
  assert.ok(existsSync(join(root, '.env.example')));
  assert.ok(migrationFiles.length >= 2, 'expected at least two migrations');
});

test('config.toml disables public signup and seeds by default', () => {
  const config = readFileSync(join(root, 'supabase', 'config.toml'), 'utf8');
  assert.match(config, /project_id\s*=\s*"showmob"/);
  assert.match(config, /enable_signup\s*=\s*false/);
  assert.match(config, /\[auth\.email\][\s\S]*enable_signup\s*=\s*false/);
  assert.match(config, /\[db\.seed\][\s\S]*enabled\s*=\s*false/);
  assert.doesNotMatch(config, /service_role|eyJ|postgres:\/\//i);
});

test('.env.example only documents public placeholders (no secrets)', () => {
  const envExample = readFileSync(join(root, '.env.example'), 'utf8');
  assert.match(envExample, /VITE_SUPABASE_URL=/);
  assert.match(envExample, /VITE_SUPABASE_ANON_KEY=/);
  assert.match(envExample, /YOUR_PROJECT_REF|YOUR_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(envExample, /service_role|eyJ[A-Za-z0-9_-]{20,}/);
  assert.match(envExample, /# SHOWMOB_DATABASE_URL=/);
});

test('migrations define identity, immutable revisions, lifecycle, ownership, and least privilege', () => {
  assert.match(sql, /create table public\.showmob_artifacts/);
  assert.match(sql, /create table public\.showmob_artifact_revisions/);
  assert.match(sql, /showmob_artifact_revisions_immutable/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on public\.showmob_artifacts from public, anon, authenticated/);
  assert.match(sql, /revoke all on public\.showmob_artifact_revisions from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.showmob_save_revision[\s\S]*to service_role/);
  assert.doesNotMatch(sql, /grant (select|insert|update|delete|all) on public\.showmob_artifacts to (anon|authenticated)/i);
  assert.match(sql, /add column if not exists status text/);
  assert.match(sql, /add column if not exists owner_id uuid/);
  assert.match(sql, /status in \('draft', 'preview', 'published', 'archived'\)/);
  assert.match(sql, /errcode = 'P0409'/);
});

test('.gitignore keeps local env and Supabase CLI state out of git', () => {
  const ignore = readFileSync(join(root, '.gitignore'), 'utf8');
  assert.match(ignore, /^\.env$/m);
  assert.match(ignore, /^\.env\*\.local$/m);
  assert.match(ignore, /supabase\/\.temp\//);
  assert.match(ignore, /supabase\/\.branches\//);
});
