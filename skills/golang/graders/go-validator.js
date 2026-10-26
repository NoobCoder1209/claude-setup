#!/usr/bin/env node

/**
 * Go Idioms and Patterns Validator
 *
 * Validates Go code against idiomatic patterns and best practices.
 */

const fs = require('fs');
const path = require('path');

// Pattern checks for different task types
const checks = {
  'task1-error-handling': [
    {
      name: 'file_exists',
      check: (content, files) =>
        files.some((f) => f.endsWith('config_loader.go')),
      message: 'config_loader.go should exist',
    },
    {
      name: 'defines_validation_error',
      check: (content) => content.includes('type ValidationError struct'),
      message: 'Should define ValidationError custom error type',
    },
    {
      name: 'validation_error_method',
      check: (content) =>
        /func.*ValidationError.*Error\(\)\s+string/.test(content),
      message: 'ValidationError should implement Error() method',
    },
    {
      name: 'defines_sentinel_errors',
      check: (content) =>
        content.includes('ErrInvalidFormat') &&
        content.includes('ErrMissingField'),
      message:
        'Should define sentinel errors (ErrInvalidFormat, ErrMissingField)',
    },
    {
      name: 'uses_error_wrapping',
      check: (content) =>
        content.includes('fmt.Errorf') && content.includes('%w'),
      message: 'Should use fmt.Errorf with %w for error wrapping',
    },
    {
      name: 'accepts_io_reader',
      check: (content) =>
        /func\s+LoadConfig\s*\(\s*\w+\s+io\.Reader\s*\)/.test(content),
      message: 'LoadConfig should accept io.Reader interface',
    },
    {
      name: 'returns_concrete_struct',
      check: (content) =>
        /func\s+LoadConfig.*\)\s*\(\s*\*Config\s*,\s*error\s*\)/.test(content),
      message: 'LoadConfig should return concrete *Config struct',
    },
    {
      name: 'no_ignored_errors',
      check: (content) =>
        !(
          /,\s*_\s*:?=.*error/i.test(content) ||
          /_\s*,\s*\w+\s*:?=.*error/i.test(content)
        ),
      message: 'Should not ignore errors with blank identifier',
    },
  ],
  'task2-concurrency-patterns': [
    {
      name: 'file_exists',
      check: (content, files) =>
        files.some((f) => f.endsWith('worker_pool.go')),
      message: 'worker_pool.go should exist',
    },
    {
      name: 'context_first_param',
      check: (content) =>
        /func\s+ProcessJobs\s*\(\s*ctx\s+context\.Context/.test(content),
      message: 'ProcessJobs should have context.Context as first parameter',
    },
    {
      name: 'uses_sync_waitgroup',
      check: (content) => content.includes('sync.WaitGroup'),
      message: 'Should use sync.WaitGroup for goroutine coordination',
    },
    {
      name: 'uses_goroutines',
      check: (content) => content.includes('go func('),
      message: 'Should use goroutines (go func)',
    },
    {
      name: 'uses_defer_done',
      check: (content) =>
        content.includes('defer') && content.includes('.Done()'),
      message: 'Should use defer wg.Done() in goroutines',
    },
    {
      name: 'uses_channels',
      check: (content) =>
        /make\s*\(\s*chan\s+/.test(content) || /chan\s+\w+/.test(content),
      message: 'Should use channels for communication',
    },
    {
      name: 'closes_channels',
      check: (content) => content.includes('close('),
      message: 'Should close channels properly',
    },
    {
      name: 'checks_context_done',
      check: (content) =>
        content.includes('ctx.Done()') || content.includes('context.Done'),
      message: 'Should check context cancellation (ctx.Done())',
    },
    {
      name: 'waits_for_goroutines',
      check: (content) => content.includes('.Wait()'),
      message: 'Should wait for goroutines with wg.Wait()',
    },
  ],
  'task3-interface-design': [
    {
      name: 'file_exists',
      check: (content, files) =>
        files.some((f) => f.endsWith('data_processor.go')),
      message: 'data_processor.go should exist',
    },
    {
      name: 'defines_small_interfaces',
      check: (content) => {
        const interfaces =
          content.match(/type\s+\w+\s+interface\s*\{[^}]*\}/g) || [];
        return interfaces.length >= 3; // At least Validator, Transformer, Saver
      },
      message: 'Should define small, focused interfaces',
    },
    {
      name: 'interface_naming_convention',
      check: (content) => {
        const interfaces = content.match(/type\s+(\w+)\s+interface/g) || [];
        const hasErSuffix = interfaces.some((i) =>
          /type\s+\w+(er|or)\s+interface/.test(i),
        );
        return hasErSuffix;
      },
      message: 'Interfaces should follow -er/-or naming convention',
    },
    {
      name: 'accepts_interfaces',
      check: (content) => {
        // Check that NewProcessor or similar constructor accepts interfaces
        return /func\s+New\w+\s*\([^)]*\w+\s+\w+\s*,/.test(content);
      },
      message: 'Should accept interface parameters',
    },
    {
      name: 'returns_concrete_struct',
      check: (content) =>
        /func.*\)\s*\*\w+\s*{/.test(content) ||
        /func.*\)\s*\(\s*\*\w+/.test(content),
      message: 'Should return concrete struct pointers',
    },
    {
      name: 'uses_type_assertion',
      check: (content) => /\.\(.*\)/.test(content) || content.includes('.('),
      message: 'Should use type assertions for optional behavior',
    },
    {
      name: 'single_method_interfaces',
      check: (content) => {
        // Check that most interfaces have single methods (good practice)
        const interfaces =
          content.match(/type\s+\w+\s+interface\s*\{([^}]*)\}/g) || [];
        const smallInterfaces = interfaces.filter((i) => {
          const methods = (i.match(/\n\s*\w+\s*\(/g) || []).length;
          return methods <= 2; // Allow up to 2 methods per interface
        });
        return smallInterfaces.length >= 2;
      },
      message: 'Interfaces should be small (1-2 methods)',
    },
    {
      name: 'no_large_interfaces',
      check: (content) => {
        // Check that no interface has too many methods
        const interfaces =
          content.match(/type\s+\w+\s+interface\s*\{([^}]*)\}/g) || [];
        const largeInterfaces = interfaces.filter((i) => {
          const methods = (i.match(/\n\s*\w+\s*\(/g) || []).length;
          return methods > 3;
        });
        return largeInterfaces.length === 0;
      },
      message: 'Should not define large interfaces (>3 methods)',
    },
  ],
};

function detectTaskType(files, content) {
  if (files.some((f) => f.endsWith('config_loader.go'))) {
    return 'task1-error-handling';
  } else if (files.some((f) => f.endsWith('worker_pool.go'))) {
    return 'task2-concurrency-patterns';
  } else if (files.some((f) => f.endsWith('data_processor.go'))) {
    return 'task3-interface-design';
  }
  return null;
}

function validateCode() {
  try {
    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);

    // Read all .go file contents
    let allContent = '';
    files.forEach((file) => {
      if (file.endsWith('.go')) {
        try {
          allContent += fs.readFileSync(path.join(cwd, file), 'utf8') + '\n';
        } catch (e) {
          // Ignore read errors
        }
      }
    });

    // Detect task type
    const taskType = detectTaskType(
      files.map((f) => path.join(cwd, f)),
      allContent,
    );

    if (!taskType) {
      console.log(
        JSON.stringify({
          score: 0,
          details: 'Could not detect task type',
          checks: [],
        }),
      );
      return;
    }

    // Run checks for this task type
    const taskChecks = checks[taskType];
    const results = taskChecks.map((checkDef) => {
      const passed = checkDef.check(
        allContent,
        files.map((f) => path.join(cwd, f)),
      );
      return {
        name: checkDef.name,
        passed,
        message: checkDef.message,
      };
    });

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const score = totalCount > 0 ? passedCount / totalCount : 0;

    console.log(
      JSON.stringify(
        {
          score,
          details: `${passedCount}/${totalCount} checks passed`,
          checks: results,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.log(
      JSON.stringify({
        score: 0,
        details: `Error: ${error.message}`,
        checks: [],
      }),
    );
  }
}

validateCode();
