# Design notes: `/grading` test center (root)

URL: https://showmob.vercel.app/grading  
Code: `app/src/Grading.tsx`, `api/gn.ts`, subjects/grades in Supabase (`showmob_gn_*`).  
Content pages: repo JSON under `app/src/content/gn-*.json` (not in the database).  
Reviewed 2026-09-24 (code + live root; live list requires grader passcode).

## Split of control

| Layer | Source | What it drives |
| --- | --- | --- |
| Subject index | Supabase `showmob_gn_subjects` via `GET /api/gn` | id, title, bucket, matrix axes, generator, axis_note, ab_pair, status, artifact_slug |
| Grade history | Supabase `showmob_gn_grades` via same API | prior scores shown as “graded ×N” / “Previous grades” |
| Page body | Repo JSON (`allEntries` / `BlockView`) | hero, stats, checklists, etc. — resolved by `artifact_slug` or `gn-` + kebab(title) |
| Shell chrome | Hardcoded in `Grading.tsx` | toolbar, bucket headings, passcode gate, grade panel fields, compare UI |
| Passcode | Env `SHOWMOB_GRADING_PASSCODE` (Vercel); browser sends `x-grading-passcode` | Unlock; stored in `localStorage` key `showmob-grading-passcode` |

**Content does not live in the DB.** The DB is machinery; the pages Chris grades are still JSON files. That matches `docs/grading-night.md`.

## What the root renders (unlocked)

Hardcoded:

- Theme forced to `theme-paper` on the center shell (not from a subject)
- “← Ideas”, “Everything →”, title “Grading night”, “N of M graded”
- Intro copy (“Test center…”)
- Bucket labels map `BUCKETS` (1–12) — duplicate of selection framework, not loaded from DB
- Row chips: pair N, graded ×N, built / not built
- Passcode form labels (“Grader passcode”, “Unlock”, remember hint)

DB-driven on the list:

- Subject id + title
- Which bucket section a row appears in (`subject.bucket`)
- Whether a pair chip shows (`ab_pair`)
- Grade counts
- Built vs not built (derived: JSON present for slug)

Intentionally **not** shown on the list (blind grading):

- `generator`, `axis_note`, density / interaction / shape / register / lifetime

## Opened subject (for context; not required for root-only review)

Hardcoded grade panel: rating, more/less, density, content/representation/interaction, scan, would-send, widget notes, missing/unneeded, suggestion, A/B choice. Behavior capture (time, scroll, widgets) is code, posted with the grade.

JSON-driven: artifact blocks only (no ArtifactView toolbar — grading uses a thinner `renderBlocks` shell). Theme class comes from the artifact JSON when a page is open / compared.

## Inconsistencies / gaps

1. **Two catalogs:** subjects table can drift from repo JSON (slug kebab mismatches, A/B `-a`/`-b` suffixes, pending rows). List shows “not built” but there is no admin surface in-app to fix `artifact_slug`.
2. **Axes invisible while grading:** matrix fields exist in DB for training but never appear beside the page. Good for blind taste; weak if Chris needs the target density on-screen without a separate sheet.
3. **Bucket labels duplicated:** `BUCKETS` const vs whatever was seeded — rename in one place only and the UI lies.
4. **Center theme vs page theme:** root is always paper; opened pages switch to the artifact theme. Fine, but the list never previews theme.
5. **Generator hidden even after grade:** provenance for later analysis is only in DB/API, not in the UI after submit.
6. **Direct `/a/gn-…` bypasses the center:** preview URLs work without passcode; `/grading` does not. Same JSON, different chrome and no grade panel on `/a/`.
7. **No JSON control of the grade panel:** panel schema is React-only. Changing what Chris grades means code change, not content JSON (correct for machinery).

## More design control needed?

For the **root index**, optional later (only if grades complain):

- Show built/total per bucket from data
- Deep-link `/grading#GN-053` (today openId is React state only — refresh loses place)
- “Not built” filter

Do **not** move page bodies into Supabase. Do **not** put grade-panel copy into artifact JSON.

If anything, add a tiny **subject ↔ slug** health check in CI (every `built`/`assigned` row resolves to a file) rather than more UI chrome.

## Verdict

`/grading` is a hardcoded test harness around DB subjects + repo JSON pages. That split is intentional and sound. Main risks are slug coupling and invisible matrix targets — operational, not a reason to hardcode more page sections.

## Live root check (2026-09-24)

Opened https://showmob.vercel.app/grading on the box browser.

- **Passcode UI:** did not appear (subjects loaded; header showed “0 of 100 graded”). Either this browser already had a remembered passcode in `localStorage`, or the gate was satisfied another way — code still fails closed without `SHOWMOB_GRADING_PASSCODE` on the API.
- **Chrome matched code:** ← Ideas, Everything →, “Grading night”, Test center intro, hardcoded bucket titles 1–12.
- **DB-driven list:** GN-001…GN-100 rows; built vs not-built; pair chips 1–6; no generator or matrix axes visible (blind as designed).
- **Counts from live UI:** 71 built / 29 not built across 100 subjects (repo may have more `gn-*.json` files than resolve via `artifact_slug` / kebab(title) — slug coupling risk confirmed).
- Screenshot: box assets `6f47c0f1371ac337e16aa8f73ff94cc840158a9ef15b64b111d7142e5ef4ee42.png`.

No change to the verdict above. Notes file left at repo root only (not committed unless asked).
