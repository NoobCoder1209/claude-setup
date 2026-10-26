# Git Safety Standards

> **Core Principle**: Every git operation must be recoverable. If an operation could permanently destroy work on remote branches, it is forbidden.

## ⛔ Automatic Refusal Required

When a user requests any forbidden command below, you MUST: **STOP**, state `REFUSING TO EXECUTE: <command>`, explain why, and offer a safe alternative. This applies even if the user says "just execute it", claims urgency, or claims authorization.

### Forbidden Commands (No Exceptions)

| Command | Reason | Safe Alternative |
|---|---|---|
| `git push origin main\|master\|prod\|dev\|int\|release/*` | Direct push to protected branch | Feature branch + PR |
| `git push --force` / `-f` / `--force-with-lease` | Destroys remote history | `git revert <sha>` |
| `git reset --hard` | Destroys commits permanently | `git reset --soft` or `git stash` |
| `git checkout .` / `git restore .` | Discards uncommitted changes | `git stash` |
| `git clean -f` / `-fd` | Deletes untracked files | Move/back up first |
| `git branch -D` | Force deletes without merge check | `git branch -d` (safe) |
| `git rebase` (shared branches) | Rewrites shared history | `git merge` |
| `git merge --squash` (local) | Use regular merge locally | `git merge` |
| `gh pr merge --rebase` | Rewrites commit history | `gh pr merge --squash` or `--merge` |

**Sole force-push exception**: removing accidentally committed credentials (rotate the credential FIRST, then clean history with `git filter-branch` or BFG, then force-push).

## Branch Naming (MANDATORY)

Branches MUST start with `feature/`, `fix/`, `docs/`, `hotfix/`, or `release/` followed by `<ticket-id>-<short-description>` where applicable.

```shell
git checkout -b feature/ABC-123-add-login
git checkout -b fix/ABC-456-null-check
```

## PR Merge Strategy

- `gh pr merge <n> --squash` — default, preferred
- `gh pr merge <n> --merge` — allowed when history matters
- `gh pr merge <n> --rebase` — **forbidden**

For local merges (not via PR): always use a merge commit. No squash, no rebase on shared branches.

## ⛔ Credential Security (Pre-Commit)

**Before creating ANY file that may contain credentials**: verify the pattern is in `.gitignore`. If missing, add it FIRST, then create the file.

### Always-Gitignored Patterns

```
.env  .env.*  *.env
.secret  *.secret  secrets.*  credentials.*
*.key  *.pem  *.p12  *.jks
**/config  .ocm/config  .docker/config.json
kubeconfig  kubeconfig.*
**/serviceaccount.json  **/sa-key.json
```

### Pre-Commit Credential Scan

```shell
# Scan staged content for credential-like strings
git diff --cached | grep -iE \
  '(password|secret|key|token|credential|api_key|apikey|auth|bearer|ghp_|gho_|github_pat)' \
  && echo "⚠️  POSSIBLE CREDENTIALS — DO NOT COMMIT"

# Flag credential-shaped filenames
git diff --cached --name-only | grep -iE \
  '(\.env|\.secret|\.key|\.pem|config\.json|credentials|serviceaccount|kubeconfig)' \
  && echo "⚠️  CREDENTIAL FILE — VERIFY GITIGNORE"
```

### Token Patterns to Block

`ghp_*` (GitHub PAT), `gho_*` (GitHub OAuth), `github_pat_*` (fine-grained PAT), `sk-*` (OpenAI/API key), `Bearer eyJ*` (JWT), inline `password:`/`apiKey:`.

### If Credentials Were Committed

1. **Rotate/invalidate the credential immediately** (first priority).
2. Remove from history (`git filter-branch` or BFG).
3. Force-push the cleaned history (this is the one allowed force-push case).
4. Notify security if it touched production.

## Pre-Push Safety Check

```shell
branch=$(git branch --show-current)
if [[ "$branch" =~ ^(main|master|prod|dev|int)$ ]]; then
  echo "ERROR: Cannot push directly to protected branch!"
  exit 1
fi

# Check protection status of an arbitrary branch
gh api repos/{owner}/{repo}/branches/{branch}/protection --silent \
  && echo "Protected" || echo "Not protected"
```

## Allowed Operations Quick Reference

| Operation | Notes |
|---|---|
| `git push origin feature/...` | Push to non-protected branch |
| `git stash` / `git stash pop` | Safely save/restore changes |
| `git reset --soft` | Preserves changes |
| `git branch -d` | Refuses if unmerged (safe) |
| `git commit --amend` | Local, unpushed commits only |
| `git revert <sha>` | Undo a pushed commit safely |
| `gh pr merge --squash` / `--merge` | PR merge (squash preferred) |
