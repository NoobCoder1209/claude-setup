package worker

import (
	"context"
	"fmt"
	"sync"
)

// Job represents a unit of work to be processed.
type Job struct {
	ID   int
	Data string
}

// Result represents the outcome of processing a job.
type Result struct {
	JobID  int
	Output string
	Error  error
}

// ProcessJobs processes jobs concurrently using a worker pool.
// It returns all results or an error if the context is cancelled before completion.
func ProcessJobs(ctx context.Context, jobs []Job, numWorkers int) ([]Result, error) {
	jobsChan := make(chan Job, len(jobs))
	resultsChan := make(chan Result, len(jobs))

	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobsChan {
				select {
				case <-ctx.Done():
					resultsChan <- Result{
						JobID: job.ID,
						Error: ctx.Err(),
					}
					return
				default:
					output, err := processJob(ctx, job)
					resultsChan <- Result{
						JobID:  job.ID,
						Output: output,
						Error:  err,
					}
				}
			}
		}()
	}

	// Send jobs to workers
	go func() {
		for _, job := range jobs {
			select {
			case <-ctx.Done():
				close(jobsChan)
				return
			case jobsChan <- job:
			}
		}
		close(jobsChan)
	}()

	// Collect results in a separate goroutine
	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	// Gather all results
	var results []Result
	for result := range resultsChan {
		results = append(results, result)
	}

	// Check if context was cancelled
	select {
	case <-ctx.Done():
		return results, ctx.Err()
	default:
		return results, nil
	}
}

// processJob simulates processing a single job.
func processJob(ctx context.Context, job Job) (string, error) {
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	default:
		// Simulate work
		return fmt.Sprintf("processed: %s", job.Data), nil
	}
}
