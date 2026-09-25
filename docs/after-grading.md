# After Grading — Content Feels Explanatory, Not Teaching

Parked 2026-09-24. Pick this up once the grading pass is done.

## The problem

Pages read like an AI explaining a thing conversationally. They don't *teach*. There's no build-up, no sense of being walked from not-knowing to knowing. Something fundamental is missing from the generation mechanism, and grading alone probably won't surface it — grading scores what was made, it doesn't invent the mechanism that should have made it differently.

## Evidence

- **Security page.** Actually one of the better ones: it drew its own graphics when nothing else did. But the topic is deep enough that it should have been ~10 pages. It compressed a course into one page.
- **"How it works" section (site).** Fine, but should be vastly deeper — it's the most important teaching page and it reads like a summary.
- **Allegory widget/content.** Needs many more examples. One allegory doesn't teach; several from different angles does.
- **Graphics are rare.** Most pages that could have had visuals didn't.
- **Business-plan output (Chainmail outline).** The plan itself was good, but it *explains* the idea rather than teaching someone how it works.

## Hypotheses

1. **Gradient = storytelling.** The gradient work is the same function as telling a story: sequencing ideas so each one sets up the next. The teaching feel likely lives here, not in the rubric.
2. **Missing scope decision.** Nothing decides "this topic is 10 pages, not 1." Depth of topic should drive page count / class structure.
3. **Missing widgets.** Especially things that *point* at stuff: callouts, annotated diagrams, and an infographic widget (a gallery/collection of infographics). Check for existing plugins/libraries before building.
4. **No decision layer.** Right now it's generate → publish ("blam"). Should be:
   1. **Generate** candidate content, examples, visuals
   2. **Reason** over what was generated
   3. **Sort** it — order, group, rank, cut
   4. **Infer** from the sorted set: what's missing, what should become its own page, what needs a visual, what the next step in the story is

## How grading can still feed this

The rubric's "what should have existed that didn't" answers, plus the "wrong choice vs. missing primitive" flag on representation failures, are raw input for hypotheses 2–4. Grade with this file in mind and tag failures that are really "didn't teach."

## Open questions

- [ ] Is "teachy" a gradient problem, a decision-layer problem, or both?
- [ ] What does a multi-page "class" look like in the JSON/page model?
- [ ] Infographic widget: build our own or wrap an existing plugin?
- [ ] Should the decision layer run per page, or per topic before pages exist?
