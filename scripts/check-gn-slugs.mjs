#!/usr/bin/env node
// Grading night: does every subject in showmob_gn_subjects resolve to a page in the repo?
//
// Mirrors artifactForSubject() in app/src/Grading.tsx exactly:
//   1. subject.artifact_slug, if set and a page has that slug
//   2. otherwise "gn-" + kebab(subject.title)
//
// Usage (from repo root):
//   GRADING_PASSCODE=... node scripts/check-gn-slugs.mjs          # live, against the DB via /api/gn
//   node scripts/check-gn-slugs.mjs --subjects supabase/snapshots/gn-subjects.json   # offline; what CI runs
//
// Optional: GN_API_URL (default https://showmob.vercel.app/api/gn), --content <dir>.
// CI runs the offline form against the checked-in slim snapshot, so CI never holds the
// grader passcode. Refresh the snapshot with scripts/snapshot-gn-subjects.mjs whenever the
// subjects table changes. tests/gn-handoff-slugs.test.mjs separately covers handoff<->disk.
//
// Fails (exit 1) when a built/assigned/graded subject resolves to no page, or when two
// subjects share one page and at least one of them is built/assigned/graded.
// Only warns for pending subjects (unbuilt is a legitimate state), pending-only shares,
// and orphan gn-* pages. Under GitHub Actions, problems also print as ::error/::warning.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const contentDir = flag("--content") ?? "app/src/content";
const subjectsFile = flag("--subjects");

// --- same resolver as Grading.tsx ---
const kebab = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// --- pages in the repo ---
const pages = new Map(); // slug -> file
for (const file of readdirSync(contentDir)) {
  if (!file.endsWith(".json")) continue;
  try {
    const json = JSON.parse(readFileSync(join(contentDir, file), "utf8"));
    if (typeof json.slug === "string") pages.set(json.slug, file);
  } catch {
    console.warn(`! could not parse ${file}`);
  }
}
const gnSlugs = [...pages.keys()].filter((s) => s.startsWith("gn-"));

// --- subjects from the API (or a saved response) ---
async function loadSubjects() {
  if (subjectsFile) {
    const data = JSON.parse(readFileSync(subjectsFile, "utf8"));
    return Array.isArray(data) ? data : data.subjects;
  }
  const passcode = process.env.GRADING_PASSCODE;
  if (!passcode) {
    console.error("Set GRADING_PASSCODE, or pass --subjects <saved /api/gn response>.");
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

// Near-miss finder for subjects that don't resolve: A/B suffixes and truncated long titles.
function nearMisses(subject) {
  const want = `gn-${kebab(subject.title)}`;
  return gnSlugs.filter((slug) => {
    const base = slug.replace(/-(a|b)$/, "");
    return base === want || want.startsWith(base) || base.startsWith(want);
  });
}

const subjects = await loadSubjects();
const expectBuilt = new Set(["assigned", "built", "graded"]);

const resolved = new Map(); // slug -> [subject ids]
const broken = [];
const pendingUnbuilt = [];
const fixes = [];

for (const s of subjects) {
  let slug = null;
  let via = null;
  if (s.artifact_slug && pages.has(s.artifact_slug)) {
    slug = s.artifact_slug;
    via = "artifact_slug";
  } else if (pages.has(`gn-${kebab(s.title)}`)) {
    slug = `gn-${kebab(s.title)}`;
    via = "title";
  }

  if (slug) {
    if (!resolved.has(slug)) resolved.set(slug, []);
    resolved.get(slug).push({ id: s.id, via, pair: s.ab_pair, status: s.status });
    continue;
  }

  const candidates = nearMisses(s);
  const row = { s, candidates, badSlug: s.artifact_slug && !pages.has(s.artifact_slug) };
  (expectBuilt.has(s.status) ? broken : pendingUnbuilt).push(row);
  if (candidates.length === 1) {
    fixes.push(`update public.showmob_gn_subjects set artifact_slug = '${candidates[0]}' where id = '${s.id}';`);
  }
}

const sharedAll = [...resolved].filter(([, who]) => who.length > 1);
const shared = sharedAll.filter(([, who]) => who.some((w) => expectBuilt.has(w.status)));
const sharedPending = sharedAll.filter(([, who]) => !who.some((w) => expectBuilt.has(w.status)));

// GitHub Actions annotations, so CI failures and warnings show on the PR.
const gha = process.env.GITHUB_ACTIONS === "true";
const annotate = (level, msg) => {
  if (gha) console.log(`::${level} title=check-gn-slugs::${msg}`);
};
const claimed = new Set(resolved.keys());
const orphans = gnSlugs.filter((slug) => !claimed.has(slug));

// --- report ---
const line = (s) => `${s.id} [${s.status}${s.ab_pair ? `, pair ${s.ab_pair}` : ""}] ${s.title}`;
const who2str = (who) => who.map((w) => `${w.id} via ${w.via}`).join(", ");
console.log(`${subjects.length} subjects, ${gnSlugs.length} gn-* pages, ${claimed.size} pages claimed\n`);

if (broken.length) {
  console.log(`BROKEN: subject says it has a page, but nothing resolves (${broken.length})`);
  for (const { s, candidates, badSlug } of broken) {
    console.log(`  ${line(s)}`);
    if (badSlug) console.log(`    artifact_slug '${s.artifact_slug}' has no file`);
    for (const c of candidates) console.log(`    looks like: ${c}`);
    annotate("error", `${s.id} [${s.status}] resolves to no page${badSlug ? ` (artifact_slug '${s.artifact_slug}' has no file)` : ""}`);
  }
  console.log();
}

if (shared.length) {
  console.log(`SHARED: two subjects resolve to the same page (${shared.length})`);
  console.log("  For an A/B pair this means the blind compare shows one page against itself.");
  for (const [slug, who] of shared) {
    console.log(`  ${slug} <- ${who2str(who)}`);
    annotate("error", `shared page ${slug} <- ${who2str(who)}`);
  }
  console.log();
}

if (sharedPending.length) {
  console.log(`SHARED, pending only (warning): ${sharedPending.length}`);
  for (const [slug, who] of sharedPending) {
    console.log(`  ${slug} <- ${who2str(who)}`);
    annotate("warning", `pending subjects share page ${slug} <- ${who2str(who)}`);
  }
  console.log();
}

if (pendingUnbuilt.length) {
  const withFile = pendingUnbuilt.filter((r) => r.candidates.length);
  console.log(`PENDING (warning): ${pendingUnbuilt.length} not marked built; ${withFile.length} of them look like they have a page`);
  for (const { s, candidates } of withFile) {
    console.log(`  ${line(s)}`);
    for (const c of candidates) console.log(`    looks like: ${c}`);
    annotate("warning", `${s.id} is pending but looks like it has a page (${candidates.join(", ")}); update the subjects table, then refresh the snapshot`);
  }
  console.log();
}

if (orphans.length) {
  console.log(`ORPHANS (warning): gn-* pages no subject resolves to (${orphans.length})`);
  for (const slug of orphans) console.log(`  ${slug}`);
  annotate("warning", `${orphans.length} gn-* page(s) no subject resolves to: ${orphans.join(", ")}`);
  console.log();
}

if (fixes.length) {
  console.log("Suggested fixes (one clear match each; check before running):");
  for (const f of fixes) console.log(`  ${f}`);
  console.log();
}

const bad = broken.length + shared.length;
console.log(bad ? `FAIL: ${bad} problem(s)` : "OK: every built subject resolves to its own page");
process.exit(bad ? 1 : 0);
