# Parallelization Patterns for Agents

## When to Parallelize

An agent should spawn parallel sub-agents when:
1. It performs 2+ independent tasks that don't depend on each other's results
2. Each task takes significant time (API calls, searches, etc.)
3. Results are aggregated at the end

## Anti-Pattern: Sequential Independent Tasks

```markdown
## BAD: Sequential execution of independent tasks
1. First, check service A health
2. Then, check service B status
3. Finally, find related PRs
4. Aggregate results
```

## Pattern: Parallel Sub-Agent Orchestration

```markdown
## GOOD: Parallel execution using Task tool

### Step 1: Launch Parallel Checks

Use the Task tool to spawn these checks IN PARALLEL (single message, multiple tool calls):

1. **Service A Health Check** (subagent_type: general-purpose)
   - Check service health
   - Return health summary

2. **Service B Status Check** (subagent_type: general-purpose)
   - Check service status
   - Return status summary

3. **PR Finder** (subagent_type: general-purpose)
   - Find related PRs
   - Return PR list with status

### Step 2: Aggregate Results

After all parallel tasks complete, aggregate results into final report.
```

## Implementation Template

```markdown
## Parallel Execution Strategy

When validating deployment readiness, spawn these checks in parallel using the Task tool:

**IMPORTANT: Launch all tasks in a SINGLE message with multiple Task tool calls.**

### Task 1: Health Check
```
Task tool call:
- subagent_type: general-purpose
- description: Check service health
- prompt: |
    Check service health for [environment].
    Return: Total services, healthy count, unhealthy services with details.
```

### Task 2: Test Status
```
Task tool call:
- subagent_type: general-purpose
- description: Check test status
- prompt: |
    Check latest test runs for [environment].
    Return: Test status (pass/fail), run ID, timestamp, failed tests if any.
```

### Task 3: Find PRs
```
Task tool call:
- subagent_type: general-purpose
- description: Find related PRs
- prompt: |
    Find PRs for [context].
    Return: PR numbers, URLs, check status, mergeable state.
```

### Aggregation

After parallel tasks complete, combine results into final report.
```

## Refactoring Example

### Before (Sequential)
```markdown
## Validation Steps
1. Check health
2. Check tests
3. Find PRs
4. Generate report
```

### After (Parallel)
```markdown
## Validation Strategy

### Phase 1: Parallel Data Collection
Launch these Task tool calls in a SINGLE message:

1. Task: Health check (general-purpose agent)
2. Task: Test status check (general-purpose agent)
3. Task: PR finder (general-purpose agent)

### Phase 2: Report Generation
Aggregate results from all tasks into final validation report.
```

## Key Rules

1. **Single message**: All parallel Task calls must be in ONE message
2. **No dependencies**: Only parallelize truly independent tasks
3. **Clear prompts**: Each sub-agent needs complete context
4. **Aggregation step**: Always plan how to combine results
