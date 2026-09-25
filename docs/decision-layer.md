# Decision layer

Status: **captured intent** (2026-09-24, Chris voice note). Not scheduled — this builds after grading is done. Steward: Chris (intent).

## The concern, in Chris's words

The pages feel like AI: conversational, not teachy. Something is missing — mechanisms. The way you'd tell a story. Maybe that's the gradient thing (see `GRADIENT.md`), maybe it's something else. Open question whether the grading system will even capture what "teachy" means — grading judges plan-vs-execution, but the gap may be in the intent itself.

## What "teachy" is missing

Working definition, to be refined: teaching progresses (simple → complex), shows mechanisms, gives examples, uses visuals to carry load-bearing ideas, and checks understanding. Conversational content explains; teachy content builds.

## Content notes (from the same pass)

- **Security page density.** One page absorbed what could have been ten, and did it well — including drawing its own graphics. Density is a win, but compression shouldn't be the default everywhere; some topics earn the ten pages.
- **Graphics are underused.** The security page drew graphics; plenty of other pages that could have had graphics didn't. Visuals should be a first-class decision, not an accident.
- **Allegory/memegory series wants more examples.** Especially the "how it works" sections — think 500x more worked examples, not 5x.
- **More widgets.** Pointer widgets that direct attention, more infographic-style blocks. Consider an infographic widget — or a gallery that collects every infographic in one place.

The widget catalog lives in `docs/widgets.md`; new ideas are not supported types until built.

## The decision layer

Today the pipeline is: *blam* — generate content. The proposal is a layer that sits around generation:

1. **Generate** — produce candidate content (as today).
2. **Reason** — read it back against intent: does it teach? where is the pressure? This is where gradient judgment (`GRADIENT.md`) lives — follow the strongest signal in the content.
3. **Sort** — rank and arrange: what earns the ten pages, what compresses to one, what gets cut, what needs a graphic or a widget.
4. **Infer** — draw conclusions on the sorted set: the synthesis, the takeaways, the "so what" — as content, not as a separate analytics product.

Generate → reason → sort → infer. The reasoning and inference stay inside the same thin content language (blocks, sections, series), per the gradient non-goals: no separate analytics or ranking stack.

## Sequencing

Grading first. The decision layer needs the grading signal — and the answer to whether grading captures intent — before it's worth building. Revisit after grading-night is done and judged.

## Open questions

- Can grading be taught what "teachy" means, or does that need a separate rubric?
- Which content earns expansion vs compression — gradient judgment call or author call?
- Infographic widget vs infographic gallery: one new block type, or a view over existing image/stat blocks?
