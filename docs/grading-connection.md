# Grading connection

Status: **v1, Phase 6 of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md)**. Written by Instinct.

Grades do not rewrite templates or defaults directly. The loop:

```
grade -> classify the failure by layer -> hypothesis -> candidate change (new version)
      -> regenerate representative pages -> compare -> accept or reject
```

## Grade records

A grade that enters the loop is a file, `runs/<series>/grades/<page-or-batch>.json`:

```json
{
  "gradeVersion": 1,
  "pageId": "...",
  "gradeSource": { "kind": "owner", "detail": "Chris's taste pass, 2026-09-26" },
  "contentSha256": "sha256 of the page JSON exactly as graded",
  "grade": "teaches | explains | neither",
  "classification": "representation",
  "hypothesis": "visualNeeds was spatial; the draft used text. Director check would have caught it.",
  "candidateChange": "none yet - one grade is a lead, not a rule"
}
```

- `contentSha256` pins the grade to a page version: if the page is edited after grading, the hash stops matching and the drift is visible instead of silent. The grading-night database rows carry the same pin (`showmob_gn_grades.document_sha256`, computed from the artifact document exactly as rendered), and amendments append a new row that supersedes the original - nothing is rewritten in place.
- `gradeSource.kind` is `owner` or `calibrated-grader`. **The grade source must be the owner's judgment, or a grader that has been checked against the owner's judgment.** Grades that bunch together, or that always say "add something," cannot tell pages apart; a loop fed by them learns to overbuild. Chris's taste pass (teaches / explains / neither taps) is the ground truth; any other grader calibrates against it before its grades count.
- `classification` is one layer: `research`, `scope`, `sheet`, `teaching-strategy`, `representation`, `generation`, `critique`, `missing-primitive`. A grade with no layer is a vibe; it does not enter the loop.
- `hypothesis` states the suspected cause. `candidateChange` names a new version of a template or default only after the hypothesis survives contact with more than one page.

## Rules

- **Never automatic rule changes.** One bad page is one lead. A change is tested against known pages before it is kept, per the learning loop.
- **Grades land as hypotheses, not edits.** The record above is the whole contract: source, layer, hypothesis. Nobody edits a template because one page graded badly.
- **The critique layer feeds this, not the reverse.** `docs/representation-director.md` catches mechanical failures (a tool the sheet asked for, unused) before a page ever reaches a grader; grading measures what the mechanical layer cannot — whether the page actually teaches.
- **Batch runs are graded by someone other than the author.** Same-author critique stays a caveat, not a verdict (Chris's 2026-09-26 plan: the next batch is graded against his taste by someone other than Instinct).

## Outside review, 2026-09-26

GPT's third caution lands here: the machinery cannot prove readers learn - taste grades are one layer up from "did the pipeline follow its rules." The plan that matches Chris's instinct: freeze the machinery, generate a batch under director v2, and measure (his teaches / explains / neither taps, graded by someone other than the author). Grok's ordered list agrees: grades into `runs/local-security-lab/grades/` are the locked door and outrank any new field. The 10 calibration pages were appended to the grading-night set as GN-101..GN-110 on 2026-09-26.

## What this does not change

No database plumbing here. Grading-center subjects and grades stay as they are; the registry slug root-cause fix waits for Chris's go. This doc defines the record format and the rules so that when grades arrive — owner taste pass first — they land classified instead of loose.
