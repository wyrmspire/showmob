# Showmob development batch: reader, Studio, and visual-system hardening

Status: accepted implementation scope. Added 2026-09-23.

This is one development batch, not a queue of tiny pull requests. Keep the work on one branch, make useful local checkpoints, and run the full review/CI/deployment cycle when the combined experience is ready.

## What is already solid

Showmob starts from a sound accessibility foundation: semantic HTML, `aria-pressed` where appropriate, 44px interaction targets, and reduced-motion support. Preserve those qualities while completing the behaviors below.

## 1. Fix the concrete bugs first

- [ ] **Make focus mode escapable.** `.is-zen .toolbar` currently moves the toolbar—and its “Show controls” button—off-screen. Support `Escape` at minimum; a deliberate reveal behavior may supplement it.
- [ ] **Theme the Studio block preview.** Apply `theme-${draft.theme}` to `.live .mini-shell`, as Full preview does, so `--accent`, `--surface`, and `--text` exist. Give `.studio-truth` valid `--line` and `--ink` tokens too.
- [ ] **Use a deterministic heading font.** The declared “Aime” face is never loaded. Self-host an approved display serif or use the existing Georgia-based stack consistently.
- [ ] **Repair wrapped diagram arrows.** Do not absolutely position an arrow past the edge of a wrapped grid row.

## 2. Make idea pages behave like links

- [ ] Render cards and series parts as real `<a href="?artifact=slug">` links. Intercept only an unmodified primary click for client-side navigation so open-in-new-tab, copy-link, and standard browser behavior remain available.
- [ ] Preserve `#block-id` through initial load, in-app navigation, reload, and Back/Forward.
- [ ] Add section copy-link controls and a compact jump menu derived from meaningful block IDs.
- [ ] Replace toolbar text such as “14 sections · published” with reader-facing information such as reading time and section navigation.
- [ ] Set `document.title` per artifact. Treat crawler-visible per-artifact Open Graph metadata as a delivery task, not merely a client-side title change.

## 3. Deliver the slideshow promise

- [ ] Add focused Left/Right keyboard navigation.
- [ ] Add deliberate mobile swipe behavior without interfering with normal vertical scrolling or text inputs.
- [ ] Keep usable mobile slide controls; do not hide the only navigation affordance.
- [ ] Add fullscreen presentation and a clear exit path.

## 4. Improve reusable content behavior

- [ ] Make exercise feedback authorable with optional `correctFeedback` and `wrongFeedback`; provide neutral defaults.
- [ ] Ensure long hero titles balance and wrap without the current narrow `10ch`/large-type crushing.
- [ ] Make block entrance motion consistent: apply the same restrained behavior to the whole block vocabulary or remove the partial effect.

## 5. Separate the reader home from builder tooling

- [ ] Move renderer/widget vocabulary, Studio promotion, lifecycle implementation detail, and similar builder language into Studio or an About/How it works surface.
- [ ] Put search before the library shelves and make one result model filter the entire visible library.
- [ ] Prevent series artifacts from appearing twice unless the duplicate presentation is intentionally useful.
- [ ] Make whole cards clickable while retaining valid nested-link semantics.
- [ ] Order tags by useful frequency and keep the filter surface from becoming a wall of pills.

## 6. Make Studio safe enough for real work

- [ ] Protect pattern replacement and block removal with confirmation or one-step undo.
- [ ] Add a Page item/settings surface for title, summary, theme, slug, tags, contributor, and series metadata.
- [ ] Export with a meaningful slug-based filename instead of always `local-draft.json`.
- [ ] Add a generic list editor that can support checklist, timeline, comparison, and resource-list blocks without four unrelated editors.
- [ ] Validate before export and show useful field-level errors while preserving the last valid draft.
- [ ] Keep unavailable storage, corrupted drafts, failed saves, and invalid imports recoverable and clearly explained.

## 7. Unify the visual system

- [ ] Reconcile Home/Studio `--ds-*` variables and hardcoded colors with the artifact theme tokens.
- [ ] Remove avoidable hardcoded values such as `#635d59` and `#146a5b` when a semantic token expresses the role.
- [ ] Keep the unified token model compatible with a future `prefers-color-scheme` treatment without forcing dark mode into this batch.

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

