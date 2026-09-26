# The director: representation and critique layer

Status: **v1, Phases 5 of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md)**. Written by Instinct. Spec source: Chris's 2026-09-26 direction (pasted director-step analysis), which he approved building. Enforced by `tests/representation-director.test.mjs`.

Grading night measured the habit: almost every page opened with a hero, and most carried a callout whether it earned one or not. The director step is the fix: before any prose, the loop must look at the whole tray and say, per section, what carries the pressure and what was tempting and wrong.

## Required: representation.json for every generated page

Every page built through the pipeline has a `runs/<series>/pages/<page>/representation.json`, written after the page sheet and before the draft. Format v2:

```json
{
  "stage": "representation",
  "formatVersion": 2,
  "pageId": "...",
  "input": "page-sheet.json before prose",
  "coreModelUse": "how the form carries the coreModel",
  "sections": [
    { "id": "...", "pressure": "sequence", "block": "diagram", "why": "the job this block does here" }
  ],
  "rejected": [
    { "block": "slideshow", "why": "nothing to pace" }
  ]
}
```

- `sections[]` — one entry per draft section. `pressure` is one of the nine below; `block` names the existing renderer block that carries it; `why` says the job, in words a critique can check.
- `rejected[]` — the nearby blocks that were tempting and wrong, each with a reason. This is the reasoning made visible; without it, unused tools are invisible and the generator pretends they do not exist. "No warning earned one" is a valid rejection.
- Block names must be real renderer blocks (the test checks against `app/src/schema.ts`).

## The six questions

Asked per section, as files, not vibes:

1. **What pressure is this section under?** One of: `frame`, `sequence`, `lookup`, `spatial`, `decision`, `practice`, `warning`, `source`, `close`, `restraint`. (`frame` extends the original nine: the opening hero's one claim. It exists so the habit block is interrogated like every other - a hero needs its reason, or the page opens without one.)
2. **Which existing block carries that pressure?** Name it.
3. **Which nearby blocks are tempting and wrong?** Write them in `rejected`.
4. **Wrong choice or missing primitive?** If the right block exists and wasn't picked, that is a wrong choice — fix the representation. If the form the content needs is not in the schema, say missing primitive and use the nearest carrier as temporary (a hand-authored SVG in `image` for a spatial figure), saying so in `why`. Do not pretend the near miss did the job.
5. **Did we use a tool only because the last page used it?** Hero and callout need a reason in `why`, or they stay out.
6. **Did the draft do the sheet's job?** Answered in critique, against `outcome` and `coreModel`, not against taste.

## Pressure → block table

Guidance, not slots. "Use nothing" is always an option: if prose or a neighbor block already carries it, no block earns a slot.

| Pressure | Carries it | Tempting and wrong |
| --- | --- | --- |
| `frame` | `hero`, only when the page needs its one claim up top | a hero on every page from habit |
| `sequence` | `diagram` (linear flows only), `steps`, `timeline` when order in time is the point, `slideshow` when pacing is the point | `hero`, a table of steps |
| `lookup` | `compact-table`, `stat-strip`, short `text` | a long essay the reader must dig through |
| `spatial` | `image` (map, plan, layout; hand-authored SVG until the annotated-figure primitive earns its place) | `diagram` — it is a numbered list, it cannot draw two sides of a boundary |
| `decision` | `choice` (pick one, no score), `exercise` (one checkable answer), `comparison` when two views collide | a scored quiz when the job is picking one |
| `practice` | `fill-in` (reader writes their own values), `checklist` (self-check), `code` when the honest form is the command | paraphrasing the command in prose |
| `warning` | `note-callout`, only when a warning is earned | a callout on every page from habit |
| `source` | `resource-list` | inline link dumps in prose |
| `close` | `cta-band` pointing at the next page | a closer that restates the hero |
| `restraint` | use nothing — fewer blocks, or let the previous block carry it | decorating; overbuilding when the point is smallness |

Zoom in = fewer blocks, slower widgets (`reveal`, `fill-in`, `image`). Zoom out = `compact-table`, `stat-strip`, short `text`. Describe setting only when setting changes what the reader can do.

## The critique check

Critique v2 adds two required fields to `critique.json` (set `"critiqueVersion": 2`):

- `sheetJob`: `{ "outcome": "...", "coreModel": "..." }` — question 6 answered against the sheet, not taste.
- `unusedToolCheck`: for each thing the sheet asked for (`visualNeeds`, a filled `apply`, a named analogy), the block that carries it — or the failure. **If `visualNeeds` is spatial and the draft has no `image`, that is a representation failure, not a writing failure.** The test enforces the visual-needs half of this mechanically: every non-empty `visualNeeds` must be met by a visual carrier (`image`, `diagram`, `slideshow`) in `sections` or an explicit rejection with a reason.

Failures classify by layer (see the architecture's tracing table). A page that ignores a tool the sheet asked for is a representation failure; a form the schema cannot express is a missing primitive — and only a real page that cannot ship without it earns a new widget.
