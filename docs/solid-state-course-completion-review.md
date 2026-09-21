# Solid-state course completion review

## Course shape

The `solid-state-circuitry` series now contains eight ordered preview artifacts:

1. Introduction: `solid-state-foundations.json`
2. Semiconductor basics
3. Diodes
4. Transistors
5. MOSFETs
6. Power switching
7. Knowledge check
8. Resources and final worksheet

The existing introductory lesson remains the first artifact. The seven new files extend it rather than repeating its voltage, current, junction, transistor-family and inductive-load overview. All course artifacts remain `preview`: publication, production build and visual acceptance have not happened in this repository snapshot.

The lessons are written for readers who already understand machines, controls and loads. Examples are conceptual or paper exercises. They do not claim to approve a circuit, machine change or safety function.

## Evidence and review boundary

The course uses manufacturer material as its primary reference layer:

- [Toshiba: Basic Knowledge of Discrete Semiconductor Devices](https://toshiba.semicon-storage.com/us/semiconductor/knowledge/e-learning/discrete.html) for semiconductor, junction, diode and BJT foundations.
- [Vishay: Fundamentals of Rectifiers](https://www.vishay.com/docs/88867/anfundamental.pdf) for rectifier characteristics, reverse recovery and losses.
- [Texas Instruments: SLUA618A](https://www.ti.com/lit/slua618) for MOSFET gate charge, switching intervals and gate-driver relationships.
- [Texas Instruments: SLPA021](https://www.ti.com/lit/an/slpa021/slpa021.pdf) for power-MOSFET selection mistakes, thermal conditions and safe operating area.
- [Texas Instruments: SNVAA45](https://www.ti.com/document-viewer/lit/html/SNVAA45) for inductive energy, clamps and release-time tradeoffs.

The prose distinguishes a device-family model from a selected part. It repeatedly directs the learner back to exact datasheet conditions, package, revision, thermal path and controlled measurements. Absolute-maximum values are described as boundaries, not design targets. Application-note examples are not presented as qualified machine circuits.

## Composition and known widget gaps

No widget or schema code was added. The course is composed from the version 1 catalog: `hero`, `text`, `comparison`, `steps`, `note-callout`, `exercise`, `checklist`, `embed` and `cta-band`.

The pass confirms the gaps recorded after the first lesson:

- A reviewed diagram widget would make terminal references, current paths and clamp loops clearer than prose. It needs readable labels and a text alternative.
- Exercises support one multiple-choice answer at a time, but not a scored course quiz, answer persistence or an end-of-course result. The quiz therefore labels its reset behavior and asks learners to keep notes elsewhere.
- Checklists can prompt a worksheet but cannot capture calculations, free text, units or instructor review. They are not evidence of competence.
- `embed` provides a source card, but blocks cannot cite a stable source ID and locator directly. Source captions and this evidence map carry that relationship for now.
- A simple table would be more compact for ratings and source comparisons than repeated comparison cards, but inventing one for this course would cross the content boundary.

These are authoring findings, not requests to slip new widgets into the course. Any contract change should be reviewed independently.

## Verification still needed

`tests/validation.test.mjs` discovers every JSON file, validates it, checks slug uniqueness and requires registration in `App.tsx`. That existing coverage includes all seven new artifacts without a special-case test.

The source snapshot still lacks the pinned hosted runtime and standalone build configuration described in `AGENTS.md`, so this change does not claim a production build. Before promotion from preview, inspect all eight artifacts in Browse and Present, at narrow width, with keyboard-only navigation, and across the available themes. Long comparison cards, source cards, worksheets and the seven-question quiz deserve particular overflow and announcement checks.
