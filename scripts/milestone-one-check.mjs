#!/usr/bin/env node
// Milestone one live check: one artifact, immutable revisions, JSON export/import parity,
// run against the real Supabase Postgres database.
//
//   SHOWMOB_DATABASE_URL='postgresql://...' node --experimental-strip-types scripts/milestone-one-check.mjs [slug]
//
// SHOWMOB_DATABASE_URL is a server-side secret (session pooler URL with the database
// password). Keep it in your shell or password manager. Never commit it.
// Needs psql on PATH. Each run appends revisions to the chosen artifact; it never edits old ones.
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  StaleRevisionError, createRpcStore, exportArtifact, importArtifact, sameArtifact, saveArtifact,
} from '../app/src/persistence/revisions.ts';

const dbUrl = process.env.SHOWMOB_DATABASE_URL;
if (!dbUrl) {
  console.error('Set SHOWMOB_DATABASE_URL to run the live check. Repository reading does not need it.');
  process.exit(2);
}
const slug = process.argv[2] ?? 'showmob-guide';

function psql(sql, vars = {}) {
  const args = [dbUrl, '-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1'];
  for (const [key, value] of Object.entries(vars)) args.push('-v', `${key}=${value}`);
  args.push('-f', '-');
  return new Promise((resolve, reject) => {
    const child = spawn('psql', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    child.stdout.on('data', chunk => { out += chunk; });
    child.stderr.on('data', chunk => { err += chunk; });
    child.on('close', code => (code === 0 ? resolve(out) : reject(new Error(err.trim() || `psql exited ${code}`))));
    child.stdin.end(sql);
  });
}

const casts = { p_document: '::jsonb', p_expected_revision: '::integer', p_revision: '::integer', p_request_id: '::uuid' };
// Transport for createRpcStore: calls the SQL function as service_role, values passed as psql variables.
const rpc = async (fn, params) => {
  const vars = {};
  const call = Object.entries(params).map(([name, value]) => {
    if (value === null || value === undefined) return `${name} => null`;
    vars[name] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `${name} => :'${name}'${casts[name] ?? ''}`;
  }).join(', ');
  const out = await psql(`set role service_role;\nselect to_jsonb(t) from public.${fn}(${call}) t;\n`, vars);
  return out.split('\n').filter(Boolean).map(line => JSON.parse(line));
};

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const rejected = async (sql, pattern) => {
  try { await psql(sql); return 'not rejected'; }
  catch (error) { return pattern.test(error.message) ? true : error.message; }
};

const file = readFileSync(new URL(`../app/src/content/${slug}.json`, import.meta.url), 'utf8');
const artifact = importArtifact(file);
const store = createRpcStore(rpc);

const head = await store.head(slug);
const first = await saveArtifact(store, { slug, document: artifact, expectedRevision: head, requestId: randomUUID(), note: 'milestone-one check: repository file' });
check('save repository artifact as a new revision', first.revision === (head ?? 0) + 1, `${slug} r${first.revision}, sha256 ${first.documentSha256.slice(0, 12)}`);

const stored = await store.read(slug, first.revision);
check('stored document equals the repository file (parsed meaning)', sameArtifact(stored.document, artifact));

const exported = exportArtifact(stored);
const imported = importArtifact(exported);
check('export -> import yields the same artifact', sameArtifact(imported, artifact));
// Postgres JSONB does not keep key order, so parity is judged on parsed meaning, not bytes.
check('export re-validates as a Showmob artifact with the same slug', imported.slug === slug && imported.schemaVersion === 1);

const requestId = randomUUID();
const second = await saveArtifact(store, { slug, document: imported, expectedRevision: first.revision, requestId, note: 'milestone-one check: re-imported export' });
check('re-imported export stores with the identical database hash', second.documentSha256 === first.documentSha256, `r${second.revision}`);

const retry = await saveArtifact(store, { slug, document: imported, expectedRevision: first.revision, requestId });
check('retrying the same request replays instead of duplicating', retry.replayed && retry.revision === second.revision && (await store.head(slug)) === second.revision);

let stale = false;
try { await saveArtifact(store, { slug, document: artifact, expectedRevision: first.revision, requestId: randomUUID() }); }
catch (error) { stale = error instanceof StaleRevisionError; }
check('stale expected revision is rejected, head unchanged', stale && (await store.head(slug)) === second.revision);

const where = `artifact_id = (select id from public.showmob_artifacts where slug = '${slug}') and revision = ${first.revision}`;
for (const role of ['service_role', 'postgres']) {
  const update = await rejected(`set role ${role};\nupdate public.showmob_artifact_revisions set document = '{}'::jsonb where ${where};\n`, /immutable|permission denied/);
  check(`UPDATE of an old revision is rejected as ${role}`, update === true, update === true ? '' : update);
  const del = await rejected(`set role ${role};\ndelete from public.showmob_artifact_revisions where ${where};\n`, /immutable|permission denied/);
  check(`DELETE of an old revision is rejected as ${role}`, del === true, del === true ? '' : del);
}
const anonRead = await rejected(`set role anon;\nselect count(*) from public.showmob_artifact_revisions;\n`, /permission denied/);
check('browser role (anon) cannot read revisions', anonRead === true, anonRead === true ? '' : anonRead);
const anonWrite = await rejected(`set role anon;\nselect public.showmob_save_revision('${slug}', '{}'::jsonb, null, gen_random_uuid());\n`, /permission denied/);
check('browser role (anon) cannot call the save function', anonWrite === true, anonWrite === true ? '' : anonWrite);

const again = await store.read(slug, first.revision);
check(`revision ${first.revision} is unchanged after the attempts`, again.documentSha256 === first.documentSha256 && sameArtifact(again.document, artifact));

const failed = results.filter(ok => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
