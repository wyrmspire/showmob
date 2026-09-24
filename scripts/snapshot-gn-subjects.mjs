#!/usr/bin/env node
// Regenerate supabase/snapshots/gn-subjects.json from the live grading API.
//
// CI runs check-gn-slugs.mjs against this snapshot so it never needs the
// grader passcode. A human runs this locally, reads the diff, and commits it
// on purpose - the snapshot is only as fresh as its last deliberate commit.
//
// Usage (from repo root):
//   GRADING_PASSCODE=... node scripts/snapshot-gn-subjects.mjs
//   node scripts/snapshot-gn-subjects.mjs --from saved-api-gn.json   # offline, from a saved GET /api/gn
//
// Optional: GN_API_URL (default https://showmob.vercel.app/api/gn), --out <file>.
//
// Only these fields are written: id, title, status, artifact_slug, ab_pair.
// generator and axis_note are dropped on purpose - they are the blind's answer
// key, and the repo should not carry a second copy of it. Grades are never read.

import { readFileSync, writeFileSync } from "node:fs";

export const SNAPSHOT_FIELDS = ["id", "title", "status", "artifact_slug", "ab_pair"];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const out = flag("--out") ?? "supabase/snapshots/gn-subjects.json";
const from = flag("--from");

async function loadSubjects() {
  if (from) {
    const data = JSON.parse(readFileSync(from, "utf8"));
    return Array.isArray(data) ? data : data.subjects;
  }
  const passcode = process.env.GRADING_PASSCODE;
  if (!passcode) {
    console.error("Set GRADING_PASSCODE, or pass --from <saved /api/gn response>.");
    process.exit(2);
  }
  const url = process.env.GN_API_URL ?? "https://showmob.vercel.app/api/gn";
  const res = await fetch(url, { headers: { "x-grading-passcode": passcode } });
  if (!res.ok) {
    console.error(`GET ${url} -> ${res.status}`);
    process.exit(2);
  }
  return (await res.json()).subjects;
}

const subjects = await loadSubjects();
if (!Array.isArray(subjects) || subjects.length === 0) {
  console.error("No subjects in the response; not writing a snapshot.");
  process.exit(2);
}

const slim = subjects
  .map((s) => Object.fromEntries(SNAPSHOT_FIELDS.map((k) => [k, s[k] ?? null])))
  .sort((a, b) => a.id.localeCompare(b.id));

// One subject per line so a regenerated snapshot diffs cleanly in review.
const body = [
  "{",
  `  "note": "Slim copy of showmob_gn_subjects for CI (scripts/check-gn-slugs.mjs --subjects). Regenerate with scripts/snapshot-gn-subjects.mjs. No generator, no axis_note, no grades.",`,
  `  "generated_at": ${JSON.stringify(new Date().toISOString())},`,
  `  "fields": ${JSON.stringify(SNAPSHOT_FIELDS)},`,
  '  "subjects": [',
  slim.map((s) => `    ${JSON.stringify(s)}`).join(",\n"),
  "  ]",
  "}",
  "",
].join("\n");

writeFileSync(out, body);
const counts = {};
for (const s of slim) counts[s.status] = (counts[s.status] ?? 0) + 1;
console.log(`Wrote ${slim.length} subjects to ${out} (${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}).`);
console.log("Review the diff, then commit it.");
