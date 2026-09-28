import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const migration = readFileSync("supabase/migrations/20260926123000_gn_subject_probe.sql", "utf8");
const api = readFileSync("api/gn.ts", "utf8");
const grading = readFileSync("app/src/Grading.tsx", "utf8");

test("migration adds a probe column and backfills the 2026-09-26 review set", () => {
  assert.match(migration, /alter table public\.showmob_gn_subjects\s+add column probe text/);
  for (const id of ["GN-101", "GN-102", "GN-103", "GN-104", "GN-105", "GN-106", "GN-107", "GN-108", "GN-109", "GN-110"]) {
    assert.match(migration, new RegExp(`set probe = '[^']+' where id = '${id}'`), `missing backfill for ${id}`);
  }
});

test("list RPC passes the probe through with the subject", () => {
  const i = api.indexOf("artifact_slug: row.artifact_slug");
  assert.notEqual(i, -1);
  assert.match(api.slice(i, i + 400), /probe: row\.probe/);
});

test("the probe renders only after a grade is filed, never before", () => {
  const gate = grading.indexOf("{(justSaved || gradedIds.has(open.id)) && (");
  assert.notEqual(gate, -1);
  const gatedBlock = grading.slice(gate, gate + 900);
  assert.match(gatedBlock, /open\.probe && \(/);
  assert.match(gatedBlock, /Why this page exists/);
  assert.equal(grading.slice(0, gate).includes("open.probe"), false, "probe must not render outside the post-grade gate");
});
