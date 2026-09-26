# Tutorial teaching template

Status: **v1, Phase 4 of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md)**. Written by Instinct. Trial page: `local-security-lab-close-exposure`.

One teaching template, not ten. It applies when a page sheet says `mode: tutorial`. Other modes keep their own shapes; this doc does not touch them.

The shape converged before it was named: the first two tutorial pages in the security series (`local-security-lab-lab-scope`, `local-security-lab-host-listeners`) both organized their `teachingShape` as the same five beats without being told to. Phase 4 names and versions that shape so it can be judged, not so it can be obeyed. Per the architecture: teaching templates are jobs to accomplish, not visual sections. Block recipes stay suggestions, never required slots.

## The five beats

`tutorial` pages set `teachingShape` to these five fields.

| Beat | Job | Pass check | What it is not |
| --- | --- | --- | --- |
| `realTask` | Name a real task on the reader's own equipment or data | The reader could start it today with what they own | A topic statement. "Learn about firewalls" fails; "audit the openings on your own router" passes |
| `activate` | Bring back what the reader already has that the task needs | Every item is taught by an earlier page or comes from ordinary experience | New content smuggled in as recall |
| `demonstrate` | One complete worked example, start to finish, before the reader tries | A reader could repeat the example and reach the same verdicts | Fragments, or a summary of steps with no worked case |
| `apply` | The reader does the real task on their own case, with the example beside them | The page asks for the reader's own data and gives it somewhere to go | "Now you try" with no structure |
| `integrate` | The result joins what the reader already keeps, and names what it makes possible next | The page says what the reader now has that they did not have before | A summary paragraph |

## Rules

- **Beats are jobs, not block slots.** The representation stage chooses blocks per beat from content pressure. A beat may map to more than one block, or share one.
- **Empty beats are information.** Per the sheet rules: leave empty fields empty. An empty `apply` is the most direct sign a page explains instead of teaches.
- **The critique judges each beat.** Did the demonstration actually demonstrate? Could the reader apply without the example beside them? Beat failures trace to the generation layer; a beat that cannot be filled traces to the sheet (wrong mode) or the scope.
- **Version on change.** Any change to the beat set or their jobs is a new version, tested against known tutorial pages before it is kept (see the learning loop in LEARNING-ARCHITECTURE.md).

## Trial

First deliberate run: `runs/local-security-lab/pages/local-security-lab-close-exposure/`. The critique there judges each beat against this table.
