---
name: pr-address-comments
description: Address PR review comments by analyzing, presenting for approval, and implementing approved changes. Use when you have PR review comments to address and want to systematically work through them.
user_invocable: true
args: "[PR_NUMBER] [--repo OWNER/REPO]"
---

# PR Address Comments

Fetch, analyze, and implement PR review comments systematically.

## Usage

```
/pr-address-comments <PR_NUMBER>
/pr-address-comments <PR_NUMBER> --repo owner/repo
```

## Workflow

### Step 1: Fetch PR Review Comments

First, fetch all review comments on the PR:

```bash
# Get PR review comments
gh pr view <PR_NUMBER> --comments --json comments,reviews

# Get detailed review comments with file/line info
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments
```

### Step 2: Categorize Comments

Group comments by type:
- **Actionable**: Requests for code changes (bugs, improvements, style)
- **Questions**: Requests for clarification or explanation
- **Suggestions**: Optional improvements to consider
- **Resolved**: Already addressed or outdated

### Step 3: Present Comments for User Approval

For each actionable comment, present:
1. The comment text and context
2. The file and line(s) referenced
3. Your proposed approach to address it
4. Ask for user approval before implementing

**Format:**
```
## Comment #1 from @reviewer
**File:** path/to/file.go:42-45
**Type:** Bug fix / Improvement / Style

**Comment:**
> [Original comment text]

**Proposed approach:**
[Your analysis and plan]

Approve this change? [y/n/skip]
```

### Step 4: Implement Approved Changes

For each approved comment, use the `pr-comment-implementer` agent:

```
Spawn pr-comment-implementer agent with:
- The specific comment to address
- File and line context
- Your proposed approach
- User's approval confirmation
```

### Step 5: Summary Report

After addressing all approved comments:
1. List all changes made
2. List any skipped comments and why
3. Suggest replying to reviewers

## Comment Analysis Guidelines

### Identifying Comment Intent

| Signal | Type | Action |
|--------|------|--------|
| "Please fix...", "This should be..." | Bug/Required | Must address |
| "Consider...", "You might want to..." | Suggestion | Present as optional |
| "Why did you...?", "Can you explain...?" | Question | Add comment/docs or reply |
| "nit:", "minor:" | Style | Low priority, batch together |
| "LGTM", "Looks good" | Approval | No action needed |

### Handling Disagreements

If you believe a comment shouldn't be implemented:
1. Explain your reasoning to the user
2. Let them decide whether to implement or reply with explanation
3. Never ignore comments without user consent

## Example Session

```
User: /pr-address-comments 123

Claude: Fetching comments for PR #123...

Found 4 review comments:

## Comment #1 from @alice (Actionable)
**File:** pkg/service/handler.go:52
**Type:** Bug fix

> This error should be wrapped with context

**Proposed approach:**
Change `return err` to `return fmt.Errorf("handle request: %w", err)`

Approve this change? [y/n/skip]

User: y

Claude: [Spawns pr-comment-implementer to make the change]

Done. Moving to next comment...

## Comment #2 from @bob (Question)
**File:** pkg/config/config.go:15

> Why is this value hardcoded?

**Proposed approach:**
Add a comment explaining this is a sensible default that can be overridden via env var.

Approve this change? [y/n/skip]
```

## Error Handling

- **PR not found**: Verify PR number and repo
- **No comments**: Report "No review comments to address"
- **Permission denied**: Check gh auth status
- **Merge conflicts**: Warn user and suggest rebasing first

## Integration

This skill works with:
- `pr-comment-implementer` agent: Implements individual approved changes
- `git` agent: Can commit changes after implementation
- `pr-reviewer` agent: Can be used to self-review changes before committing
