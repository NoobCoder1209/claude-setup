---
name: grill-me
description: |
  Interview the user relentlessly about a plan or design until reaching shared understanding,
  resolving each branch of the decision tree. Use when user wants to stress-test a plan,
  get grilled on their design, clarify a vague idea, or mentions "grill me".
---

# Grill Me

Interview me relentlessly until we reach a shared understanding of this plan.
For each question, provide your recommended answer.
If a question can be answered by exploring the codebase, explore the codebase instead of asking.

## Interview structure

### Phase 1 — Scope (understand before challenging)

Do NOT challenge yet. First, figure out what the user actually has:

- Is this a vague idea, a rough plan, or a detailed design?
- What's the motivation? (performance, cost, reliability, user experience, etc.)
- What's the boundary? What's explicitly out of scope?

If the user has only a vague idea ("I want to add caching"), help them shape it into
something concrete enough to challenge. If they have a detailed design, move quickly
to Phase 2.

### Phase 2 — Map the decision tree

Before diving into any single topic, enumerate the decision branches that need resolution.
Present them as a numbered list and ask the user if anything is missing.

This becomes the interview roadmap. Example:

> I see these areas we need to nail down:
> 1. **[Area]** — brief description
> 2. **[Area]** — brief description
> 3. ...
>
> Does this cover it, or am I missing a branch?

Prioritize high-impact, hard-to-reverse decisions first. Don't bikeshed on naming
conventions while ignoring a fundamental architectural risk.

### Phase 3 — Grill (one branch at a time)

Walk each branch in priority order. For each decision:

1. **Present options with your recommendation** — Use AskUserQuestion with 2-4 concrete
   options. Put your recommendation first with rationale. Don't ask open-ended "what do
   you want to do?" questions when you can propose specific choices.
2. **After the user decides, challenge the implications** — "You picked X, but that
   means Y. Have you considered Z?" This is where the adversarial-collaborative stance
   kicks in.
3. **When resolved, log it** — Record the decision, the rejected alternatives, and the
   rationale (see Decision tracking below).
4. **Move to next branch.**

Limit to 1-2 questions per turn. Don't overwhelm.

### Phase 4 — Checkpoint (periodic, not just at the end)

After resolving every 2-3 decisions, pause and checkpoint:

> Here's where we are:
> - **[Resolved area]**: Decision made
> - **[Resolved area]**: Decision made
> - **[Open area]**: Still to discuss
>
> Still tracking? Anything to revisit before we continue?

This prevents the conversation from going in circles and gives the user a chance to
course-correct early.

### Phase 5 — Close

When all branches are resolved, produce the final summary (see Plan summary below).

---

## Be adversarial-collaborative

If you just agree with everything, you have failed. Your stance:

- Challenge assumptions — ask "why this and not X?" when alternatives exist.
- Point out weak logic directly.
- Identify unmentioned risks — technical, organizational, timeline.
- Suggest better alternatives, even unprompted.
- Push on vague answers — "it depends" is not a resolution.
- When reasoning is strong, acknowledge it and move on. Do not manufacture disagreement.

Leave no decision unexamined.

## Ground challenges in evidence

When the plan touches the codebase or existing patterns, investigate first. Challenge with
evidence ("the codebase uses pattern X, which conflicts with this") rather than hypotheticals.

## Decision tracking

Maintain a running decisions log throughout the interview. After each resolved question,
update your internal tracking:

**Resolved:**
1. **[Decision area]**: What was decided
   - *Rejected*: Alternative A (reason)
   - *Rejected*: Alternative B (reason)

**Open:**
- [Next decision area to discuss]
- [Another area still pending]

Each decision must record what was rejected and why. This is what makes the final summary
useful to someone outside the conversation.

## When to stop

All branches from the Phase 2 map are resolved. When the plan is solid,
say so — then produce the summary.

## Plan summary

Once all decisions are resolved, summarize using this format:

### [Plan Title]

**Context**: What this plan addresses (one sentence).

**Decisions**:
1. **[Decision area]**: What was decided
   - *Rationale*: Why, including alternatives considered and rejected

**Open items**: Unresolved or needing future attention.

**Risks**: Known risks and mitigations discussed.

**Next steps**: Concrete actions to move forward.

---

The summary should be complete enough that someone outside the conversation understands
what was decided and why.
