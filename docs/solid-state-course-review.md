# First course pass: solid-state foundations

## What exists

`app/src/content/solid-state-foundations.json` is a ten-block introductory lesson, registered in the existing library as a **preview**. It uses only the version 1 vocabulary and the Workshop theme. It is public repository content; preview is a lifecycle label, not privacy protection.

The audience understands machines and wants the first electronics concepts needed to reason about a command, a switch and a load. The lesson covers voltage/current/resistance, a PN junction and diode, BJT versus MOSFET control, threshold versus on-resistance, and an inductive-load example. It ends with a knowledge check, a paper worksheet and three source cards.

This is the first foundations lesson, not the full course or a circuit design. The numerical resistor example and MOSFET question are explicitly hypothetical. No real work history, experiment, wiring result or learner outcome is invented. The app does not record the worksheet or quiz response.

## Evidence map

These primary sources were reviewed on 2026-09-21. The lesson paraphrases concepts; it does not reproduce manufacturer diagrams or imply that their application circuits have been tested here.

| Block | Support |
| --- | --- |
| `electrical-quantities` | Introductory definitions and an explicit paper calculation: 12 V / 1,000 Ω = 0.012 A; 12 V × 0.012 A = 0.144 W. |
| `junction-and-diode` | [Toshiba: PN junction](https://toshiba.semicon-storage.com/ap-en/semiconductor/knowledge/e-learning/discrete/chap1/chap1-6.html), linked through the [manufacturer course](https://toshiba.semicon-storage.com/us/semiconductor/knowledge/e-learning/discrete.html) in the artifact. |
| `two-transistor-families`, BJT column | [Toshiba: What is a bipolar transistor?](https://toshiba.semicon-storage.com/us/semiconductor/knowledge/faq/mosfet_common/what-is-a-bipolar-transistor.html), especially active-region gain versus switching regions. |
| `two-transistor-families`, MOSFET column; `threshold-check` | [TI: SLUA618A, Fundamentals of MOSFET and IGBT Gate Driver Circuits](https://www.ti.com/lit/slua618), section 2 and the turn-on intervals. |
| `industrial-switching` | [TI: SNVAA45](https://www.ti.com/document-viewer/lit/html/SNVAA45), introduction on magnetic energy, freewheeling/clamping and demagnetization time. The lesson's sequence is an original instructional synthesis. |

## Vocabulary findings

| Need exposed by authoring | What works now | Next bounded improvement |
| --- | --- | --- |
| Explain the control path versus the load path | `comparison` and `steps` can name the roles. | A reviewed diagram block would show terminals, direction and references much more clearly. It needs text alternatives and readable labels in both views. |
| Connect a technical claim to evidence | `embed` links the manufacturer and describes the supported sections. | A citation contract should attach stable source IDs to blocks and carry title, URL and locator. Today the mapping is prose plus this table. |
| Explore gate drive | `exercise` checks the threshold misconception. | A parameter widget is justified only after defining its physical model, units, limits and validation. A slider that implies an arbitrary MOSFET's exact behavior would mislead. |
| Preserve what the learner misunderstood | The quiz reveals an explanation while mounted. | A small explicit result record could relate artifact/block IDs, chosen answer, timestamp and optional reflection. Persistence and consent need a separate reviewed change. |
| Write and revisit a handoff | `checklist` prompts a paper worksheet. | A future response field could capture actual text. A checked box is not proof of understanding. |
| Group concepts into teachable units | One block equals one Present section; this lesson uses ten blocks. | A later section/group contract may keep explanation, source and question together without forcing a source card to occupy its own slide. Establish this through review before extending the schema. |

No new widget, citation field, result format, database or authentication system is introduced by this pass. These are specific findings from composing the lesson, not completed features or commitments to a larger platform.

## Verification and remaining review

The dependency-free validator suite checks this lesson, all existing artifacts, the unchanged legacy fixture and the widget catalog examples. Invalid structure, duplicate block IDs, invalid exercise indexes and unsafe source URL schemes are rejected.

The repository still lacks the pinned hosted runtime and a standalone package/build configuration. This pass does **not** claim a production build, deployment, or visual/accessibility acceptance. Keep the lesson in preview until the hosted app can be inspected in Browse and Present, all five themes, a narrow viewport and keyboard-only use. In particular, check the longer comparison and worksheet sections for overflow and feedback announcements.

Next content decision: review whether this lesson makes the control-versus-power distinction clear. That review should decide whether the first earned widget is a diagram, rather than expanding a speculative catalog.
