import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const migration = read('../supabase/migrations/20260926120000_gn_grade_content_hash.sql');
const api = read('../api/gn.ts');
const grading = read('../app/src/Grading.tsx');
const doc = read('../docs/grading-connection.md');

// 2026-09-26 outside review, item 1: grades must pin what was graded, and
// amendments must keep history instead of rewriting scores in place.

test('grades gain a content hash and a supersedes link', () => {
  assert.match(migration, /add column document_sha256 text/);
  assert.match(migration, /check \(document_sha256 is null or document_sha256 ~ '\^\[0-9a-f\]\{64\}\$'\)/);
  assert.match(migration, /add column supersedes uuid references public\.showmob_gn_grades\(id\)/);
});

test('record_grade accepts and stores the document hash', () => {
  assert.match(migration, /drop function public\.showmob_gn_record_grade\(text, text, jsonb, text, jsonb\)/);
  assert.match(migration, /p_document_sha256 text default null/);
  assert.match(migration, /document_sha256 must be 64 lowercase hex characters/);
});

test('amend appends a superseding row and never updates grades in place', () => {
  assert.match(migration, /drop function public\.showmob_gn_amend_grade_scores\(uuid, jsonb\)/);
  assert.doesNotMatch(migration, /update public\.showmob_gn_grades/i);
  assert.match(migration, /original\.scores \|\| p_scores_patch/);
  assert.match(migration, /original\.document_sha256, p_grade_id\)/);
});

test('API validates the hash, passes it through, and returns it on list', () => {
  assert.match(api, /DOCUMENT_HASH = \/\^\[0-9a-f\]\{64\}\$\//);
  assert.match(api, /document_sha256 must be 64 lowercase hex chars/);
  assert.match(api, /p_document_sha256: documentSha256/);
  assert.match(api, /document_sha256: g\.document_sha256/);
  assert.match(api, /supersedes: g\.supersedes/);
});

test('grading UI hashes the exact rendered artifact and posts it', () => {
  assert.match(grading, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(grading, /document_sha256: await artifactSha256\(openArtifact\)/);
});

test('grade record format documents the content pin and append-only amend', () => {
  assert.match(doc, /contentSha256/);
  assert.match(doc, /document_sha256/);
  assert.match(doc, /nothing is rewritten in place/);
});
