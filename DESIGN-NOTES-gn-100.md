# Design notes: GN-100 (houseplant dashboard)

Page Chris grades: https://showmob.vercel.app/a/gn-a-dashboard-for-a-single-houseplant  
Artifact JSON: `app/src/content/gn-a-dashboard-for-a-single-houseplant.json`  
Subject: GN-100 — Beautiful failures — failure bait (dashboard for nothing).  
Contributor: Instinct. Status: `preview`. Theme: `field`.

Reviewed 2026-09-24 against live URL pattern, JSON, `ArtifactView`, `BlockView`, and grading-night plumbing (`docs/grading-night.md`, `/grading` + `/api/gn`).

## What JSON controls

Full page body is the `blocks` array, rendered in order by `ArtifactView` → `BlockView`:

| Block id | Type | On page |
| --- | --- | --- |
| `start` | hero | Title + body (no eyebrow in JSON) |
| `vitals` | stat-strip | Three value/label pairs |
| `actions` | checklist | Two checkable items + detail |
| `honesty` | note-callout | Title, body, tone `positive` |

Also from JSON into chrome/meta (not body copy): `title` (toolbar), `theme` (CSS class `theme-field`), `summary` (share/OG meta only), `status` (robots / catalog visibility). `slug` drives the URL.

## What is hardcoded (not in this JSON)

Site chrome in `ArtifactView.tsx`:

- “← Ideas” home control
- Computed “N min read” (from block text size heuristic — not a JSON field)
- Sections menu + per-block “Copy link”
- Focus / zen mode
- Skip link
- Theme swatches only when `authorToolsEnabled` (dev unpublished mode)

Block chrome in `BlockView.tsx`:

- Checklist always appends: “This checklist resets when the page closes.”
- Checklist check state is React session state (not JSON, not persisted)
- Quote wrapping, exercise UI, slideshow chrome (unused here)
- Hero always mounts an eyebrow element; empty when JSON omits `eyebrow`

Grading center (`/grading`) is a separate shell: subject list + matrix fields come from Supabase (`showmob_gn_subjects` via `/api/gn`); the page body still mounts the same repo JSON artifact. Passcode gate is hardcoded UI; generator / axis_note stay hidden on purpose.

## Inconsistencies / gaps

1. **Reader-visible vs JSON:** `contributor`, `tags`, and `updated` never appear on the artifact page. Fine for blind grading inside `/grading`; on the direct `/a/…` URL the grader also cannot see who wrote it without opening the file.
2. **Summary unused in layout:** `summary` is share-meta only — not a lead under the hero. Redundant with hero body for this short page.
3. **Empty hero eyebrow node:** missing optional field still leaves an empty `.eyebrow` div in the DOM.
4. **Checklist session note:** hardcoded copy can fight a “living” lifetime axis on other pages; here it accidentally reinforces ephemeral/session behavior for a whimsical “dashboard.”
5. **DB ↔ JSON coupling:** subjects resolve by `artifact_slug` or `gn-` + kebab(title). A/B rows need the `-a`/`-b` slug in the DB or matching fails. GN-100 has no pair; slug match is clean.
6. **Density / matrix not on page:** density, interaction, shape, register, lifetime live only in the subjects table (and handoff). The graded URL does not surface the target axes — intentional for blind taste, but graders must remember the matrix from the sheet.

## Should more sections be added via JSON?

**No for GN-100.** The page’s thesis is restraint: four blocks already say a sticky note would have been enough. Extra JSON sections (charts, KPI strips, history) would defeat the failure-bait and muddy the grade.

If grading night needs richer *design control* in general (not this page), prefer schema/chrome knobs over stuffing more blocks into micro pages:

- Optional hide of min-read / copy-link / checklist session note
- Optional `eyebrow` omission (don’t render empty)
- Optional surface of `summary` as deck
- Layout hints only when grades repeatedly ask for them (widgets-last rule in `docs/grading-night.md`)

## Verdict for grading decision

JSON owns the content; React owns the frame. For this hundredth page, content and frame are aligned with the bait. Do not expand the JSON. Any follow-up should be chrome/schema affordances driven by grades across many pages, not a thicker houseplant dashboard.

## Live render check (2026-09-24)

Confirmed at https://showmob.vercel.app/a/gn-a-dashboard-for-a-single-houseplant (also listed as preview on `/everything`). No login gate on the direct artifact URL.

Rendered content matched the JSON blocks exactly (hero, three stats, two checklist items, positive callout). Hardcoded chrome matched code review: ← Ideas, 1 min read, Sections, Focus, Copy link, and the checklist session note. Field theme (cream / charcoal / sage) applied from JSON `theme: "field"`.
