# Showmob roadmap

## Direction

The near-term goal is to prove the language by carrying one real artifact through the existing pipeline. The project should grow from use, not from a speculative rewrite.

Sections 1-5 of the [blueprint](./blueprint.md) define the shape to protect: the core experience, persistence-independent architecture, explicit JSON language, trusted widget vocabulary, and semantic theme boundary.

The later blueprint ideas are direction, not promises or immediate scope.

## Next phase: one real artifact

Take one useful subject from idea to durable artifact:

1. Choose a bounded real topic.
2. Compose it as `schemaVersion: 1` JSON using existing blocks.
3. Validate it against `app/src/schema.ts`.
4. Render it through the current `App.tsx` pipeline.
5. Test Browse and Present views.
6. Check the result on a narrow screen and with keyboard navigation.
7. Record where the vocabulary was expressive and where it forced awkward content.
8. Improve the smallest contract or renderer boundary that blocked the artifact.
9. Preserve the artifact as both useful content and a regression fixture.

Success is not a larger schema. Success is a real artifact that is useful, portable, readable, presentable, and honest about its sources and limits.

## Near term

### Tighten the existing contract through use

- Add examples and validation guidance for every current block.
- Decide which current fields are required by the renderer versus editorial convention.
- Improve import validation without making the schema clever.
- Preserve compatibility with the legacy fixture or document an explicit migration.
- Add only the metadata needed by real discovery and lifecycle needs.

### Exercise the widget vocabulary

- Identify gaps from real artifacts rather than filling a speculative catalog.
- Favor a small number of flexible, accessible widgets.
- Keep tool-bearing widgets out of ordinary content changes.
- Document each widget's purpose, data shape, empty states, and accessibility behavior.

### Keep themes semantic

- Make every current widget honor the same tokens.
- Test all five themes against representative content.
- Prevent artifact JSON from accumulating raw presentation values.

### Make repository authoring dependable

- Add a repeatable validation and preview path when the standalone toolchain is introduced.
- Keep content changes reviewable as plain JSON diffs.
- Document preview, publication, rollback, and archiving behavior.
- Keep the hosted-app boundary explicit until a package manifest and build configuration are added deliberately.

## Future direction

### Knowledge surface and discovery

Grow the home screen from a gallery into a useful library of artifacts and collections. Expand metadata and relationships only as needed for search, reuse, and updates. Make it possible for agents to find existing work before creating duplicates.

### Feedback and learning loops

Add lightweight reactions and clarification prompts before complex analytics. Later, support structured learning results such as answers, completion, confidence, missed concepts, and follow-up questions. Return useful signals to the authoring agent while respecting privacy and permissions.

### Collaboration

Introduce identity, comments, annotations, suggestions, and revision workflows after the content model has earned the complexity. Do not let authentication redesign the product before the artifact language is proven.

### Persistence beyond GitHub

When repository-backed content becomes a runtime constraint, add an API and database for artifacts, collections, blocks, interactions, responses, feedback, comments, sessions, and revisions. Preserve import and export through the same explicit JSON contract. Keep GitHub as the source for code, schemas, canonical widgets, themes, and portable exports.

### Layered agent permissions

Separate content authoring, publication, curation, widget development, and application development. Start with repository rules and reviews; later enforce the same boundaries in the API and data model.

### Capability layer

Treat calculators, simulators, code runners, connectors, and external API widgets as reviewed application capabilities. Artifacts may configure approved capabilities but must not smuggle executable behavior into content.

### Self-documentation

Publish Showmob's own schema, widgets, themes, examples, architecture, contribution rules, and roadmap as Showmob artifacts. Use them as product documentation and regression coverage.

### Shared presentation and sessions

Explore agent-controlled group presentation only after single-user Browse and Present flows are solid. A later session model can record participants, active artifact and section, presenter, notes, questions, and generated artifacts for lessons, reviews, onboarding, and workshops.

## Guardrails

- Do not rewrite the kernel before real use exposes a need.
- Do not make every composition pattern a separate renderer.
- Do not mix raw visual styling into artifacts.
- Do not grant content authors application-level authority.
- Do not let future database design leak into the renderer contract.
- Do not turn the schema into an implicit programming language.
- Do not add product claims that the current source cannot support.
