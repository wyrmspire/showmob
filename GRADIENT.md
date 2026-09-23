# Gradient judgment

Status: **committed build direction** (2026-09-23). Not fully shipped yet — we are building toward it. Steward: Chris (intent) / Grok (doc).

## Decision

We are building the **gradient** model. One rule: follow the strongest signal in the content. Complexity moves from pre-planned paths to real-time reading. The existing fractal layer is to be verified or replaced — do not treat fractal machinery as given until that check is done.

This note captures the shift from a **fractal system** framing to a **gradient-judgment** model. It is a feature on existing bones, not a rebuild. For gallery, world-vs-telling, and real-story pressure, see [`docs/product-brief.md`](docs/product-brief.md) when that brief is on `main` (PR may still be open). Architecture boundaries stay in [`docs/architecture.md`](docs/architecture.md).

## Origin

We started with a fractal-system idea: one rule repeating outward into structure. A story section followed (character arcs, world metrics). That made the same pattern look useful for any topic, not only fiction. The real target stopped being “fill a story template” and became **judgment**: the agent parses content, establishes metrics and classifications, and decides how to present load-bearing data — instead of padding sections with placeholders.

## Fractal vs gradient

| | Fractal | Gradient |
| --- | --- | --- |
| Rule | One pattern repeats at every scale | Expansion is directional |
| Why it grows | Self-similarity | Each step follows a reason |
| Shape | Template echoed outward | Emerges from pressure points |
| Failure mode | Same empty sections everywhere | Over-claiming importance without evidence |

A fractal repeats one rule. A **gradient** expands because different reasons pull in different directions. The page’s shape should come from those pressures, not from re-running a fixed outline.

## What is distinctive

Scoring and ranking content is common (search, feeds, recommendations). The unusual move is putting that **judgment inside the same thin language the content already lives in** — collapsing “understand the data” and “display the data” into one system. No parallel analytics product. The metrics that matter should be expressible as ordinary Showmob structure (blocks, sections, series, tags), reviewable like any other artifact.

## Implementation sketch

- **Feature, not rebuild.** Build on existing sections, space, layout, and tools (`schemaVersion: 1` JSON, shared widgets, Browse + slideshow-as-block, lifecycle, hub/tags).
- **Lightweight weighing.** Give the agent small, explicit ways to mark importance and surface load-bearing metrics (classifications, comparisons, stats, callouts) rather than a new scoring service.
- **Same contract.** Judgment output remains portable content the renderer already knows. Keep Showmob thin versus Mira/Edgerite.
- **Verify the fractal layer first.** A prior “fractal system” may not be fully built; its mechanisms are unclear in this repo today (no dedicated fractal/gradient design doc existed before this file; archive “gradients” only means visual theme color). **Do not depend on fractal machinery until someone verifies what, if anything, shipped under that name.**

## Non-goals

- A separate analytics, ranking, or recommendation stack.
- Autogenerating empty section trees “because the template expects them.”
- Replacing the content language with a judgment engine outside JSON + widgets.

## Next check

1. Confirm whether any fractal-system code or content conventions already exist beyond this conversation.
2. Propose the smallest in-language markers for importance / metrics on one real page.
3. Only then extend recipes (gallery) or world pages (story) if judgment pressure demands them.
