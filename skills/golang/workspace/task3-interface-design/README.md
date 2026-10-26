# Task 3: Interface Design

## Objective

Implement a data processor that demonstrates idiomatic Go interface design principles.

## Requirements

Create a file named `data_processor.go` with the following:

### 1. Small, Focused Interfaces

Define small interfaces with single responsibilities:

```go
// Validator validates data
type Validator interface {
    Validate(data string) error
}

// Transformer transforms data
type Transformer interface {
    Transform(data string) (string, error)
}

// Saver saves processed data
type Saver interface {
    Save(data string) error
}
```

### 2. Optional Behavior Interface

Define an optional interface that processors can implement:

```go
// Closer represents components that need cleanup
type Closer interface {
    Close() error
}
```

### 3. Processor Struct

Implement a concrete processor struct:

```go
type Processor struct {
    validator   Validator
    transformer Transformer
    saver       Saver
}

// NewProcessor creates a new Processor with the given components
func NewProcessor(v Validator, t Transformer, s Saver) *Processor {
    return &Processor{
        validator:   v,
        transformer: t,
        saver:       s,
    }
}
```

### 4. Process Function

Implement the main processing function that:

- Accepts interface parameters
- Returns a concrete struct
- Uses type assertions for optional behavior (Closer)
- Handles errors properly

```go
// ProcessResult contains the result of processing
type ProcessResult struct {
    OriginalData string
    ProcessedData string
    ValidatedAt  time.Time
}

// Process validates, transforms, and saves data.
// It returns a concrete ProcessResult or an error.
func (p *Processor) Process(data string) (*ProcessResult, error) {
    // Your implementation here
}
```

### 5. Type Assertions for Optional Behavior

Use type assertions to check if components implement `Closer`:

```go
// Close closes all components that implement Closer
func (p *Processor) Close() error {
    // Check each component with type assertion
    // If it implements Closer, call Close()
}
```

### 6. Example Implementations

Provide simple implementations for testing:

```go
type SimpleValidator struct{}

func (v *SimpleValidator) Validate(data string) error {
    if data == "" {
        return errors.New("data cannot be empty")
    }
    return nil
}

type SimpleTransformer struct{}

func (t *SimpleTransformer) Transform(data string) (string, error) {
    return strings.ToUpper(data), nil
}

type SimpleSaver struct{}

func (s *SimpleSaver) Save(data string) error {
    // Simulate saving
    return nil
}
```

## Expected Structure

```go
package processor

import (
    "errors"
    "strings"
    "time"
)

// Validator validates data
type Validator interface {
    Validate(data string) error
}

// Transformer transforms data
type Transformer interface {
    Transform(data string) (string, error)
}

// Saver saves processed data
type Saver interface {
    Save(data string) error
}

// Closer represents components that need cleanup
type Closer interface {
    Close() error
}

// ProcessResult contains the result of processing
type ProcessResult struct {
    OriginalData  string
    ProcessedData string
    ValidatedAt   time.Time
}

// Processor orchestrates data validation, transformation, and saving
type Processor struct {
    validator   Validator
    transformer Transformer
    saver       Saver
}

// NewProcessor creates a new Processor with the given components
func NewProcessor(v Validator, t Transformer, s Saver) *Processor {
    return &Processor{
        validator:   v,
        transformer: t,
        saver:       s,
    }
}

// Process validates, transforms, and saves data
func (p *Processor) Process(data string) (*ProcessResult, error) {
    // Your implementation here
}

// Close closes all components that implement Closer
func (p *Processor) Close() error {
    // Your implementation here
}
```

## Validation Criteria

Your implementation will be evaluated on:

1. ✅ Defines small, focused interfaces (single method each)
2. ✅ Interfaces have -er suffix naming convention
3. ✅ Accepts interface parameters (Validator, Transformer, Saver)
4. ✅ Returns concrete struct (\*ProcessResult)
5. ✅ Uses type assertions for optional behavior (Closer)
6. ✅ Interfaces defined on consumer side (in processor package)
7. ✅ No large, multi-method interfaces
8. ✅ Zero value considerations where applicable

## Anti-Patterns to Avoid

- ❌ Large interfaces with many methods
- ❌ Returning interface types from Process()
- ❌ Accepting concrete types instead of interfaces
- ❌ Not using type assertions for optional interfaces
- ❌ Interface names not following -er convention
- ❌ Defining interfaces on provider side (unless it's io.Reader pattern)
- ❌ Empty interfaces (interface{}) unless absolutely necessary
