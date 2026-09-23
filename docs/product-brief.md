# Working product brief — gallery and story

**Status:** working product brief (locked 2026-09-23).  
**Steward:** Chris (intent) / Grok (doc).

This is the north star for near-term product direction. It does not replace [ROADMAP.md](../ROADMAP.md) as the phase ledger or [shipped-vs-plan.md](./shipped-vs-plan.md) as the decision record. When those documents conflict with this brief on gallery or story intent, prefer this brief and note the conflict rather than silently rewriting history.

---

## The gallery: vocabulary plus grammar

The gallery is how people and agents learn the content language.

**Type-specimen sheet.** The first layer shows each block once, live, with its recipe beside it, so a person or agent learns the whole vocabulary in one scroll.

**Firm rule.** The gallery must cover every block in the schema, checked automatically, so it cannot quietly fall behind.

**Recipes (the more valuable layer).** Named combinations of blocks that do a job. Examples: “Explain a concept” = hero, text, diagram, exercise; “Compare options” = comparison, compact-table, note-callout for the caveat. Blocks are words; recipes are sentences. Once the story exists, “character page” and “scene page” become recipes too.

**Regression fixture.** Phase 2 asks for regression fixtures covering all 19 blocks with long text, empty states, and narrow screens. Put those edge cases in the gallery and it becomes that fixture.

---

## The story: separate the world from the telling

There are two kinds of data.

- **The world** — reference material that should stay consistent (who a character is, what they want, what they know, where a place leads).
- **The telling** — ordered prose.

AI is good at the telling and bad at keeping the world consistent across a long piece. So the world lives in pages as the source of truth, and the prose gets written against them.

**Workflow loop.** Before writing a scene, read the character and place pages it touches; after publishing it, update those pages with what changed. Facts of the story live on the site, not in a chat. Same “search before you create” rule [AGENTS.md](../AGENTS.md) already has, applied to fiction.

**Two ways in for readers.** Series order to read straight through; hub and tags to wander the world.

**Missing piece the story will expose: real references.** Today a scene names a character by typing its slug. With real references, the validator catches broken ones; every page can show what points back (“appears in scenes 1 and 3”). Backlinks turn a pile of pages into an explorable world — the same help the solid-state course needs.

---

## What else needs work

Honest blockers. Do not pretend these are shipped:

- **Unpublished links** — silently land on Home instead of “not published”; confuses draft shares.
- **Section links** — section links and copy-link are not built yet; gallery and story need them.
- **Draft privacy** — drafts are not private; every JSON is bundled and the repo is public.
- **Studio** — forms for only 9 of 19 blocks; template/reset can wipe the one local draft.
- **Tests** — mostly structure, not browser render.
- **Planning docs** — two roadmaps, blueprint, architecture, shipped-vs-plan overlap; some stale.

### Pressure order (not a mini-roadmap rewrite)

1. Draft privacy (public repo + bundled JSON)
2. Studio coverage / wipe risk
3. Unpublished links → Home
4. Section / copy-link
5. Browser-render tests + doc consolidation

---

## Prove with a real story

A large share of pages are about Showmob itself. [AGENTS.md](../AGENTS.md) says prove the language with real content. The story should be an actual story, not another page about how one could be written — that tells what to build next.

---

## Explicit non-goals

- Do not invent a live data source of truth yet. The site still reads repository JSON; Supabase remains foundation-only; Auth is not wired.
- Do not treat the novel-path growth sketch (`showmob-novel-path`) as the story.
- Do not expand the widget vocabulary until real content exposes a gap.
