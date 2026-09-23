# Working product brief — gallery and story

**Status:** working product brief (locked 2026-09-23; build order reconciled same day).  
**Steward:** Chris (intent) / Grok (doc).

This is the north star for near-term product direction. It does not replace [ROADMAP.md](../ROADMAP.md) as the phase ledger or [shipped-vs-plan.md](./shipped-vs-plan.md) as the decision record. When those documents conflict with this brief on gallery or story intent, prefer this brief and note the conflict rather than silently rewriting history.

---

## Build order

Near-term sequence (gallery → story → refs). Judgment model lives in [GRADIENT.md](../GRADIENT.md); that note **defers build sequence here**.

1. **Gallery with complete block coverage** — every schema block once, live, with recipe notes beside specimens, plus an auto-check so coverage cannot quietly fall behind.
2. **One actual small story or course from existing blocks** — separate world pages from telling; world-vs-telling updates stay **human-reviewed** (no automatic consistency yet).
3. **Real page references** exposed by that work — validation for broken refs, then later backlinks.

Recipes are **suggestions / grammar options**, never required slots to fill. Gradient judgment chooses among recipes and drops empty blocks.

---

## The gallery: vocabulary plus grammar

The gallery is how people and agents learn the content language.

**Type-specimen sheet.** The first layer shows each block once, live, with its recipe beside it, so a person or agent learns the whole vocabulary in one scroll.

**Firm rule.** The gallery must cover every block in the schema, checked automatically, so it cannot quietly fall behind.

**Recipes (the more valuable layer).** Named combinations of blocks that do a job. Examples: “Explain a concept” = hero, text, diagram, exercise; “Compare options” = comparison, compact-table, note-callout for the caveat. Blocks are words; recipes are sentences. Once the story exists, “character page” and “scene page” become recipes too.

**Not mandatory templates.** Recipes suggest grammar; they do not demand every section. Empty sections from filling recipe slots as required fields are a fractal failure mode — drop what the content does not need.

**Regression fixture.** Phase 2 asks for regression fixtures covering all 19 blocks with long text, empty states, and narrow screens. Put those edge cases in the gallery and it becomes that fixture.

---

## The story: separate the world from the telling

There are two kinds of data.

- **The world** — reference material that should stay consistent (who a character is, what they want, what they know, where a place leads).
- **The telling** — ordered prose.

AI is good at the telling and bad at keeping the world consistent across a long piece. So the world lives in pages as the source of truth, and the prose gets written against them.

**Workflow loop.** Before writing a scene, read the character and place pages it touches; after publishing it, update those pages with what changed. Facts of the story live on the site, not in a chat. Same “search before you create” rule [AGENTS.md](../AGENTS.md) already has, applied to fiction. Those world updates stay human-reviewed for now; there is no automatic consistency layer yet.

**Two ways in for readers.** Series order to read straight through; hub and tags to wander the world.

**Missing piece the story will expose: real references.** Today a scene names a character by typing its slug. With real references, the validator catches broken ones; every page can show what points back (“appears in scenes 1 and 3”). Backlinks turn a pile of pages into an explorable world — the same help the solid-state course needs.

---

## What else needs work

Honest issues. Do not pretend these are shipped. They are **not** ahead of gallery → story → refs.

- **Unpublished links** — **fixed** (PR #21): preview/draft deep links resolve via `allEntries` to App’s “Not published” state instead of silently landing on Home.
- **Section links** — section links and copy-link are not built yet; gallery and story need them.
- **Draft privacy** — drafts are not private; every JSON is bundled and the repo is public. Only matters if a draft holds something you do not want public; an unfinished story readable in a public repo is a *choice*, not a gate on the gallery.
- **Studio** — Add menu covers **13 of 19** block types (still missing hero (add), stat-strip, code, embed, image, exercise); richer blocks still go through Import / JSON. Template/reset can wipe the one local draft. Only matters if you write in Studio; does not hold up the gallery.
- **Tests** — mostly structure, not browser render.
- **Planning docs** — two roadmaps, blueprint, architecture, shipped-vs-plan overlap; some stale.

### Blocker list (separate from build order)

Real issues to track, **not** a sequence that outranks gallery → story → refs:

- Section / copy-link
- Structure-only tests (need browser-render coverage over time)
- Planning-doc debt
- Draft privacy (conditional — see above)
- Studio wipe / incomplete Add coverage (conditional — see above; 13/19 in Add today)

---

## Prove with a real story

A large share of pages are about Showmob itself. [AGENTS.md](../AGENTS.md) says prove the language with real content. The story should be an actual story, not another page about how one could be written — that tells what to build next.

---

## Explicit non-goals

- Do not invent a live data source of truth yet. The site still reads repository JSON; Supabase remains foundation-only; Auth is not wired.
- Do not treat the novel-path growth sketch (`showmob-novel-path`) as the story.
- Do not expand the widget vocabulary until real content exposes a gap.
