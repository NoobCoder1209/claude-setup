# Go Development Patterns Skill - Evaluation Guide

This document explains the skillgrade evaluation framework for the golang skill.

## Overview

The golang skill evaluation uses a hybrid grading approach:

- **70% Deterministic Grading**: Automated validation of Go idioms and patterns
- **30% LLM Rubric Grading**: Qualitative assessment of code quality and pattern compliance

## Evaluation Tasks

### Task 1: Error Handling (33% weight)

**Objective**: Implement a configuration loader demonstrating idiomatic Go error handling.

**Key Requirements**:

- Define custom error types (`ValidationError`)
- Use sentinel errors for common cases
- Wrap errors with context using `fmt.Errorf` with `%w`
- Accept `io.Reader` interface (not concrete types)
- Return concrete `*Config` struct (not interfaces)
- Never ignore errors with blank identifier
- Return early on error conditions

**Reference Solution**: `solutions/task1-config-loader-solution.go`

**Validation Checks**:

1. ✅ File exists (`config_loader.go`)
2. ✅ Defines `ValidationError` custom error type
3. ✅ Implements `Error()` method on `ValidationError`
4. ✅ Defines sentinel errors (`ErrInvalidFormat`, `ErrMissingField`)
5. ✅ Uses `fmt.Errorf` with `%w` for error wrapping
6. ✅ Accepts `io.Reader` interface parameter
7. ✅ Returns concrete `*Config` struct
8. ✅ No ignored errors (no blank identifier for errors)

---

### Task 2: Concurrency Patterns (33% weight)

**Objective**: Implement a worker pool demonstrating idiomatic Go concurrency.

**Key Requirements**:

- Use `context.Context` as first parameter
- Implement worker pool with goroutines
- Use `sync.WaitGroup` for coordination
- Use channels for communication
- Close channels properly (sender closes)
- Check context cancellation
- Avoid goroutine leaks
- Use `defer wg.Done()` in workers

**Reference Solution**: `solutions/task2-worker-pool-solution.go`

**Validation Checks**:

1. ✅ File exists (`worker_pool.go`)
2. ✅ `context.Context` as first parameter
3. ✅ Uses `sync.WaitGroup`
4. ✅ Uses goroutines (`go func`)
5. ✅ Uses `defer wg.Done()`
6. ✅ Uses channels (`make(chan`)
7. ✅ Closes channels (`close()`)
8. ✅ Checks context cancellation (`ctx.Done()`)
9. ✅ Waits for goroutines (`wg.Wait()`)

---

### Task 3: Interface Design (34% weight)

**Objective**: Implement a data processor demonstrating idiomatic interface design.

**Key Requirements**:

- Define small, focused interfaces (1-2 methods each)
- Use -er/-or naming convention
- Accept interface parameters
- Return concrete struct types
- Use type assertions for optional behavior
- Define interfaces on consumer side
- No large interfaces (>3 methods)

**Reference Solution**: `solutions/task3-data-processor-solution.go`

**Validation Checks**:

1. ✅ File exists (`data_processor.go`)
2. ✅ Defines small, focused interfaces (≥3 interfaces)
3. ✅ Interface naming follows -er/-or convention
4. ✅ Accepts interface parameters
5. ✅ Returns concrete struct pointers
6. ✅ Uses type assertions for optional behavior
7. ✅ Interfaces are small (1-2 methods)
8. ✅ No large interfaces (>3 methods)

---

## Grading Components

### 1. Deterministic Grader (70% weight)

**Script**: `graders/go-validator.js`

**How It Works**:

- Detects task type based on filename
- Runs pattern matching checks
- Returns JSON with score and check details

**Output Format**:

```json
{
  "score": 0.89,
  "details": "8/9 checks passed",
  "checks": [
    {"name": "file_exists", "passed": true, "message": "..."},
    {"name": "uses_error_wrapping", "passed": true, "message": "..."},
    ...
  ]
}
```

### 2. LLM Rubric Grader (30% weight)

**Configuration**: Inline rubric in `eval.yaml` for each task

**Dimensions**:

#### For Error Handling Task

**Correctness & Idioms (0.4 points)**:

- Are errors wrapped with `%w`?
- Are custom error types properly defined?
- Are sentinel errors used correctly?
- Does it follow "accept interfaces, return structs"?
- Are errors never ignored?

**Code Quality (0.3 points)**:

- Is code simple and clear?
- Are types well-designed?
- Is zero value useful?
- Are variable names idiomatic?
- Is the code maintainable?

**Pattern Compliance (0.3 points)**:

- Does code follow skill patterns?
- Are `errors.Is`/`errors.As` used when needed?
- Is error context meaningful?
- Are anti-patterns avoided?

#### For Concurrency Task

**Correctness & Safety (0.4 points)**:

- Are goroutines properly coordinated?
- Is `WaitGroup` used correctly?
- Are channels closed properly?
- Is context used for cancellation?
- Are race conditions avoided?
- No goroutine leaks?

**Code Quality (0.3 points)**:

- Is concurrency logic clear?
- Are variable names meaningful?
- Is the code maintainable?
- Are defer statements used appropriately?
- Is error handling correct?

**Pattern Compliance (0.3 points)**:

- Does code follow worker pool pattern?
- Is `context.Context` the first parameter?
- Are channels closed by sender?
- Are anti-patterns avoided?

#### For Interface Design Task

**Design & Idioms (0.4 points)**:

- Are interfaces small and focused?
- Does it accept interfaces, return structs?
- Are interfaces defined on consumer side?
- Are interface names idiomatic?
- Is zero value useful?

**Code Quality (0.3 points)**:

- Is code simple and clear?
- Are types well-designed?
- Is composition used over inheritance?
- Are naming conventions followed?
- Is the code maintainable?

**Pattern Compliance (0.3 points)**:

- Does code follow interface patterns?
- Are type assertions used correctly?
- Are standard library patterns followed?
- Are anti-patterns avoided?

---

## Running Evaluations

### Prerequisites

Install skillgrade CLI:

```bash
npm install -g @mgechev/skillgrade
```

### Run Evaluation

From the skill directory:

```bash
cd .claude/skills/golang
skillgrade eval.yaml
```

### Run with Custom Settings

```bash
# Run 5 trials
skillgrade eval.yaml --trials 5

# Run only Task 1
skillgrade eval.yaml --task error-handling

# Use specific model
skillgrade eval.yaml --model claude-opus-4
```

---

## Interpreting Results

### Score Ranges

- **0.9 - 1.0**: Excellent - Idiomatic Go code
- **0.7 - 0.9**: Good - Meets requirements with minor issues
- **0.5 - 0.7**: Needs Improvement - Missing key patterns
- **Below 0.5**: Poor - Major issues or incomplete

### Threshold

**Passing threshold**: 0.7 (70%)

Agents must score ≥0.7 across all tasks to demonstrate Go proficiency.

---

## Common Failure Patterns

### Task 1: Error Handling

**Anti-patterns**:

- ❌ Using panic for error handling
- ❌ Ignoring errors with `_`
- ❌ Returning interface types
- ❌ Accepting concrete types instead of interfaces
- ❌ Not wrapping errors with context
- ❌ Using `%v` instead of `%w`

### Task 2: Concurrency

**Anti-patterns**:

- ❌ Not using context for cancellation
- ❌ Goroutine leaks
- ❌ Closing channels from receiver side
- ❌ Not using `defer wg.Done()`
- ❌ Unbuffered channels causing deadlocks
- ❌ Not checking context before work
- ❌ Race conditions
- ❌ Context not as first parameter

### Task 3: Interface Design

**Anti-patterns**:

- ❌ Large interfaces with many methods
- ❌ Returning interface types
- ❌ Accepting concrete types
- ❌ Not using type assertions
- ❌ Interface names not following -er convention
- ❌ Defining interfaces on provider side
- ❌ Using empty interfaces unnecessarily

---

## Troubleshooting

### Deterministic Grader Issues

**Problem**: Grader script fails

- Check Node.js is installed: `node --version`
- Test manually: `node graders/go-validator.js`
- Verify file has .go extension

**Problem**: False negatives

- Check regex patterns in grader
- Verify Go code formatting
- Review check logic

### LLM Rubric Issues

**Problem**: Inconsistent scoring

- Increase trials for better average
- Refine rubric criteria
- Add more specific examples

**Problem**: Scores too low/high

- Adjust point allocations
- Test against reference solutions
- Calibrate expectations

---

## Validation Checklist

Before running evaluations:

- [ ] Test grader against reference solutions (should score 1.0)
- [ ] Test LLM rubric against solutions (should score ≥0.9)
- [ ] Verify workspace fixtures are complete
- [ ] Confirm task instructions are clear
- [ ] Run 3-5 test trials
- [ ] Adjust threshold if needed
- [ ] Document known issues

---

## Go Idioms Reference

Quick reference of patterns evaluated:

### Error Handling

- Use `fmt.Errorf` with `%w` for wrapping
- Define custom error types for domain errors
- Use sentinel errors for common cases
- Never ignore errors
- Accept interfaces, return structs

### Concurrency

- Context as first parameter
- Use `sync.WaitGroup` for coordination
- Close channels from sender side
- Check `ctx.Done()` for cancellation
- Use `defer wg.Done()` in goroutines
- Avoid goroutine leaks

### Interface Design

- Small, focused interfaces (1-2 methods)
- -er/-or naming convention
- Accept interfaces, return structs
- Define interfaces where they're used
- Use type assertions for optional behavior
- Avoid large interfaces

---

## Additional Resources

- **Skillgrade Documentation**: https://github.com/mgechev/skillgrade
- **Effective Go**: https://go.dev/doc/effective_go
- **Go Code Review Comments**: https://github.com/golang/go/wiki/CodeReviewComments
- **Main Skill Reference**: `SKILL.md`
- **Go Blog**: https://go.dev/blog/

---

## Contact & Support

For issues or questions:

- Review skill documentation: `SKILL.md`
- Check reference solutions: `solutions/*.go`
- Review workspace fixtures: `workspace/*/README.md`
- File an issue in the repository
