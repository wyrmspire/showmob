# Showmob development batch: reader, Studio, and visual-system hardening

Status: accepted implementation scope. Added 2026-09-23.
Synced to `main` at `54415cd` (PR #28) plus follow-up home polish on `chore/ux-batch-doc-and-home`.

This is one development batch, not a queue of tiny pull requests. Keep the work on one branch, make useful local checkpoints, and run the full review/CI/deployment cycle when the combined experience is ready.

## Shipped on main

PR #28 (`54415cd`) landed the core reader/Studio packet: native artifact links, section jump + copy-link, focus-mode Esc/`.zen-exit`, reading-time toolbar meta, slideshow keyboard/swipe/fullscreen, exercise feedback fields, Georgia headings, themed Studio mini-shell, Studio undo + page settings + export validation, and reader-first Home discovery (search before shelves, series dedupe, frequency-sorted tags, `authorToolsEnabled` Studio gating).

Home follow-up on this branch softens the public lead copy and caps the tagbar.

## What is already solid

Showmob starts from a sound accessibility foundation: semantic HTML, `aria-pressed` where appropriate, 44px interaction targets, and reduced-motion support. Preserve those qualities while completing the behaviors below.

## 1. Fix the concrete bugs first

- [x] **Make focus mode escapable.** `.is-zen .toolbar` currently moves the toolbar—and its “Show controls” button—off-screen. Support `Escape` at minimum; a deliberate reveal behavior may supplement it.
  - Shipped: `Escape` listener + fixed `.zen-exit` control in `ArtifactView.tsx` (PR #28).
- [x] **Theme the Studio block preview.** Apply `theme-${draft.theme}` to `.live .mini-shell`, as Full preview does, so `--accent`, `--surface`, and `--text` exist. Give `.studio-truth` valid `--line` and `--ink` tokens too.
  - Shipped: `mini-shell artifact theme-${draft.theme}`; `.studio-truth` now uses `--ds-hairline` / `--ds-ink` (PR #28).
- [x] **Use a deterministic heading font.** The declared “Aime” face is never loaded. Self-host an approved display serif or use the existing Georgia-based stack consistently.
  - Shipped: Georgia / Times New Roman stack across reader + Studio headings (PR #28).
- [x] **Repair wrapped diagram arrows.** Do not absolutely position an arrow past the edge of a wrapped grid row.
  - Shipped by removal: absolute `→`/`↓` pseudo-arrows dropped; diagrams use top accent borders instead (PR #28). Flow-aware arrows were not reintroduced.

## 2. Make idea pages behave like links

- [x] Render cards and series parts as real `<a href="/a/{slug}">` links (legacy `?artifact=` still resolves). Intercept only an unmodified primary click for client-side navigation so open-in-new-tab, copy-link, and standard browser behavior remain available.
  - Shipped: `ArtifactLink` with meta/ctrl/shift/alt passthrough (PR #28); href shape `/a/{slug}` with OG share pages.
- [x] Preserve `#block-id` through initial load, in-app navigation, reload, and Back/Forward.
  - Shipped: `focusHashTarget` + `hashchange` handling in `ArtifactView.tsx` (PR #28).
- [x] Add section copy-link controls and a compact jump menu derived from meaningful block IDs.
  - Shipped: per-block “Copy link” + Sections `<details>` menu (PR #28).
- [x] Replace toolbar text such as “14 sections · published” with reader-facing information such as reading time and section navigation.
  - Shipped: `{n} min read` (+ series part index when applicable) and Sections menu (PR #28).
- [x] Set `document.title` per artifact. Treat crawler-visible per-artifact Open Graph metadata as a delivery task, not merely a client-side title change.
  - Done: client title + DOM meta upsert in `ArtifactView` / `share-meta.ts`; crawler OG/Twitter via build-time `dist/a/{slug}/index.html` (`scripts/generate-share-pages.mjs`). Theme-colored OG images still open (follow-up).

## 3. Deliver the slideshow promise

- [x] Add focused Left/Right keyboard navigation.
  - Shipped: `ArrowLeft` / `ArrowRight` in `BlockView` slideshow (PR #28).
- [x] Add deliberate mobile swipe behavior without interfering with normal vertical scrolling or text inputs.
  - Shipped: pointer swipe + `touch-action: pan-y` (PR #28).
- [x] Keep usable mobile slide controls; do not hide the only navigation affordance.
  - Shipped: Prev/Next and slide-dot pills remain usable under `max-width: 780px`; dots wrap to a centered, horizontally scrollable second row while swipe/keyboard/fullscreen continue to work.
- [x] Add fullscreen presentation and a clear exit path.
  - Shipped: `requestFullscreen` + “Exit fullscreen” (PR #28).

## 4. Improve reusable content behavior

- [x] Make exercise feedback authorable with optional `correctFeedback` and `wrongFeedback`; provide neutral defaults.
  - Shipped: schema + renderer fallbacks `"Correct"` / `"Not quite"` (PR #28).
- [x] Ensure long hero titles balance and wrap without the current narrow `10ch`/large-type crushing.
  - Shipped: `max-width: 14ch`, `text-wrap: balance`, `overflow-wrap: anywhere` (PR #28).
- [x] Make block entrance motion consistent: apply the same restrained behavior to the whole block vocabulary or remove the partial effect.
  - Shipped: all five themes share the same restrained entrance tokens (420ms / 14px fade-up); reduced-motion unchanged.

## 5. Separate the reader home from builder tooling

- [x] Move renderer/widget vocabulary, Studio promotion, lifecycle implementation detail, and similar builder language into Studio or an About/How it works surface.
  - Shipped on this branch: public lead is reader-facing (“Read a page. Follow a series. Present a block.”); Studio card + builder notes remain behind `authorToolsEnabled`. A dedicated About page is still optional later.
- [x] Put search before the library shelves and make one result model filter the entire visible library.
  - Shipped: discovery before `seriesList`; `visibleSlugs` filters shelves and standalone grid together (PR #28).
- [x] Prevent series artifacts from appearing twice unless the duplicate presentation is intentionally useful.
  - Shipped: `standalone = visible.filter(entry => !entry.series)` (PR #28).
- [x] Make whole cards clickable while retaining valid nested-link semantics.
  - Shipped: whole-card `ArtifactLink` anchors (PR #28).
- [x] Order tags by useful frequency and keep the filter surface from becoming a wall of pills.
  - Shipped: frequency sort (PR #28) + top-10 tagbar with “More tags” expand (this branch).

## 6. Make Studio safe enough for real work

- [x] Protect pattern replacement and block removal with confirmation or one-step undo.
  - Shipped: one-step undo for remove / pattern change / reset / import (PR #28).
- [x] Add a Page item/settings surface for title, summary, theme, slug, tags, contributor, and series metadata.
  - Shipped: Page settings `<details>` in Studio outline (PR #28).
- [x] Export with a meaningful slug-based filename instead of always `local-draft.json`.
  - Shipped: `${draft.slug || "showmob-draft"}.json` (PR #28).
- [x] Add a generic list editor that can support checklist, timeline, comparison, and resource-list blocks without four unrelated editors.
  - Shipped: shared `StructuredListEditor` + `studio-list-editor` config for checklist, timeline, comparison, and resource-list (PR #32).
- [x] Validate before export and show useful field-level errors while preserving the last valid draft.
  - Shipped: “Export blocked …” + import leaves current draft intact (PR #28).
- [x] Keep unavailable storage, corrupted drafts, failed saves, and invalid imports recoverable and clearly explained.
  - Shipped: storage-unavailable notices, `restoreDraft`, invalid-import messaging (PR #28).

## 7. Unify the visual system

- [x] Reconcile Home/Studio `--ds-*` variables and hardcoded colors with the artifact theme tokens.
  - Shipped: `:root` semantic spine (`--text`/`--muted`/`--page`/`--canvas`/`--surface`/`--accent`/`--accent-soft`/`--hairline`) with `--ds-*` aliases; `.theme-*` still owns reading-surface overrides.
- [x] Remove avoidable hardcoded values such as `#635d59` and `#146a5b` when a semantic token expresses the role.
  - Shipped: Home/Studio chrome rules consume tokens; those hex values remain only on the `:root` spine (theme presets keep their own accents).
- [x] Keep the unified token model compatible with a future `prefers-color-scheme` treatment without forcing dark mode into this batch.
  - Shipped: remappable root semantics only; no dark-mode switch; hub stays warm/paper-like; reduced-motion already respected.

## Acceptance walkthrough

The batch is complete when one reviewer can:

1. Open a card normally, Cmd/Ctrl-click it into a new tab, and copy its native link.
2. Open a copied section URL in a fresh browser, land on the correct block with meaningful focus, and navigate Back/Forward without losing the section.
3. Enter and exit focus mode using the pointer and keyboard.
4. Present a slideshow with buttons, arrow keys, mobile swipe, fullscreen, and a reliable exit.
5. Create or import a Studio draft, edit page metadata and list-based blocks, preview it in the selected theme, remove and undo a block, validate, export, reload, and recover it.
6. Use Home search to filter the entire library without duplicated results or builder-only clutter.
7. Read representative long-title, diagram, exercise, table, and slideshow pages on phone and desktop with no critical layout or accessibility regression.

## Deliberately outside this batch

- Supabase Auth, multi-user permissions, uploads, and runtime source-of-truth switching.
- A general CMS or autonomous publishing agent.
- New widgets that are not required to close a demonstrated acceptance gap above.
- A full dark-mode design.
