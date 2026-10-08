# CUFF Craft — product direction and Showmob presentation plan

Date: 2026-10-08  
Status: design proposal; not an implementation or launch authorization  
Scope: solidify the CUFF idea and its Showmob demonstration before building a live social platform.

## 1. The central recommendation

CUFF should be an adult social community where people meet through small invitations, shared activities and meaningful contributions. Dating is an explicit purpose, but it is not the only reason someone belongs. An optional private, flirtier side gives the community depth without dominating its public identity. Generous members can make unusually good experiences possible without buying interpersonal access.

The defining promise is:

> Meet through what you notice, make and make possible.

The defining interaction is not “complete a task to receive a person.” It is:

> Respond to an invitation, offer an introduction, and let the other person decide.

Quests create a shared starting point. Contributions create community value. Patronage creates capacity and abundance. Consent controls access between people. These are related systems, but they must not become interchangeable currencies.

CUFF should feel like a lively club with an invitation board, not a swipe feed wearing fantasy terminology. “Craft” means people help shape the place: they can host, create, participate, teach, support or quietly fund something worth doing.

This document proposes improvements. It does not make these features shipped, approve paid intimacy, authorize real payments, or supersede Showmob's existing product priorities.

## 2. What exists, and what does not

The inspected CUFF addition is PR #128, on branch `instinct/cuff-craft-bio-quest`. The latest metadata read for this document identified head `324cec705aa7ee2b3d30189efd94152b1af2a6e2`; the branch is still open and unmerged. This is a dated baseline, not a permanent description of the branch.

The prototype has:

- A preview artifact at `/a/cuff-craft`.
- Three invented adult profiles with personal writing quests.
- A staged profile → answer → introduction review → simulated acceptance → local conversation flow.
- Tunable heuristic feedback, currently requiring 40 words and specificity signals.
- Separate in-memory progress for each profile.
- Scripted replies, reset/reload behavior and a fictional Coming Soon quest board.
- A reusable renderer-owned `bio-quest` block, typed demo sources, schema validation, gallery coverage and tests.

It does not have real accounts, real consent requests, live messaging, payments, bookings, prizes, adult media, or a functioning local community. The published PR description reports test/build and narrow-screen verification. This document does not independently reproduce those checks. A browser attempt during the preceding review was blocked by the browser client; no live visual verification was completed by this reviewer.

The existing architecture is promising because it proves an interaction rather than only describing one. The missing piece is a demonstration of the broader society: how friendship, attraction, contribution, hosting and generosity fit together.

## 3. Product constitution

These principles should guide every later decision.

1. **Participation is voluntary.** People can belong without dating, performing, spending, publishing their experiences or enabling the private layer.
2. **Effort is an invitation, not an entitlement.** Completing a quest never guarantees a reply, date, invitation or intimacy.
3. **Money buys stated services and shared capacity, not exceptions to boundaries.**
4. **Contribution is plural.** Time, creativity, practical help, hosting and money are distinct ways to help.
5. **Discretion is not deception.** The adult nature and optional private layer should be honestly explained, even when the visual tone is restrained.
6. **Trust is contextual.** Being a good host does not certify someone as a safe date. Verification is not a guarantee.
7. **The community must remain useful when romance does not happen.**
8. **Published stories require permission separate from participation.**
9. **The prototype must be honest about its limits.**
10. **Build one coherent experience before adding a platform's worth of systems.**

A successful CUFF visit can end in a good group experience, a new friend, useful help, or a respectful decline. It need not end in a match.

## 4. The three economies

| Economy | What it creates | Appropriate recognition | Forbidden conversion |
| --- | --- | --- | --- |
| Social | Introductions, chemistry, friendship, shared context | Invitations and mutually chosen relationships | A score or payment that guarantees another person's attention |
| Contribution | Useful quests, hosting, help, creative work | Specific acknowledgments and bounded roles | Moderation immunity or a universal “good person” rank |
| Patronage | More seats, better materials, accessible experiences | Optional credit for what became possible | Inbox priority, selection advantage or sexual access |

Do not collapse these into a single points balance. A wallet must not buy trust; a quest badge must not buy consent; popularity must not grant administrative authority.

“Rich people can overdo it” can be an excellent part of the product if excess becomes generosity, theatricality and craft. Someone could fund a remarkable evening, commission a local artist's quest, sponsor a venue, provide anonymous open seats or match a community pool. The experience can be extravagant while the social rules remain ordinary.

The strongest status signal is the thing that happened: “This evening had twelve sponsored seats,” not “This person spent the most.”

## 5. People are not permanent Givers and Seekers

The current role vocabulary explains the demo, but it risks making one person the prize and the other the applicant.

Treat roles as temporary:

- I can offer a quest today and answer someone else's tomorrow.
- A host can also be a participant.
- A patron can support an event without attending.
- A creator can design a quest without being its romantic destination.
- A member can prefer only group activities.

Use “Giver” and “Seeker” as playful contextual labels, not a fixed hierarchy. Ordinary controls should remain understandable: “Create an invitation,” “Offer an introduction,” “Accept,” “Decline,” “Pause introductions.”

Profiles should show enough context to choose, not require a dossier:

- A short biography and interests.
- Current intent: friends, dating, shared activities, or a combination.
- Relationship expectations where relevant and voluntarily disclosed.
- What I can contribute.
- Something I am curious about or making.
- One current invitation.
- Availability and a coarse location.
- Field-level visibility controls.

No precise home location, public contact information, spending total or public rejection history is needed. Private preferences must not leak through thumbnails, notifications, search results or analytics.

## 6. Design quests as invitations, not auditions

A good quest gives both people something to talk about. It should be small, specific, optional and reciprocal.

Suggested categories:

| Quest | Example | What it reveals |
| --- | --- | --- |
| Notice | Choose one overlooked object and explain it | Attention and curiosity |
| Imagine | Add a stop to a tiny afternoon adventure | Taste and playfulness |
| Exchange | Share three songs and one sentence about each | Personal associations |
| Make | Create a small sketch, recipe or idea | Creative process |
| Collaborate | Solve a small planning problem together | Cooperation |
| Gather | Join a hosted activity with several people | Behavior in a group |
| Contribute | Help prepare a community experience | Reliability and care |

Each quest should state purpose, expected effort, format, cost, access needs, audience, completion conditions and who can see the response. Offline quests also need a host, meeting context and a cancellation plan.

Avoid quests that demand humiliation, secrets, purchases, dangerous activities, sexual proof, unpaid commercial labor, repeated travel or escalating favors to unlock attention. Moderation should be able to remove coercive quests even if their creators call them consensual.

Start with a suggested two-to-five-minute introduction. Longer creative projects belong in a clearly labeled activity category, not as the default price of saying hello.

### Improve the writing gate

The existing heuristic is useful as a demonstration of feedback, not a measure of sincerity. A short thoughtful answer can be better than forty padded words. A fixed vocabulary can reject good answers about unfamiliar interests. AI assistance does not make a contribution fake by itself.

Recommended direction:

- Separate a minimal submission check from optional writing coaching.
- Let quest authors choose among supported response formats and reasonable effort ranges.
- Prefer feedback such as “Add the detail you want them to ask about.”
- Do not promise AI-authorship detection or truth detection.
- Let someone review and save an answer before deciding to offer it.
- Preserve work after validation failure.
- Provide an accessible alternative when a format is unsuitable.
- Allow the receiver to decide whether the introduction interests them.

If AI is used later, it may help people express themselves. It must not impersonate a member, fabricate experiences, silently send messages or decide romantic compatibility on their behalf.

## 7. Reciprocity and the introduction lifecycle

An invitation is stronger when the creator contributes too: their own answer, a short example, or an explanation of why the question matters.

Recommended lifecycle:

Draft response → reviewed response → explicitly offered introduction → pending → accepted, declined, withdrawn or expired.

Conversation opens only after recipient acceptance. Acceptance is not blanket permission for images, contact details, sexual conversation, gifts or an offline meeting.

Provide distinct controls:

- Appreciate without opening a conversation.
- Accept the introduction.
- Invite to a group activity instead.
- Decline privately.
- Pause new introductions.
- Close a conversation.
- Block or report.

A decline should not become “try harder until you win.” In a live product, revising a draft is different from repeatedly resubmitting to someone who declined. Permit another offer only when the recipient explicitly reopens that door.

Show honest capacity: “Introductions paused,” “Open to a few new conversations,” or a real host-controlled limit. Remove decorative scarcity counts. If demo capacities remain, make clear they are simulated, static and not reserved.

Change “Earn the conversation” to “Create a better introduction.” The former undermines the consent rule the rest of the prototype carefully preserves.

## 8. Community structure

The full product could have four primary destinations:

- **People:** contextual discovery and invitations.
- **Quests:** activities and opportunities to join or help.
- **Circles:** recurring small groups organized around interests.
- **Contributions:** offers, requests and experiences being made possible.

The Showmob demonstration does not need four fully built applications. It needs to show what each contributes to one story.

Circles are particularly valuable because they give people reasons to return without continuously auditioning for romance. A circle might host monthly cooking, creative walks, repair sessions or cultural evenings. Circle participation must not require dating availability.

Recognition should be specific: “Helped host two public cooking events,” not “Trust score 94.” Later acknowledgments should be grounded in actual participation, consensual to display, contestable and difficult to manufacture through reciprocal endorsements.

Never use public date ratings, attractiveness rankings, rejection counts or a hidden desirability score. Safety reporting belongs in a protected moderation process, not public gossip.

## 9. The private adult layer

Recommended working name: **After Hours**. It suggests a change in atmosphere without making an explicit-content marketplace the public identity.

Tasteful means clear, intentional and restrained. It does not mean hiding material facts from members, partners, reviewers or payment providers.

Start by defining whether After Hours means flirtier conversation, private invitations, sensual creative exchange, or explicit media. These are materially different products. Do not assume all of them are approved by this document.

A responsible first presentation should simulate boundary choices using non-explicit content. Explicit media should remain out of scope until policy, moderation, verification, security and provider review are complete.

Proposed permission ladder:

1. Confirm adult eligibility through an appropriate reviewed process.
2. Explicitly enable the optional mode.
3. Choose categories of invitations one is open to.
4. Establish a mutual connection.
5. Request the particular next permission.
6. Let the recipient accept, decline or revoke it.

Do not publicly expose who enabled After Hours. Do not automatically expose matching private preferences merely because two users appear compatible. Compatibility can make a request eligible; it cannot make access automatic.

Permissions should distinguish text topics, media, invitations and publication. They should be revocable without explanation. The product can stop future access but must not claim it can erase screenshots or material already copied by another person.

There must be no “prove you are adventurous” quest, no public escalation ladder and no reward for crossing a boundary. Adult participation must never affect ordinary community standing.

## 10. Generosity without purchase pressure

Start with event sponsorship and open seats, not person-to-person gifts.

Good patronage examples:

- Fund ingredients and a host's clearly stated work.
- Sponsor accessible transport or entry fees.
- Commission a quest from a creator through a bounded agreement.
- Cover a venue for a community event.
- Contribute to a reviewed shared project.
- Fund a more elaborate version of an experience members already want.

Use optional, factual credit: “Materials supported by…” Anonymous-to-members support must still be accountable to the platform where required.

Define beneficiary, deliverable, budget, selection process, fees, cancellation and refund treatment before collecting funds. An event host may receive payment for hosting; that is a service, not romantic compensation.

Prevent strings-attached funding. A sponsor cannot require their own invitation to be accepted or choose participants by attraction. Hosts should disclose sponsor influence and remove it from interpersonal selection. Sponsors should receive aggregate outcome reports, not attendee private data.

Add spending limits, confirmations, receipts and clear total prices. Avoid loss-driven spending prompts, surprise renewals, bidding for people, spend leaderboards and gambling-like rewards. Exact payment, tax, refund and provider requirements need qualified review before launch; no current legal or provider compatibility is asserted here.

Possible revenue is membership for clearly described community services, event administration fees, creator tools or sponsorship operations. Core boundaries, reporting, blocking and deletion must never be premium features.

## 11. Improve the Showmob presentation itself

The immediate deliverable is a convincing, honest concept presentation—not a disguised production dating service.

Use the existing CUFF artifact as the front door. Avoid a competing page with the same purpose. Add a small linked series only when the story becomes too large for one page.

Recommended presentation sequence:

1. **Promise:** one sentence explaining CUFF.
2. **Try an introduction:** the existing playable loop.
3. **Meet another way:** a short group-quest scenario.
4. **Make something possible:** a sponsorship scenario.
5. **Choose your boundaries:** a non-explicit After Hours permission scenario.
6. **See the outcome:** a shared artifact approved for publication.
7. **Know the limits:** clearly distinguish current demo from proposed product.

The reader should see one coherent evening, not a disconnected catalog of feature ideas.

Use existing blocks for orientation, comparison, permissions explanations, worked scenarios and roadmap. Use `bio-quest` for its actual staged interaction. Do not build separate live-looking widgets for every proposed system.

Make proposal labels local to each feature. A sponsorship card should say “simulation: no money collected.” A conversation should identify scripted replies at the conversation surface. State safety limits where consequential, but reduce repetitive disclaimers that bury the experience.

Use restrained warm/night styling, strong type, generous spacing and a single clear next action. A prototype can be playful without casino chrome, fake urgency, endless confetti or fantasy jargon on every button.

Fictional people should feel distinct through their specific answers and reactions. Do not replace diversity of personality with a single generic “thoughtful” voice. Synthetic or stock portraits must be properly licensed or labeled; do not imply a depicted real person is a CUFF member.

## 12. The next complete demonstration: one evening

A strong vertical slice could be “The Small Table,” a fictional six-person cooking evening.

- A host creates an invitation and contributes their own story.
- A member answers a lightweight prompt.
- Another member offers practical setup help.
- A patron funds two open seats without choosing attendees.
- The host reviews introductions and chooses participants.
- One invitation is politely declined, proving that effort and funding do not override selection.
- Participants collaborate on a dish.
- Two participants separately express interest in continuing privately.
- A boundary request is accepted or declined; neither result changes event standing.
- Participants approve a recipe/story artifact with private details omitted.

Offer short “view as participant / host / supporter” perspectives, but keep a default walkthrough so readers are not forced to manage a dashboard.

The demo must also include an ordinary unfunded quest. Otherwise CUFF may appear to require patrons to be worthwhile.

The artifact produced by the evening is an especially good Showmob connection: it preserves what people made, not their private dating history. A recipe, map, playlist or creative recap can become a reusable invitation for another group.

## 13. Architecture boundaries

CUFF is a domain demonstrated through Showmob. It is not permission to turn the Showmob renderer into an entire dating platform.

Preserve the existing split:

- Authored JSON describes content and examples.
- Trusted renderer code implements approved interactions.
- Domain sources supply typed data.
- Future server services enforce identity, authorization and operational rules.
- Publication is separate from participation and private working state.

Existing source seams—`ProfileSource`, `AnswerGrader`, `ConversationSource`, `QuestBoardSource` and `useCurrentUser()`—are sensible replacement boundaries. Future implementations will need asynchronous loading, failure, cancellation and stale-data handling; synchronous demos do not prove those properties.

Keep `bio-quest` generic. CUFF branding and story belong in authored content or a deliberately supported field. A profile set should actually select the intended data source; a schema field must not silently be ignored.

A later live model would distinguish members, profiles, quest definitions and versions, responses, introduction offers, conversations, circle memberships, event participation, sponsorships, scoped permission grants, reports and publication approvals. These are candidate domain concepts, not a migration request.

A response should remain tied to the quest version it answered. Editing a prompt after submission must not change the terms retroactively. Event cost or venue changes require renewed confirmation where material.

Real acceptance, message delivery, capacity and permission changes must be authorized on the server. Reject duplicate or replayed state-changing requests. If two people take the final place simultaneously, only one reservation may succeed.

Do not put real biographies, private media, messages or intimate preferences into the public repository or bundled artifact JSON. Unlisted, preview and hidden-in-UI do not mean private. Derive access from authenticated permissions, including on media requests, not route obscurity.

The public demo remains fictional and session-only until a separately authorized implementation meets its launch gates.

## 14. Trust, privacy and moderation

The prototype should demonstrate boundaries; a live service would have to operate them.

Required design work includes:

- Adult eligibility and identity processes that minimize retained sensitive data.
- Report, block, mute and conversation closure.
- Abuse and coercive-quest review.
- Fraud, impersonation and sponsor-conflict handling.
- Human escalation, appeal and moderator accountability.
- Media review if uploads are introduced.
- Notification previews that do not reveal intimate content.
- Search and analytics rules excluding private modes and messages.
- Coarse location, not live public tracking.
- Account deletion, export and a documented retention policy.
- Event cancellation and host escalation.
- Transparent enforcement regardless of patron spending.

Verification means a particular check was completed; it must not display as “safe person.” Check-ins are optional coordination tools, not emergency services or a guarantee of safety.

Post-event feedback should separate private experience feedback, protected safety reports and public contributions. Do not infer romantic outcomes from attendance or create a covert community-intelligence score.

Agents can help draft quests, explain policies and organize fictional scenarios. They must not silently read private conversations, infer sexual preferences, approve consent, publish private recaps or impersonate members.

## 15. Accessibility and inclusion

Effort must not mean literary fluency, expensive equipment, able-bodied travel or a particular culture's style of charm.

Support concise formats and clear instructions. Later voice/media formats require captions or textual equivalents. State offline access needs, cost and transport expectations before application.

Acceptance and failure must be understandable without color. Maintain labeled inputs, keyboard operation, visible focus, meaningful headings, live status and large touch targets. Test long names, long responses, narrow screens, zoom, reduced motion, empty data and errors.

Respect different relationship styles through explicit intent rather than assuming all members are single or seeking the same thing. Never imply that friendship-only membership is lesser.

## 16. Engineering hygiene and verification

A prior read of PR #128 showed review findings about inherited-property collisions, hard-coded branding, generated catalog formatting and block-count drift. The branch advanced after that read. Recheck the current files before treating any finding as still open.

Verification targets:

- Prototype-safe profile keys, including `constructor` and other inherited-property names.
- Profile switching preserves only the correct profile's draft and conversation.
- Invalid responses keep the user's work.
- Quest completion never skips acceptance.
- Declining is not portrayed as a failure to overcome.
- Scripted replies remain unmistakably simulated.
- Resets affect only intended demo state.
- No real payment, messaging, location or private-data collection occurs.
- Schema, widget documentation, gallery and generated catalog agree.
- Any brand field is authored or the reusable widget uses neutral copy.
- Production and author-preview catalogs retain intended lifecycle behavior.
- Keyboard, screen-reader and phone flows expose the same choices.

Run the repository's current validation/test/build commands when code or artifact JSON changes. Do not infer UI correctness from green CI. Record exact tested commit and environment. This document-only change does not claim new application test evidence.

## 17. Build sequence and exit criteria

| Phase | Scope | Exit criterion |
| --- | --- | --- |
| 0. Clarify | Adopt or revise this constitution; distinguish proposals from decisions | A reader can explain CUFF and its consent/money boundaries |
| 1. Harden introductions | Improve copy, coaching, reciprocity and edge cases in the existing loop | A short-answer retry, acceptance and decline are clear and accessible |
| 2. Demonstrate community | Add one coherent fictional group experience | People understand how joining, helping and hosting differ |
| 3. Demonstrate patronage | Simulate open-seat funding and sponsor limits | The reader sees what money buys and what it cannot buy |
| 4. Demonstrate private mode | Non-explicit scoped permission walkthrough | Mutual interest and specific permission are visibly different |
| 5. Validate demand | Small observed usability sessions with fictional data | Evidence supports or challenges the intended interaction |
| 6. Consider a live pilot | Separate security, moderation, identity and operations work | Reviewed launch gates, explicit authorization and actual staffing |

Do not interpret the table as approval to build every phase automatically. The next implementation should be a focused, reviewable increment, not a rewrite or dependency on unrelated open PRs.

A live pilot should start with one community, a few trusted hosts and bounded activities. It should not begin as a worldwide marketplace with explicit media and payments simultaneously.

## 18. What to measure

For the presentation, ask readers to do and explain:

- What is CUFF?
- Can you introduce yourself without feeling evaluated as a person?
- Does completing a quest guarantee anything?
- Can you belong without dating or paying?
- What does a patron receive?
- Who decides whether private interaction begins?
- Which parts are real and which are simulated?
- Would the experience remain worthwhile without romance?

Observe hesitation, misunderstanding and abandonment. A lower submission rate may reflect healthier boundaries rather than worse design.

For any later live pilot, use aggregated operational measures: useful introductions, recipient-controlled acceptance, completed group experiences, fulfilled contributions, accessible/open seats, cancellations, reports and resolution times. Protect sensitive data and small groups.

Do not optimize time spent, sexual escalation, rejection-driven spending or the percentage of members who enable After Hours. Revenue must not reward removing friction from coercion.

## 19. Decisions to resolve before consequential work

The following are open decisions, not assumptions:

- Is CUFF primarily a local activity community with dating, or a dating community with activities?
- What specific scope does After Hours mean?
- Can people join only for friendship and making?
- What host and creator compensation is permitted?
- Which response formats belong in the first usable version?
- What is the first pilot community and moderation capacity?
- How much public recognition should patronage receive?
- Where is the boundary between the Showmob demonstration and a separately operated CUFF service?

Recommended defaults for the presentation: community-first, explicitly dating-capable, friendship welcome, non-explicit private-mode simulation, event sponsorship rather than individual gifts, and no live data collection.

## 20. Builder handoff

For the next pass:

1. Read this document alongside the current CUFF artifact and source module.
2. Inspect the latest PR head and unresolved review threads.
3. Preserve the existing working loop.
4. Replace entitlement and fake-scarcity copy.
5. Add reciprocity and an honest response-review step using existing capabilities where possible.
6. Compose one group/community scenario from existing blocks.
7. Show one patronage decision and one private-boundary decision as labeled simulations.
8. Give the reader a clear current-versus-proposed summary.
9. Validate changed JSON, test changed behavior, inspect the actual preview and record evidence.
10. Keep publication, merging, new accounts, payments and operational services separately authorized.

Do not add every feature mentioned in this document. Do not add a new widget merely to illustrate a future possibility. Propose new capabilities only when a real demonstrated need cannot be expressed cleanly in the existing vocabulary.

### Final direction

CUFF becomes distinctive when people can reveal personality through attention, build connection through shared action, and contribute to a world worth returning to. Its tasteful adult layer should be opt-in and permissioned. Its wealthy members should be able to make beautiful things happen without changing anybody else's rights.

Showmob should make that idea understandable by letting a reader experience one small, coherent version of it—not by presenting a large list of promises as if a community already exists.
