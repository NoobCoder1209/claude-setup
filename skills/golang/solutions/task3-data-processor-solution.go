package processor

import (
	"errors"
	"strings"
	"time"
)

// Validator validates data.
type Validator interface {
	Validate(data string) error
}

// Transformer transforms data.
type Transformer interface {
	Transform(data string) (string, error)
}

// Saver saves processed data.
type Saver interface {
	Save(data string) error
}

// Closer represents components that need cleanup.
type Closer interface {
	Close() error
}

// ProcessResult contains the result of processing.
type ProcessResult struct {
	OriginalData  string
	ProcessedData string
	ValidatedAt   time.Time
}

// Processor orchestrates data validation, transformation, and saving.
type Processor struct {
	validator   Validator
	transformer Transformer
	saver       Saver
}

// NewProcessor creates a new Processor with the given components.
func NewProcessor(v Validator, t Transformer, s Saver) *Processor {
	return &Processor{
		validator:   v,
		transformer: t,
		saver:       s,
	}
}

// Process validates, transforms, and saves data.
// It returns a concrete ProcessResult or an error.
func (p *Processor) Process(data string) (*ProcessResult, error) {
	// Validate
	if err := p.validator.Validate(data); err != nil {
		return nil, err
	}

	// Transform
	transformed, err := p.transformer.Transform(data)
	if err != nil {
		return nil, err
	}

	// Save
	if err := p.saver.Save(transformed); err != nil {
		return nil, err
	}

	return &ProcessResult{
		OriginalData:  data,
		ProcessedData: transformed,
		ValidatedAt:   time.Now(),
	}, nil
}

// Close closes all components that implement Closer.
func (p *Processor) Close() error {
	var errs []error

	// Check each component with type assertion
	if c, ok := p.validator.(Closer); ok {
		if err := c.Close(); err != nil {
			errs = append(errs, err)
		}
	}

	if c, ok := p.transformer.(Closer); ok {
		if err := c.Close(); err != nil {
			errs = append(errs, err)
		}
	}

	if c, ok := p.saver.(Closer); ok {
		if err := c.Close(); err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		return errors.Join(errs...)
	}

	return nil
}

// SimpleValidator validates that data is not empty.
type SimpleValidator struct{}

func (v *SimpleValidator) Validate(data string) error {
	if data == "" {
		return errors.New("data cannot be empty")
	}
	return nil
}

// SimpleTransformer transforms data to uppercase.
type SimpleTransformer struct{}

func (t *SimpleTransformer) Transform(data string) (string, error) {
	return strings.ToUpper(data), nil
}

// SimpleSaver simulates saving data.
type SimpleSaver struct{}

func (s *SimpleSaver) Save(data string) error {
	// Simulate saving
	return nil
}
