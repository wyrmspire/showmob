# Learning architecture

Status: **active** (un-parked 2026-09-25 at Chris's direction). Phases 1–4 trialed; tutorial template v1 at [docs/teaching-template-tutorial.md](docs/teaching-template-tutorial.md). Director/critique layer and grading connection specified at [docs/representation-director.md](docs/representation-director.md) and [docs/grading-connection.md](docs/grading-connection.md), enforced by tests. Written by Instinct from Chris's direction.

This is the operating doc for how Showmob should generate pages that teach, not just explain. It sits next to [GRADIENT.md](GRADIENT.md): GRADIENT.md is the judgment model for how content is expressed; this doc is the pipeline that decides what a page has to accomplish before anything is expressed. It does not own the near-term product order; [docs/product-brief.md](docs/product-brief.md) still does.

## The problem

Single-shot generation (prompt -> page JSON) produces pages that read like an explanation of the topic. Explaining is not teaching. A page can be accurate and well written and still leave the reader unable to do anything new.

The fix is to split generation into separate decisions, each one inspectable.

## Rules

- **The setup sheet controls what a page must accomplish. Gradient controls how it is expressed.**
- One page, one primary job. Use the four Diataxis modes: tutorial (learn by doing), how-to (do a real task), reference (look it up), explanation (understand why). Add `answer` for one question with one checkable answer and no skill to build; do not use it for a how-to. A series mixes modes on purpose. Do not force all four into one page.
- Research before outlining. Structure comes from what the topic contains, not from the topic's name.
- A concept is one thing you could check the reader on. Page count is an output of scope, never an input.
- Teaching templates are jobs to accomplish, not visual sections. Block recipes stay suggestions, never required slots.
- Generate in sections, not one call per page.
- Judge before publishing.
- Every stage writes a readable file.

## Pipeline

```
research  ->  topic map  ->  scope  ->  series
                                          |
                          for each page:  v
page sheet -> teaching strategy -> representation -> generate sections -> critique -> Showmob JSON
```

| Stage | Question it answers | Writes |
| --- | --- | --- |
| Research | What does this subject contain? Perspectives, concepts, examples, analogies, misconceptions, dependencies, edge cases. | `research.json` |
| Topic map | How do the ideas relate? Foundations vs advanced, `dependsOn` links, practice openings, visual candidates, natural boundaries. Not an outline. | `topic-map.json` |
| Scope | How much structure does the map justify? Page count, grouping, order, prerequisites. | `series.json` |
| Page sheet | What must this page accomplish? (fields below) | `page-sheet.json` |
| Teaching strategy | What progression fits this page's job? | in `page-sheet.json` |
| Representation | Which blocks carry each part? Gradient chooses from content pressure. | `representation.json` |
| Generate sections | Write each section from the sheet, its slice of research, its chosen blocks, and the previous section when needed. | `draft.json` |
| Critique | Did the draft do the sheet's job? | `critique.json` |

**Representation comes after teaching strategy and before generation.** You cannot write a section without knowing what form it takes. If blocks are picked after (or during) generation, the generator picks them by habit, and every page gets the same hero-paragraph-callout shape.

Run layout:

```
runs/<series>/research.json
runs/<series>/topic-map.json
runs/<series>/series.json
runs/<series>/pages/<page>/page-sheet.json
runs/<series>/pages/<page>/representation.json
runs/<series>/pages/<page>/draft.json
runs/<series>/pages/<page>/critique.json
```

## Page setup sheet

The sheet is the contract. Page JSON is downstream of it. Field names can evolve.

| Field | Meaning |
| --- | --- |
| `pageId`, `seriesId` | Identity and place in the series |
| `mode` | tutorial, how-to, reference, explanation, or answer |
| `readerMoment` | Where the reader is, mentally, when they arrive |
| `outcome` | What they can do or understand when they leave |
| `coreModel` | One checkable sentence for a teaching page; null for an answer |
| `prerequisites` | What must already be known, with links to the pages that teach it |
| `teachingShape` | The progression for this page (tutorials: realTask, activate, demonstrate, apply, integrate) |
| `requiredIdeas` | The ideas this page must land |
| `candidateAnalogies` | Examples and analogies from research, ideally from different angles |
| `visualNeeds` | Where a picture would teach better than text |
| `deliberatelyExcluded` | What this page will not teach, and why |
| `nextPagePressure` | What this page makes the reader ready for next |

**Not in the sheet:** block types or layout (hero, callout, table, diagram, cards). Those are representation decisions, made in the next stage by Gradient.

## Critique

Judge the draft against its sheet, not against taste. Did it teach or only explain? Is something missing or unneeded? Should it be reordered, split, or merged? Is a prerequisite missing? Does it need another example, practice, or a visual? Did the blocks come from content pressure or from habit?

Outcomes: accept, rewrite, reorder, cut, add example, add practice, split, merge, request visual, request prerequisite, request new primitive.

Judgment runs at two levels: topic level (was the scope right?) and page level (did this page do its job?).

## Tracing failures

Because each stage leaves a file, a bad page traces back to one layer:

| Symptom | Layer |
| --- | --- |
| Shallow | Research |
| Crammed, or ideas in the wrong order | Scope |
| Accurate but nobody learns anything | Wrong mode on the sheet |
| Good sheet, weak prose | Generation |
| Good content, confusing form | Representation (wrong choice) |
| The needed form cannot be expressed | Missing primitive |

## Wrong choice vs missing primitive

When a page has the wrong form, first ask which of two things happened:

- **Wrong choice:** the right block exists and the generator did not pick it. Fix the representation stage.
- **Missing primitive:** the form the content needs does not exist in the schema. That is a widget proposal (see [AGENTS.md](AGENTS.md)).

Sometimes reading the schema settles it with no pipeline needed. **An annotated figure has already earned its place.** The `diagram` block is a linear list of nodes. It cannot draw a Smith chart, a floor map, a cable-order picture, or a branching cause chain, and real pages have asked for all of these. That is a proven missing primitive under the "widgets come last" rule, not a wish.

## Learning loop

Grades do not rewrite templates directly.

```
grade -> classify the failure by layer -> hypothesis -> candidate change (new version)
      -> regenerate representative pages -> compare -> accept or reject
```

- Every change to a template or default is a new version, tested against known pages before it is kept.
- **The grade source must be the owner's judgment, or a grader that has been checked against the owner's judgment.** Grades that bunch together, or that always say "add something," cannot tell pages apart. A loop fed by them learns to overbuild.

## Build order

1. **Page setup sheets.** Cheapest step. Write sheets by hand for one good page, one page that explains instead of teaching, and one deep topic. Check that the sheet alone predicts the difference.
2. **Topic map and scope.** First test is blind: hand it a deep subject (security is a good one) without a page count and see whether it finds the depth on its own. Test depth judgment before generation quality. Guardrail: the blind-scope test reuses the subject's existing research trunk and seriesId. A new seriesId covering the same subject needs Chris's explicit call first — otherwise we fork two canonical sources for one subject.
3. **Representation plus section generation.** Choose blocks per section from the sheet, then generate section by section.
4. **One teaching template.** A tutorial progression (real task, activate, demonstrate, apply, integrate). One, not ten.
5. **Critique layer.** Judge drafts against sheets; write `critique.json`.
6. **Connect grading.** Grades produce classified hypotheses, never automatic rule changes, and only from a trusted grade source.

The minimum version is six functions, each writing a file: `research(topic)`, `scope(research)`, `makePageSheet(page)`, `chooseRepresentation(sheet)`, `generate(sheet, representation)`, `critique(draft, sheet)`. The power comes from separating the decisions, not from bigger prompts.
