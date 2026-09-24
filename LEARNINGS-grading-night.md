# Learnings: the grading-night build (2026-09-24)

Written by Instinct after shipping the grading-night pipeline: 100 subjects, 4 generators, 100 pages, one test center at `/grading`.
Companion to `DESIGN-NOTES-grading.md` (which reviews the grading surface as built). This note is the other side: what the build itself taught us, and what the API, the tools, and the generators should take from it.

## 1. Identity rules must be collision-proof before parallel writers start

Two A/B twins share a title, and the slug was kebab(title). Same title, same slug: one page. `gn-the-us-electrical-grid-from-power-plant-to-wall-outlet` got claimed by both GN-072 (by slug) and GN-073 (by title). The `-a`/`-b` suffix rule fixed every page built after it, but 9 subjects still needed manual `artifact_slug` reconciliation in the database afterward.

The guardrail that exists now is `scripts/check-gn-slugs.mjs` (PR #79): every subject must resolve to exactly one page, shared slugs and orphans fail the check. Run it whenever a batch lands.

**Take:** naming is part of the contract. If N generators write in parallel, the identity rule has to produce N distinct keys by construction, not by luck. Check it in CI, not in a cleanup pass.

## 2. The subjects table is the source of truth - every arrival path must write to it

Grok and GPT delivered their 50 pages out of band (straight to the repo, no registration). Pages rendered fine, but the table still said `pending`: 50 rows wrong, 9 orphan pages, and the grading index lying about the state of the set. Reconciliation was manual SQL, twice (9 slug links, then 50 status backfills).

**Take:** a page landing in the repo is not the pipeline knowing about it. Any path that delivers an artifact - API import, generator script, hand-rolled PR - has to update the subjects table in the same move, or reconciliation becomes a standing manual job. The check script is the tripwire; the fix is making arrivals register themselves.

## 3. Reader pass: what the set actually looks like

Reading the pages as a set surfaced things no single page review would:

- The full-screen hero padded every page regardless of size. A 3-block page spent its whole first screen on a title. Fixed in PR #74: hero height now scales to block count.
- Formulaic skeleton: 75 of 75 pages opened with a hero, 64 of 75 carried a note-callout. Read as a set, the pages blur together. The skeleton is a default, not a decision.
- The restraint pages (few blocks, no padding) earned their size. GN-100 stayed small on purpose instead of taking the failure-bait and building a dashboard for a houseplant.

**Take:** generators copy the last skeleton they saw. If the brief doesn't force variety, 100 pages become one page 100 times. The matrix axes exist to break this; make the generator briefs check them before defaulting to hero-plus-callout.

## 4. Unlisted is neither reachable nor protected

Two opposite failures, same root cause:

- `/everything` existed and worked, but nothing linked to it, so for a user it didn't exist. Fixed in PR #70 by giving it one deliberate doorway from `/grading`.
- The grading API shipped world-readable. "Unlisted" did nothing; anyone with the URL had the subjects and grades. Fixed in PR #63 with a server-side passcode check.

**Take:** every surface needs two explicit decisions - how do the right people find it, and what stops the wrong ones. "Nobody knows the URL" is not a discoverability plan and it is definitely not access control.

## 5. The blind has an answer key sitting in root

The handoff packets (`handoff-grok.md`, `handoff-gpt.md`, `handoff-claude.md`, `handoff-instinct.md`) list every subject's generator and render axis. That's the coordination data the generators needed, and it's in the public repo. Fine for the build - but it means blind grading depends entirely on the grader not reading root. There is no enforcement, and there can't be in a public repo.

**Take:** if the blind ever needs to be real (second grader, published results), the assignment metadata has to move out of the repo - the DB already holds it. For now it's a discipline note: don't read the handoffs while grading.

## 6. Judgment calls the grading should surface, not paper over

Two calls made during the build, recorded so grading can judge them instead of inheriting them silently:

- GN-100 chose restraint over the failure bait. If the bait was the point of the subject, the page failed the brief on purpose.
- GN-004's timer was built from existing vocabulary instead of inventing a new widget. Trade: less tailor-made, more proof the vocabulary composes.

**Take:** when a builder makes a judgment call against the brief's grain, the grade panel is where it gets judged. These gaps are features of the exercise, not defects to hide.

## 7. Consent UX matters even for self-tracking

Behavior capture (time on page, scroll depth, finished) was in the grading spec from the start, and it only ever captures the grader, on his own pages, into his own database. It still read as weird the moment it was noticed in the dumps.

**Take:** "the user approved the spec" is not the same as the user feeling informed at the moment of capture. If a sensor would surprise someone when they stumble on it later, say it where it happens - one line near the grade panel - not just in a design doc.

## What this means for the next build

1. `check-gn-slugs` (or its successor) runs in CI on every content PR. Identity bugs fail the build, not the week.
2. Artifact delivery and subject registration become one operation. The API should own "arrive" as a verb.
3. Generator briefs name the skeleton explicitly per subject; defaulting to hero-plus-callout without an axis reason is a defect.
4. Every new surface ships with a doorway decision and an access decision written in its PR.
5. Grade capture states what it records, where the grader can see it.

The full set: 100 subjects, 100 pages, all marked built, slug check green. Grading is the next step, and the grades table is where these lessons get tested.
