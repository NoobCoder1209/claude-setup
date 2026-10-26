# Task 2: Concurrency Patterns

## Objective

Implement a worker pool that demonstrates idiomatic Go concurrency patterns.

## Requirements

Create a file named `worker_pool.go` with the following:

### 1. Job and Result Types

Define job and result types:

```go
type Job struct {
    ID   int
    Data string
}

type Result struct {
    JobID int
    Output string
    Error error
}
```

### 2. ProcessJobs Function

Implement a function with this signature:

```go
func ProcessJobs(ctx context.Context, jobs []Job, numWorkers int) ([]Result, error)
```

The function should:

- Accept `context.Context` as the first parameter
- Use a worker pool pattern with `numWorkers` goroutines
- Use channels for job distribution and result collection
- Use `sync.WaitGroup` for goroutine coordination
- Respect context cancellation (return early if context is cancelled)
- Collect all results or errors
- Properly close channels when done
- Avoid goroutine leaks

### 3. Worker Implementation

Each worker should:

- Process jobs from a jobs channel
- Send results to a results channel
- Handle errors gracefully
- Check context cancellation before processing

### 4. Channel Management

- Jobs channel should be created and fed by the main goroutine
- Results channel should be created by the main function
- Close channels properly (sender closes, not receiver)
- Use buffered channels if appropriate

### 5. Synchronization

- Use `sync.WaitGroup` to wait for all workers
- Call `wg.Add()` before starting goroutines
- Use `defer wg.Done()` in each worker
- Wait for all workers before closing results channel

### 6. Context Handling

- Check `ctx.Done()` before/during processing
- Return context error if cancelled
- Gracefully shut down workers on cancellation

## Expected Structure

```go
package worker

import (
    "context"
    "fmt"
    "sync"
)

type Job struct {
    ID   int
    Data string
}

type Result struct {
    JobID  int
    Output string
    Error  error
}

// ProcessJobs processes jobs concurrently using a worker pool.
// It returns all results or an error if the context is cancelled.
func ProcessJobs(ctx context.Context, jobs []Job, numWorkers int) ([]Result, error) {
    // Your implementation here
}

// processJob simulates processing a single job
func processJob(ctx context.Context, job Job) (string, error) {
    select {
    case <-ctx.Done():
        return "", ctx.Err()
    default:
        // Simulate work
        return fmt.Sprintf("processed: %s", job.Data), nil
    }
}
```

## Validation Criteria

Your implementation will be evaluated on:

1. ✅ Uses `context.Context` as first parameter
2. ✅ Implements worker pool pattern with goroutines
3. ✅ Uses `sync.WaitGroup` for coordination
4. ✅ Uses channels for job distribution
5. ✅ Closes channels properly (sender closes)
6. ✅ Respects context cancellation
7. ✅ No goroutine leaks (all goroutines complete)
8. ✅ Uses `defer wg.Done()` in workers
9. ✅ Collects all results/errors
10. ✅ Returns early on context cancellation

## Anti-Patterns to Avoid

- ❌ Not using context for cancellation
- ❌ Goroutine leaks (channels not closed, goroutines stuck)
- ❌ Closing channels from receiver side
- ❌ Not using `defer wg.Done()`
- ❌ Unbuffered channels causing unnecessary blocking
- ❌ Not checking context before starting work
- ❌ Race conditions on shared data
- ❌ Context not as first parameter
