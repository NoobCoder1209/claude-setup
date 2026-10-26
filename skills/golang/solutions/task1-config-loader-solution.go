package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"
)

// ValidationError represents a validation failure on a specific field.
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}

// Sentinel errors for common configuration issues.
var (
	ErrInvalidFormat = errors.New("invalid configuration format")
	ErrMissingField  = errors.New("required field missing")
)

// Config represents the application configuration.
type Config struct {
	Name       string        `json:"name"`
	Timeout    time.Duration `json:"timeout"`
	MaxRetries int           `json:"maxRetries"`
}

// LoadConfig reads and validates configuration from a reader.
// It returns an error if the configuration is invalid or cannot be parsed.
func LoadConfig(r io.Reader) (*Config, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", ErrInvalidFormat)
	}

	if err := validateConfig(&cfg); err != nil {
		return nil, fmt.Errorf("validate config: %w", err)
	}

	return &cfg, nil
}

func validateConfig(cfg *Config) error {
	if cfg.Name == "" {
		return &ValidationError{
			Field:   "name",
			Message: "name cannot be empty",
		}
	}

	if cfg.Timeout <= 0 {
		return &ValidationError{
			Field:   "timeout",
			Message: "timeout must be greater than 0",
		}
	}

	if cfg.MaxRetries < 1 || cfg.MaxRetries > 10 {
		return &ValidationError{
			Field:   "maxRetries",
			Message: "maxRetries must be between 1 and 10",
		}
	}

	return nil
}
