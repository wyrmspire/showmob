# Grading-night page plans

One plan per grading-night page: what the page was going for, why its main
blocks were chosen, and what was deliberately left out. Plans are grading
data, not site content - nothing in this directory is imported by the app,
and the pages in `app/src/content/gn-*.json` are never modified to add or
reference plans.

## Files

- `gn-plans.json` - the plans, one entry per subject.

## Entry schema

Each entry in the top-level `plans` array:

| Field | Meaning |
| --- | --- |
| `id` | Subject id from the subjects table, e.g. `GN-003`. |
| `slug` | The page's artifact slug, matching its file in `app/src/content/`. |
| `contributor` | Who wrote this plan (not who built the page). |
| `provenance` | `first-hand` - the plan author built the page. `inferred` - the plan author read the page cold and reconstructed the plan from the outside. |
| `goal` | The intended read: density, pace (skim vs study), one-time vs reference, and who it is for. |
| `why_widgets` | Why the page's main blocks/widgets were chosen for this subject. |
| `rejected` | What was considered and rejected or deliberately left out. |

## Rules

- One plan per subject, keyed by `id` + `slug`. Keep entries sorted by `id`.
- Never name or guess a page's generator anywhere in these files. Grading is
  blind; the only attribution allowed is the plan's own `contributor` and
  `provenance`.
- 3-5 short lines across the three text fields. Specific to the page - no
  boilerplate that could apply to any page.
- Plans for pages you built yourself are `first-hand`; plans for any other
  page are `inferred`. Write inferred plans from the page's JSON alone.
