# Setup sheet trial: three pages

Status: Phase 1 trial, 2026-09-24. Written by Instinct.

Phase 1 of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md) says to write setup sheets by hand for one page that worked, one page that explains instead of teaching, and one deep topic, then check whether the sheet alone predicts the difference. This note records what that showed. The format it produced is in [page-setup-sheet.md](page-setup-sheet.md).

All three sheets are `as-built`: reconstructed from the shipped page and, where one exists, its plan entry. They describe what each page actually committed to, not what it should have done.

## The three pages

| Page | Why this one | Sheet |
| --- | --- | --- |
| `gn-splitting-a-143-dinner-bill-four-ways-with-a-20-tip` | The page that worked. Among the highest-graded pages in the first hand-graded batch, on every dimension. | [sheet](../runs/grading-night/pages/gn-splitting-a-143-dinner-bill-four-ways-with-a-20-tip/page-sheet.json) |
| `chainmail-collective-lanes` | Explains instead of teaching. [after-grading.md](after-grading.md) names the Chainmail plan: good plan, but it explains the idea instead of teaching how it works. The lanes page is where "how it works" should live. | [sheet](../runs/chainmail-collective/pages/chainmail-collective-lanes/page-sheet.json) |
| `defensive-local-security-lab` | The deep topic. after-grading.md: one of the better pages, drew its own graphics, but compressed a course into one page. | [sheet](../runs/local-security-lab/pages/defensive-local-security-lab/page-sheet.json) |

## Did the sheet predict the difference?

Yes, for all three, and each one through a different field.

- **Dinner bill.** Every field has a short, confident answer. The exclusions (no calculator, no itemizing, no etiquette) are the reason the page is good. The sheet looks almost empty, and that is correct.
- **Chainmail lanes.** The honest outcome is "Can name the six lanes and say that they stack." The verb is *name*. `realTask` is blank and `apply` is empty. The sheet shows a page that lists things for the reader to recognize. Nothing on it has the reader do anything. That is "explains instead of teaches", visible before a single sentence is read.
- **Security lab.** Six of seven prerequisites have no page behind them (subnets, ports and listeners, firewall rules, VLANs, packets vs metadata, admin commands), and there are nine required ideas. `activate` is empty: the page never connects to what the reader already knows. It has a real task and a clear visual need, which matches why it read as one of the better pages. The open prerequisites are the compression. A page cannot teach nine ideas that sit on six untaught ones.

## What the fields taught us

**Load-bearing:**

- `outcome`. Its verb was the fastest single tell. "Can tell each person what they owe" versus "Can name the six lanes" shows the difference in one line. The format now requires a "Can ..." line.
- `teachingShape`, read for its blanks. An empty `realTask` or `apply` means explaining. Filled slots do not prove the page teaches, but empty ones prove it does not.
- `prerequisites` with a `taughtBy` link. In the draft format this was a plain list, and it hid the security page's problem. Once each prerequisite had to name the page that teaches it, the scope failure showed up. This is the Phase 2 scope signal, available as early as Phase 1.
- `deliberatelyExcluded` with a reason. For the page that worked, this carried most of the judgment. The grading-night plan entries already had it (as `rejected`), which is probably part of why restraint pages held up.

**Useful sometimes:**

- `visualNeeds`. Empty on two of three, and correctly so. On the security page it named the one picture that mattered, and the page drew it.
- `nextPagePressure`. Nothing for a one-off answer. Useful inside a series. For the security page it showed that the "next page" was a promise with no page behind it.

**Weak or useless in this trial:**

- `candidateAnalogies`. Empty on all three. For the dinner bill that is right. For the other two it is part of what is missing, not proof the field is useless: after-grading.md asks for several examples from different angles, and neither page has one. Keep it and watch it on a tutorial.
- `requiredIdeas` as a flat list. Easy to fill and hard to judge. It became meaningful only next to prerequisites (nine ideas on six open prerequisites). It may need a size or depth signal later.
- `mode`, as limited to four values. See below.

**Missing, and added:**

- `useShape` (once, returns, alongside). The dinner bill is read once at a table. The security lab is kept open while building. Most grading-night plan goals already said this ("one-time read", "a job done every 90 days"), and it drove density more than mode did. `readerMoment` alone did not carry it.
- `sheetKind` (planned or as-built). Sheets reconstructed from shipped pages and sheets written before generation should not be confused when critique runs.
- `teachingShapeWhy`. A null teaching shape needs its reason recorded, or it reads as a gap.

## Open question

**Is "answer" a fifth mode?** The dinner bill is not a tutorial, a reference, or an explanation. It sits in how-to only because it had to go somewhere, and the teaching shape had to be null. Many grading-night subjects are one-question answer pages. The format keeps the four Diataxis modes, as LEARNING-ARCHITECTURE.md says, and records the strain here. If more answer pages fight the four modes, adding `answer` is the likely fix.

## What this does not show

- Three pages is a small sample. The same fields could read differently on a real tutorial.
- The sheets were written by the same agent that judged them, knowing the outcomes. A fair test is a `planned` sheet written before generation for a new page, then checked against its grade.
- Nothing here changes a page. The chainmail and security pages are as they were.
