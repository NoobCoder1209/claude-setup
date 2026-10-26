# Git Hooks for Go Development

Best practices for automating Go workflows with Git hooks, ensuring generated code stays in sync with the codebase.

## Running `go generate` on Git Pull

### Why This Matters

Go's code generation (`go generate`) creates code from interface definitions, templates, and other sources. When team members update these definitions and push changes, other developers need to regenerate code after pulling to avoid:

- **Stale mocks** - Tests fail because mocks don't match updated interfaces
- **Missing generated code** - Build failures from outdated generated files
- **Merge conflicts** - Generated files conflict due to version skew
- **CI/CD failures** - Local tests pass but CI fails due to missing regeneration

### Automatic Generation Pattern

Use a `post-merge` Git hook to automatically run `go generate` after pulling changes:

```bash
#!/bin/bash
# .git/hooks/post-merge

# Run go generate after merging/pulling changes
echo "Running go generate to sync generated code..."
go generate ./...

# Check if any files were modified
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Generated files were updated. Review changes before committing."
    git status --short
fi
```

### Installation Methods

#### Method 1: Manual Hook Installation

```bash
# Create the hook file
cat > .git/hooks/post-merge << 'EOF'
#!/bin/bash
echo "Running go generate to sync generated code..."
go generate ./...

if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Generated files were updated. Review changes:"
    git status --short
fi
EOF

# Make it executable
chmod +x .git/hooks/post-merge
```

#### Method 2: Shared Hook via Makefile

Since `.git/hooks` is not tracked, use a Makefile to install shared hooks:

```makefile
# Makefile
.PHONY: setup-hooks
setup-hooks:
	@echo "Installing Git hooks..."
	@cp scripts/hooks/post-merge .git/hooks/post-merge
	@chmod +x .git/hooks/post-merge
	@echo "✓ Git hooks installed"

.PHONY: generate
generate:
	@echo "Running go generate..."
	@go generate ./...
	@echo "✓ Code generation complete"
```

Store the hook script in your repository:

```bash
# Store in version control
mkdir -p scripts/hooks
cat > scripts/hooks/post-merge << 'EOF'
#!/bin/bash
echo "Running go generate to sync generated code..."
go generate ./...

if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Generated files were updated. Review changes:"
    git status --short
fi
EOF

# Developers run once to install
make setup-hooks
```

#### Method 3: Project-Level Git Hooks Directory (Git 2.9+)

Configure Git to use a tracked hooks directory:

```bash
# One-time setup per repository
mkdir -p .githooks
git config core.hooksPath .githooks

# Create the hook
cat > .githooks/post-merge << 'EOF'
#!/bin/bash
echo "Running go generate to sync generated code..."
go generate ./...

if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Generated files were updated. Review changes:"
    git status --short
fi
EOF

chmod +x .githooks/post-merge

# Commit to repository
git add .githooks/
git commit -m "Add post-merge hook for go generate"
```

Document in your README:

````markdown
## Setup

After cloning, configure Git to use project hooks:

```bash
git config core.hooksPath .githooks
```
````

````

### Advanced: Conditional Generation

Only run `go generate` if relevant files changed:

```bash
#!/bin/bash
# .git/hooks/post-merge

# Check if files that trigger generation have changed
CHANGED_FILES=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)

# Patterns that require regeneration
if echo "$CHANGED_FILES" | grep -qE '\.(go)$|go\.mod|go\.sum|\.mockery\.yaml'; then
    echo "Detected changes requiring code generation..."
    go generate ./...

    if [[ -n $(git status --porcelain) ]]; then
        echo "⚠️  Generated files were updated:"
        git status --short
    fi
else
    echo "No changes requiring code generation"
fi
````

### Handling Generation Errors

Ensure the hook doesn't block pulls if generation fails:

```bash
#!/bin/bash
# .git/hooks/post-merge

echo "Running go generate..."
if go generate ./... 2>&1 | tee /tmp/go-generate.log; then
    if [[ -n $(git status --porcelain) ]]; then
        echo "⚠️  Generated files were updated:"
        git status --short
    fi
else
    echo "❌ go generate failed. See /tmp/go-generate.log for details"
    echo "You may need to run 'go generate ./...' manually"
    # Don't exit with error - allow pull to complete
fi
```

## Pre-Commit Hook for Generated Files

Prevent committing stale generated files:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if generated files are staged
STAGED_GO_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.go$')

if [[ -n "$STAGED_GO_FILES" ]]; then
    echo "Checking if generated code is up to date..."

    # Run go generate
    go generate ./...

    # Check if generation changed anything
    if [[ -n $(git status --porcelain) ]]; then
        echo "❌ Generated files are out of sync!"
        echo "Run 'go generate ./...' and stage the changes"
        git status --short
        exit 1
    fi
fi
```

## Post-Checkout Hook

Also run generation when switching branches:

```bash
#!/bin/bash
# .git/hooks/post-checkout

PREV_HEAD=$1
NEW_HEAD=$2
BRANCH_SWITCH=$3

# Only run on branch switches (not file checkouts)
if [[ $BRANCH_SWITCH -eq 1 ]]; then
    echo "Running go generate after branch switch..."
    go generate ./...

    if [[ -n $(git status --porcelain) ]]; then
        echo "⚠️  Generated files were updated:"
        git status --short
    fi
fi
```

## CI/CD Integration

Ensure CI validates generated code is up-to-date:

```yaml
# .github/workflows/validate-generated.yml
name: Validate Generated Code

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version-file: go.mod

      - name: Run go generate
        run: go generate ./...

      - name: Check for uncommitted changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "❌ Generated files are out of sync"
            git status
            git diff
            exit 1
          fi
          echo "✓ Generated files are up to date"
```

## Team Onboarding

Document the hook setup in your repository's README or CONTRIBUTING guide:

````markdown
## Development Setup

1. Clone the repository
2. Install Git hooks (choose one method):

   **Option A: Using Makefile**

   ```bash
   make setup-hooks
   ```
````

**Option B: Using project hooks directory**

```bash
git config core.hooksPath .githooks
```

**Option C: Manual installation**

```bash
cp scripts/hooks/* .git/hooks/
chmod +x .git/hooks/*
```

3. Verify setup:
   ```bash
   git pull  # Should automatically run go generate
   ```

## Why Git Hooks?

- **Consistency**: Everyone runs the same commands automatically
- **Fewer mistakes**: Can't forget to regenerate mocks
- **Faster reviews**: PRs don't get blocked by "please run go generate"
- **Better DX**: Less manual work, more focus on coding

```

## Quick Reference

| Hook | Trigger | Purpose |
|------|---------|---------|
| `post-merge` | After `git pull` / `git merge` | Sync generated code with pulled changes |
| `post-checkout` | After `git checkout <branch>` | Sync generated code when switching branches |
| `pre-commit` | Before `git commit` | Prevent committing stale generated files |

## Troubleshooting

**Hook doesn't run:**
- Verify hook file is executable: `ls -l .git/hooks/post-merge`
- Check hook path configuration: `git config core.hooksPath`

**Hook runs but files aren't generated:**
- Check for errors in `/tmp/go-generate.log`
- Verify `go generate` commands exist in source files
- Ensure mockery or other generators are installed

**Generated files cause merge conflicts:**
- Stash generated files: `git stash`
- Pull changes: `git pull`
- Hook regenerates files automatically
- Review and commit if needed
```
