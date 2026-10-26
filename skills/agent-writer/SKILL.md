---
name: agent-writer
description: |
  Create and optimize Claude Code agents (.claude/agents/*.md files).
  Use when: (1) Creating new agents, (2) Modifying existing agents,
  (3) Reviewing agent design, (4) Optimizing agent performance.
  Triggers: editing .claude/agents/, questions about agent design,
  requests to create/improve agents.
---

# Agent Writer

## Agent File Structure

Agents are defined in `.claude/agents/*.md` files:

```markdown
---
name: agent-name
description: Brief description including when to use this agent.
tools: Tool1, Tool2, Tool3
model: sonnet|opus|haiku
color: blue|green|cyan|magenta|yellow|red
---

Agent instructions here...
```

## Creation Checklist

When creating or modifying an agent:

- [ ] **Clear purpose**: Description explains when to use the agent
- [ ] **Appropriate tools**: Only include tools the agent needs
- [ ] **Right model**: haiku (simple), sonnet (most), opus (critical)
- [ ] **Parallelization**: Independent tasks run in parallel (see references/parallelization.md)
- [ ] **Error handling**: Instructions for handling failures
- [ ] **Output format**: Clear structure for results

## Model Selection

| Model | Use For |
|-------|---------|
| haiku | Quick, simple tasks (searches, simple transforms) |
| sonnet | Most agents - good balance of capability and speed |
| opus | Critical decisions, complex analysis |

## Tool Selection

Only include tools the agent actually needs:

- **Read-only**: Read, Grep, Glob, Bash (limited)
- **Code modification**: Read, Write, Edit, Grep, Glob, Bash
- **Kubernetes**: mcp__kubernetes-* tools
- **GitHub**: Bash (gh CLI)

## DRY Principle (CRITICAL)

**Check for existing content before writing new agent instructions.**

1. Search for similar patterns in existing agents:
   ```bash
   grep -r "pattern" .claude/agents/
   ```

2. If similar content exists, consider:
   - Can this agent extend/reference the existing one?
   - Should shared content be extracted to a common reference?
   - Is a new agent even needed, or can an existing one be modified?

## Parallelization

**ALWAYS look for opportunities to parallelize independent tasks.**

For detailed parallelization patterns and examples, see [references/parallelization.md](references/parallelization.md).

Quick check: If an agent performs 2+ independent tasks, they should run in parallel using the Task tool with multiple calls in a single message.

## Optimization Checklist

When reviewing existing agents, look for:

1. **Sequential independent tasks** → Convert to parallel
2. **Overly broad tool access** → Restrict to needed tools
3. **Missing error handling** → Add failure instructions
4. **Unclear descriptions** → Improve discoverability
5. **Wrong model choice** → Adjust based on complexity
6. **Duplicate content** → Extract to shared references
