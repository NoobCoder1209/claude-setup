# Task 1: Error Handling

## Objective

Implement a configuration loader that demonstrates idiomatic Go error handling patterns.

## Requirements

Create a file named `config_loader.go` with the following:

### 1. Custom Error Types

Define a `ValidationError` type:

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}
```

### 2. Sentinel Errors

Define sentinel errors:

```go
var (
    ErrInvalidFormat = errors.New("invalid configuration format")
    ErrMissingField  = errors.New("required field missing")
)
```

### 3. LoadConfig Function

Implement a function with this signature:

```go
func LoadConfig(r io.Reader) (*Config, error)
```

The function should:

- Accept an `io.Reader` interface (not a concrete type)
- Return a concrete `*Config` struct (not an interface)
- Read JSON configuration from the reader
- Validate required fields exist
- Wrap errors with context using `fmt.Errorf` with `%w`
- Return sentinel errors or custom errors as appropriate
- Never ignore errors (no `_` for error returns)

### 4. Config Struct

Define a Config struct:

```go
type Config struct {
    Name    string
    Timeout time.Duration
    MaxRetries int
}
```

### 5. Validation Logic

The loader should validate:

- Name field is not empty (return `&ValidationError` if empty)
- Timeout is greater than 0
- MaxRetries is between 1 and 10

### 6. Error Wrapping

All errors should be wrapped with context:

```go
return nil, fmt.Errorf("load config: %w", err)
return nil, fmt.Errorf("parse config: %w", err)
```

## Expected Structure

```go
package config

import (
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "time"
)

// Custom error type
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}

// Sentinel errors
var (
    ErrInvalidFormat = errors.New("invalid configuration format")
    ErrMissingField  = errors.New("required field missing")
)

// Config represents the application configuration
type Config struct {
    Name       string        `json:"name"`
    Timeout    time.Duration `json:"timeout"`
    MaxRetries int           `json:"maxRetries"`
}

// LoadConfig reads and validates configuration from a reader.
// It returns an error if the configuration is invalid or cannot be parsed.
func LoadConfig(r io.Reader) (*Config, error) {
    // Your implementation here
}
```

## Validation Criteria

Your implementation will be evaluated on:

1. ✅ Defines `ValidationError` custom error type
2. ✅ Defines sentinel errors (`ErrInvalidFormat`, `ErrMissingField`)
3. ✅ Uses `fmt.Errorf` with `%w` for error wrapping
4. ✅ Accepts `io.Reader` interface parameter
5. ✅ Returns concrete `*Config` struct
6. ✅ No ignored errors (no blank identifier for errors)
7. ✅ Returns early on error conditions
8. ✅ Meaningful error context in wrapped errors

## Anti-Patterns to Avoid

- ❌ Using panic for error handling
- ❌ Ignoring errors with `_`
- ❌ Returning interface types instead of concrete structs
- ❌ Accepting concrete types instead of interfaces
- ❌ Not wrapping errors with context
- ❌ Using `%v` instead of `%w` for error wrapping
