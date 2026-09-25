# Page setup sheet

Status: **v1 format, Phase 1 of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md)**. Hand-written only; nothing generates sheets yet. Written by Instinct.

A setup sheet says what one page must accomplish. It is written before any prose or block choice, and page JSON is downstream of it. It says nothing about blocks, layout, or widgets. Those are representation decisions, made in the next stage by Gradient.

Sheets live at `runs/<series>/pages/<page>/page-sheet.json`. Pages with no series use a group name (for example `grading-night`) as the folder and `null` as `seriesId`.

Field names are expected to change. The trial that shaped this version is in [page-setup-sheet-trial.md](page-setup-sheet-trial.md).

## Fields

| Field | Type | Meaning |
| --- | --- | --- |
| `sheetVersion` | number | Format version. Currently `1`. |
| `sheetKind` | `planned` or `as-built` | `planned` is written before the page. `as-built` is reconstructed from a shipped page, for testing the format. |
| `pageId` | string | The page slug. |
| `seriesId` | string or null | The series the page belongs to. |
| `mode` | `tutorial`, `how-to`, `reference`, `explanation`, or `answer` | The page's one primary job. `answer` is one question with one checkable answer, not a skill to build; use `how-to` for a task the reader must learn to do. |
| `useShape` | `once`, `returns`, or `alongside` | How the page gets used: read once, come back to it, or keep it open while doing the work. |
| `readerMoment` | string | Where the reader is when they arrive: what they know, what they want, what state they are in. |
| `outcome` | string starting with `Can ` | What the reader can do when they leave. It has to be something you could check. |
| `coreModel` | string or null | The single idea the reader walks off with. `null` for `answer`; exactly one checkable sentence for each teaching page. |
| `prerequisites` | list of `{ idea, taughtBy }` | What must already be known. `taughtBy` is the slug of the page that teaches it, or `null` if no page does yet. |
| `teachingShape` | object or null | The progression. Tutorials use `realTask`, `activate`, `demonstrate`, `apply`, `integrate`. Use `null` when the page has nothing to teach, and say why in `teachingShapeWhy`. |
| `requiredIdeas` | list of strings | The ideas the page must land. |
| `candidateAnalogies` | list of strings | Examples and analogies from research, from different angles. Can be empty. |
| `visualNeeds` | list of strings | Where a picture would teach better than text. Describe the picture's content, not the block. |
| `deliberatelyExcluded` | list of `{ what, why }` | What the page will not do, with a reason. |
| `nextPagePressure` | string or null | What the page leaves the reader ready or wanting to do next. |

## Rules for filling it in

- **Give teaching pages one core model.** Test the sentence against a concrete case. This field is the leading hypothesis for where Gradient's sequencing pressure lives; test it during critique. An `answer` page gets `null`, not a lesson wrapped around its result.
- **Write the outcome as a checkable "Can ..." line.** If the honest verb is "name", "know about", or "understand", the page is probably explaining, not teaching. That is fine for an explanation page and a warning for anything else.
- **Leave empty fields empty.** A blank `realTask` or an empty `apply` is information, not a gap to paper over. It is the most direct sign that a page explains instead of teaches.
- **Every prerequisite needs a `taughtBy`.** A `null` means the reader must already know it, or the series is missing a page. Several `null`s on the ideas the page depends on means the topic is bigger than the page.
- **Exclusions need a reason.** "Not asked", "owned by another page", or "out of scope by consent" are all reasons. An exclusion with no reason is a guess.
- **Stay silent on form.** No block names, no layout, no widget choices. `tests/page-sheets.test.mjs` fails on sheet keys like `blocks`, `layout`, or `widget`.

## Reading a sheet before generation

A sheet is ready when:

1. The outcome is a checkable "Can ..." line that fits the mode, and `coreModel` follows the mode rule.
2. The teaching shape has a real task, or says why it has none.
3. The prerequisites the page leans on have pages behind them, or the gaps are on purpose.
4. Every exclusion has a reason.

If a sheet cannot pass these, fix the sheet or the scope. Do not generate yet.
