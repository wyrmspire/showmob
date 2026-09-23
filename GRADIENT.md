# Gradient judgment

Status: **committed build direction** (2026-09-23). Not fully shipped yet — we are building toward it. Steward: Chris (intent) / Grok (doc).

## Decision

We are building the **gradient** model. One rule: follow the strongest signal in the content. Complexity moves from pre-planned paths to real-time reading.

**Locked in conversation 2026-09-23** (Chris directed this lock on a voice call). Status line “committed build direction” reflects that lock—not a shipped feature set.

**Build sequence lives in [`docs/product-brief.md`](docs/product-brief.md)** (on `main`): gallery with full block coverage → one real story/course → real page references. This file is the judgment model; it does not own the near-term order of work. Gallery is the first real feature build; #37–40 were direction docs, not features.

Architecture boundaries stay in [`docs/architecture.md`](docs/architecture.md).

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

### Fractal check (closed)

Searched the codebase: nothing named fractal exists as a product layer. Archive uses of “gradient” mean visual CSS only. **There is no fractal layer to verify or replace.** Treat fractal as historical framing for this note, not as pending machinery.

## Recipes are suggestions, not templates

Recipes (named block combinations) are grammar options. They are never required slots to fill. Gradient judgment chooses among recipes and **drops empty blocks**. Turning recipes into mandatory section lists reproduces the fractal failure mode: empty sections everywhere because the template expected them.

## What is distinctive

Scoring and ranking content is common (search, feeds, recommendations). The unusual move is putting that **judgment inside the same thin language the content already lives in** — collapsing “understand the data” and “display the data” into one system. No parallel analytics product. The metrics that matter should be expressible as ordinary Showmob structure (blocks, sections, series, tags), reviewable like any other artifact.

## Implementation sketch

- **Feature, not rebuild.** Build on existing sections, space, layout, and tools (`schemaVersion: 1` JSON, shared widgets, Browse + slideshow-as-block, lifecycle, hub/tags).
- **Same contract.** Judgment output remains portable content the renderer already knows. Keep Showmob thin versus Mira/Edgerite.
- **No premature schema markers.** Do not propose importance markers or other schema expansion until a real page demands them. The story/gallery is the test: does the agent pick blocks from content pressure, or fill a pattern?
- **Lightweight weighing (later).** When content pressure appears, give the agent small, explicit ways to mark importance and surface load-bearing metrics using ordinary blocks (classifications, comparisons, stats, callouts) rather than a new scoring service.

## Non-goals

- A separate analytics, ranking, or recommendation stack.
- Autogenerating empty section trees “because the template expects them.”
- Replacing the content language with a judgment engine outside JSON + widgets.
- Expanding the schema for importance markers before a real page needs them.

## Next check

1. Ship and use the gallery (vocabulary + suggested recipes) under the brief’s build order.
2. Write one real story or course from existing blocks; watch whether agents pick blocks from content pressure or fill a recipe pattern.
3. Only then extend in-language markers or schema if a concrete page demands them.
