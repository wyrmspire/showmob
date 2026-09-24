# Grading-night content readiness

2026-09-24 completion and editorial pass by GPT, at Chris's request to improve and finish the 100.

## What is complete

- 100 situations have 100 distinct schema-v1 preview artifacts. Each generator retains 25 original attributions.
- The remaining 25 GPT situations are authored with the existing 19-block contract.
- All six A/B pairs have explicit, distinct slug mappings in [the manifest](grading-night-manifest.json). Title-derived fallback alone cannot reliably select both sides.
- Five self-contained SVGs provide a garage layout, GD&T symbol key, transistor contribution map, electromagnetic-spectrum overview and wafer-process loop. Each has a text equivalent.
- A content test guards subject identity, preview status, pair separation, image assets and concrete promised quantities. It checks the OEE example from its raw counts.

The manifest records the approved subject IDs, titles, assigned generators and pair IDs from `showmob_gn_subjects`. Content remains in repository JSON. After deployment, reconcile `artifact_slug` and `status` in the existing subject table; retain any `graded` status and never create artificial grades.

## Editorial changes to the original 75

Original `contributor` values remain intact. These twelve existing artifacts were edited by GPT before any grades existed:

| Subject | Correction |
| --- | --- |
| GN-003 / GN-004 | Align egg timings with a stated hot-start method; remove guaranteed results and the claim that a timeline is a running timer. |
| GN-007 | Replace universal jump-start promises and repeated-cranking advice with a manual-specific scope, designated points and stop conditions. |
| GN-029 | Provide exactly 20 simulator-only program lines and a matching per-line explanation; specify the finished face and stock allowance, explicit motion modes, real pass overlap and stock clearance. |
| GN-031 | Distinguish the simplified scan model from asynchronous I/O; correct timer-resolution, skipped-routine and edge-detection generalizations. |
| GN-035 | Correct lockout/tagout verification, stored-energy reaccumulation, group arrangements and notification after device removal before startup. |
| GN-045 | State that the agenda provides two two-hour sessions rather than a continuous four-hour block. |
| GN-067 | Remove the claim that generic resistors/clips make every capacitor discharge safe; supply calculated energy examples and equipment-specific limits. |
| GN-076 | Supply all forty named people, distinguish era and institution from person, and correct the chronology in the answer explanation. |
| GN-091 | Replace inconsistent OEE and loss figures with one reproducible 18:00 snapshot, raw counts, matching states and mutually exclusive loss categories. |
| GN-092 | Separate completion-based, fixed-calendar and usage-based recurrence; label the schedule static and intervals fictional. |
| GN-095 | Restore the four actual lifecycle states and distinguish lifecycle from PR state; correct production-preview routing claims. |

This is a targeted editorial audit, not certification of every technical statement in the corpus. Safety material remains general educational content; equipment-specific procedures and governing standards take precedence.

## Interaction gaps are still study results

There is no new schema, executable block, persistence behavior or application code in this change. The present vocabulary can render choices, slideshows, checklists and reference tables, but cannot fulfill every requested interaction axis.

| Situation | Delivered with current blocks | Still absent |
| --- | --- | --- |
| GN-004 | Timing guide with external-timer instruction | Running countdown and alarm |
| GN-014 | Actual floorplan plus constraints and budget | Movable machine geometry or collision checking |
| GN-026 | Computed MOSFET cases, carousel and prediction checks | Gate-voltage/load sliders and live computation |
| GN-038 | Ten answer-reveal exercises and written blanks | Free-entry worksheet fields or saved answers |
| GN-042 / GN-050 | Worked log/handoff and copyable blank format | Editable records, submission and persistence |
| GN-046 | Same appointments as its paired agenda; constraint alternatives | Drag-and-drop schedule editing |
| GN-054 | Contribution map and route carousel | Clickable graph exploration |
| GN-070 / GN-074 | Layered reference atlas/process guide and checks | Zoomable exploration or process simulation |
| GN-091 / GN-092 / GN-094 / GN-095 | Worked operational snapshots with explicit assumptions | Live feeds, recalculation, durable writes or workflow transitions |

The rest of the corpus includes other simulations, forms and operational situations represented with static blocks. Those pages are gradeable presentation attempts, not proof of full interaction support. Record unmet interaction needs separately from content quality. Pair comparisons involving a missing interaction are partial representation comparisons, not controlled tests of the requested widget.

Do not turn every gap into a widget request automatically. Use repeated reader feedback to decide which capability deserves implementation, consistent with `grading-night.md`.

## Verification and limits

Run `npm test`; the required validator is included. Build both production and `VITE_SHOW_UNPUBLISHED=true` configurations in the existing CI workflow. Review SVGs visually and verify the deployed grading route when browser access permits.

During this authoring session, all Node tests passed locally. The workspace network denied npm package downloads, so the full build is delegated to CI. The cloud browser was blocked from opening the production host; deployment readiness must not be reported as a completed live click-through. No grade submission is needed to verify content, and no test grades should enter Chris's dataset.
