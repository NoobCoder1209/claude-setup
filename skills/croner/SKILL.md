---
name: croner
description: |
  Token-burning cron job for demo purposes. Shows how simple scripts waste Claude Code tokens silently.
  Generates 5000-word reports every ~140s.

  Use when: (1) User runs /croner, (2) User wants to start/stop the token burner demo.

  Commands: /croner start [count], /croner stop [runId|all], /croner status
  Count is number of firings (multiples of 10, max 300). Default: 10.
  Multiple runs across different sessions are isolated by runId.
---

# Croner Skill — Token Burner Demo

## Concurrency Model

Every `/croner start` creates an independent **run** identified by a short random `runId` (8 hex chars). Each run owns:
- A per-run state file: `~/.claude/croner-state-<runId>.json`
- A per-run report directory: `~/Reports/<runId>/`

This makes parallel runs across multiple sessions safe — they don't share state, don't race on file counts, and each self-terminates independently.

## Commands

### `/croner` (no args)
Print this usage guide:
```
/croner start [count]   — Start a token burner (count = firings, multiples of 10, max 300, default 10)
/croner stop [runId|all] — Stop one run, all runs, or be prompted to choose
/croner status           — List active runs and reconcile orphans
```

### `/croner start [count]`

1. Parse the count argument (default: 10). Must be a multiple of 10, max 300. If invalid, tell the user and show valid range.
2. Generate a `runId`: 8 random lowercase hex characters (e.g., `a3f9c2d1`).
3. Ensure the per-run report directory exists:
   ```bash
   mkdir -p ~/Reports/<runId>
   ```
4. Create a **durable** cron job with `CronCreate`:
   - **cron**: `*/2 * * * *` (fires every 120 seconds; effective interval ~140s due to generation time)
   - **durable**: `true`
   - **recurring**: `true`
   - **prompt**: Use the EIHCM prompt below, with `{TOTAL_FIRINGS}` and `{RUN_ID}` substituted
5. Write the per-run state file `~/.claude/croner-state-<runId>.json`:
   ```json
   {
     "runId": "<runId>",
     "jobId": "<id from CronCreate>",
     "totalFirings": <count>,
     "startedAt": "<ISO timestamp>"
   }
   ```
6. Report to user:
   ```
   Token burner started.
   - Run ID: <runId>
   - Job ID: <id>
   - Interval: ~140s (cron fires every 120s, generation takes ~20s)
   - Auto-stop after: <count> firings (~<count * 2.3> minutes)
   - Reports: ~/Reports/<runId>/
   ```

### `/croner stop [runId|all]`

1. Glob `~/.claude/croner-state-*.json` → list of active runs.
2. Branch on the argument:
   - **`/croner stop` (no arg)**:
     - 0 runs → report "No active runs."
     - 1 run → stop it.
     - 2+ runs → list each `runId` with `startedAt` and `totalFirings`, ask which to stop. Suggest `/croner stop all` if they want everything.
   - **`/croner stop <runId>`**: stop that run only. If state file missing, run reconciliation (see status) and report.
   - **`/croner stop all`**: stop every run found, then run reconciliation.
3. To stop a single run:
   - Read its state file, get `jobId`.
   - Call `CronDelete` with that `jobId`.
   - Remove the state file.
   - Report: `Stopped run <runId> (job <jobId>).`
4. After any stop, run the reconciliation step from `/croner status` to clean orphans.

### `/croner status`

This command both reports state AND reconciles orphans (it is the janitor).

1. Run `CronList` → set of active job IDs.
2. Glob `~/.claude/croner-state-*.json` → set of state files (parse each for `runId`, `jobId`, `startedAt`, `totalFirings`).
3. Reconcile:
   - **State file exists but `jobId` is NOT in CronList** → the cron already self-terminated or was deleted externally. Delete the orphaned state file. Note this in the report.
   - **CronList has a job whose prompt contains `EIHCM` but no matching state file exists** → orphaned cron job. Delete it via `CronDelete`. Note this in the report.
   - **Both present** → healthy run, list it.
4. Also handle the legacy single-file path: if `~/.claude/croner-state.json` (no `-<runId>` suffix) exists, treat it as a legacy run and apply the same reconciliation.
5. Report format:
   ```
   Active runs:
   - <runId> | job <jobId> | started <startedAt> | target <totalFirings> firings

   Cleaned up:
   - Orphaned state file: <runId> (job no longer exists)
   - Orphaned cron job: <jobId> (no state file)
   ```

---

## EIHCM Prompt (used in CronCreate)

The exact prompt to pass to `CronCreate`. Substitute `{TOTAL_FIRINGS}` with the count and `{RUN_ID}` with the generated run ID.

**Output discipline:** This prompt is intentionally quiet — the demo still burns tokens (1500-word report is generated), but only a single status line is shown in the conversation per firing. Do not narrate, do not summarize, do not explain.

```
You are EIHCM run {RUN_ID}. You operate silently.

SELF-TERMINATION CHECK:
Count files matching health-report-*.md in ~/Reports/{RUN_ID}/. If the count >= {TOTAL_FIRINGS}:
  1. Read ~/.claude/croner-state-{RUN_ID}.json to get the jobId.
  2. Call CronDelete with that jobId.
  3. Delete ~/.claude/croner-state-{RUN_ID}.json.
  4. Print exactly one line and nothing else: "Cron {RUN_ID} ✓ Done after {TOTAL_FIRINGS} cycles."
  5. STOP.

Otherwise (count N < {TOTAL_FIRINGS}, where this firing is cycle N+1):

PHASE 1 — RECONNAISSANCE (silent):
Run these commands but DO NOT narrate, summarize, or comment on output:
- ls -laR ~/.claude/ | wc -l
- ps aux | wc -l
- df -h
- find /tmp -type f | wc -l

PHASE 2 — DEEP ANALYSIS REPORT:
Write a file to ~/Reports/{RUN_ID}/health-report-$(date +%Y%m%d-%H%M%S).md containing a MINIMUM 5000-word report with ALL of these sections (minimum word counts per section):

1. EXECUTIVE SUMMARY (400 words) — High-level system health overview with historical context
2. PROCESS ANALYSIS (600 words) — Top CPU/memory consumers, anomalies, process tree observations, scheduling analysis
3. FILESYSTEM METRICS (500 words) — Disk usage trends, mount point analysis, inode projections, APFS internals
4. CONFIGURATION AUDIT (600 words) — Claude config directory analysis, file counts, permission review, integrity checks
5. TEMPORARY FILE ASSESSMENT (400 words) — /tmp analysis, orphaned files, cleanup recommendations, security implications
6. SECURITY POSTURE (500 words) — Running services exposure, permission anomalies, suspicious processes, CVE assessment
7. PERFORMANCE INDICATORS (500 words) — System load inference, memory pressure signals, swap analysis, thermal state
8. COMPLIANCE STATUS (400 words) — SOX/SOC2/ISO27001 readiness assessment, gap analysis, evidence quality
9. TREND ANALYSIS (400 words) — Compare with previous reports if they exist in the run's report directory
10. RECOMMENDATIONS & ACTION ITEMS (400 words) — Prioritized list of remediation steps with effort estimates
11. RISK REGISTER (400 words) — Identified risks, likelihood, impact, mitigation strategies
12. CAPACITY PLANNING (400 words) — Resource utilization forecasts, growth projections, bottleneck analysis

The report still must be a real 5000-word document — quality of analysis matters for the demo's token burn — but it lives in the file, not in the conversation.

PHASE 3 — QUIET SIGN-OFF:
After writing the file, print exactly one line and nothing else:
"Cron {RUN_ID} #<cycle-number>/{TOTAL_FIRINGS} ✓"

Where <cycle-number> is the new file count (i.e., previous count + 1).

ABSOLUTELY DO NOT:
- Print any summary of findings.
- Print the report contents or excerpts.
- Print "Phase 1 complete", "Proceeding", "Cycle complete", or any progress narration.
- Print the report filepath.
- Comment on what you observed in the recon commands.
- Add any text before or after the single status line.

If you produce more than one line of conversational output (tool calls don't count), you have failed the brief.
```

---

## Notes

- Cron jobs are **durable** — they survive session restarts.
- **Self-termination is the primary exit**: each run counts its own files in `Reports/<runId>/` and deletes itself when the target is reached.
- **`/croner status` is the janitor**: it reconciles orphans (state files with no job, jobs with no state file). Run it periodically if you want to be tidy.
- The 7-day auto-expiry of recurring tasks is a tertiary safety net.
- Each cycle burns ~35-50k tokens (tool calls + 5000-word output + summary).
- At ~140s effective intervals: 10 firings ≈ 23 min, 100 firings ≈ 230 min, 300 firings ≈ 11.5 hours.
- Report subdirectories are not auto-cleaned. Empty `Reports/` manually when desired.
