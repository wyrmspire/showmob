# Showmob blueprint

## Product statement

Showmob is a persistent, agent-authored, human-interactive knowledge and presentation environment.

Its primitives are:

- Artifacts
- Widgets
- Themes
- Collections
- Interactions

Its initial authoring language is JSON. Its initial persistence layer is GitHub. A future runtime can use a database without changing the renderer's basic content boundary.

The defining interaction is:

> Talk about something -> turn it into something useful -> interact with it -> preserve what was learned -> improve it later.

## 1. Core experience

A normal conversation reaches an idea that would be clearer as a visual, durable experience. The agent creates a Showmob artifact and returns a link. That artifact might be an explanation, course, worksheet, diagram, technical history, research brief, presentation, quiz, decision aid, project memory, or a combination of these.

The agent does not program a new website for each result. It speaks Showmob's content language.

## 2. Foundational architecture

The full loop runs from conversation through agent-authored content and rendering to human interaction, then sends useful results and feedback back to the agent.

The present path is JSON in GitHub. A later path can use a Showmob API and database. The renderer stays independent of persistence.

## 3. JSON as the language

An artifact carries identity, lifecycle, theme, modes, navigation, sections, widgets, interactions, and optional result behavior. It contains content and configuration, not application code.

Agents compose widgets. The application owns their implementation.

## 4. Widgets as vocabulary

A relatively small widget library should cover narrative, structured information, time, evidence, media, learning, reasoning, interaction, visualization, feedback, and approved tools.

Trusted tool widgets are important. They let an artifact configure a calculator, simulator, chart, or other capability without granting content authors the ability to ship arbitrary code.

## 5. Themes as a separate language

Artifacts choose semantic themes. Themes define shared tokens for color, type, spacing, shape, and motion. The same content can take on a different visual purpose without being rewritten.

## 6. Composition patterns

Experiences such as lessons, field guides, troubleshooting guides, references, briefs, worksheets, presentations, memories, and labs should be recipes over one widget system, not separate applications.

## 7. Multi-page experiences

Showmob needs both individual artifacts and ordered collections. Collections allow real courses and other long-form experiences while giving the home surface meaningful groups to organize.

## 8. Read and Present

Read and Present are views over one content tree. Read favors study and revisiting; Present favors one conceptual unit at a time. Future views should reuse the same authored knowledge.

## 9. Knowledge surface

The home screen can become a record of useful work created by people and agents: recent discussions, courses, explanations, projects, worksheets, presentations, references, saved memories, research, work in progress, and items needing feedback.

Chat is transient. Showmob is the durable expression of what came out of chat.

## 10. Search and discovery

As the library grows, metadata and search should support title, summary, author or agent, creation and update times, tags, subject, kind, collection, difficulty, duration, publication state, relationships, and sources.

Agents should be able to find and update existing artifacts instead of recreating the same knowledge.

## 11. Feedback loop

Lightweight responses can capture whether an artifact was useful, unclear, too basic, too advanced, in need of an example, wrong, outdated, or worth saving. Learning artifacts can later capture answers, completion, confidence, time, missed concepts, and follow-up questions.

That feedback lets an agent improve an artifact or create a focused follow-up.

## 12. Comments and collaboration

Authentication can later support comments, annotations, suggestions, questions, and revisions from people and agents. Identity and permissions should serve a proven content system rather than dominate early development.

## 13. GitHub first

GitHub is a useful first content database. Agents can read, create, modify, preview, commit, and roll back artifacts while Git provides history. Repository rules can establish safe behavior before a runtime permissions system exists.

## 14. Database later

A future database can store artifacts, collections, blocks, users, agents, interactions, responses, feedback, comments, sessions, and revisions. The renderer continues to consume the same explicit content contract.

## 15. Layered permissions

Authority should be separated by responsibility:

- **Content author:** create and modify artifacts
- **Publisher:** move artifacts from preview to published
- **Curator:** organize collections, tags, and relationships
- **Tool developer:** create or modify widgets
- **Application developer:** modify Showmob itself

Generating a lesson is not permission to rewrite the application.

## 16. Content and capability boundaries

Artifacts can be cheap to create at scale. Executable widgets, connectors, integrations, and runners require deliberate review because they expand the application's capabilities.

## 17. Self-documentation

Showmob should explain itself through Showmob artifacts: product concepts, schema, widgets, themes, contribution rules, publication, architecture, roadmap, and examples. This is both useful documentation and a regression environment for the product.

## 18. Group presentation

A later shared surface could let a participant or agent open an artifact, move to a section, compare it with another artifact, or create a new comparison during a conversation. The shared surface remains structured and semantically understandable.

## 19. Sessions as data

A future session can record participants, active artifact, active section, presenter, notes, questions, and generated artifacts. This supports lessons, reviews, onboarding, design meetings, and workshops without requiring the current kernel to implement them now.

## 20. A boring schema

Keep the contract versioned, explicit, and inspectable. The agent supplies intelligence when it authors content; the renderer supplies intelligence when it presents content. The schema should remain a dependable interchange format.

## Current kernel

The repository already contains the beginnings of this direction:

- an explicit schema
- reusable renderer-owned blocks
- semantic themes
- Browse and Present views over one content tree
- lifecycle states
- search and tag discovery
- ordered series
- JSON content files
- a browser-local studio with import and export
- a legacy fixture

The next phase is not a rewrite. It is to make this kernel expressive enough for real use.
