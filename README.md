# claude-setup

A portable snapshot of a Claude Code setup — agents, skills, rules, and tools —
ready to drop into `~/.claude/` on a fresh machine.

This is a **one-time export**, not a live sync. Clone it, run the installer, and
you get the same agents and skills on the new machine.

## What's inside

```
claude-setup/
├── agents/                   # subagent definitions (.claude/agents)
├── skills/                   # skills (.claude/skills)
├── rules/                    # global rules (.claude/rules)
├── tools/                    # helper scripts (.claude/tools)
├── plugins.md                # list of marketplace plugins to reinstall
├── mcp-servers.example.json  # MCP server config template (fill in your own)
└── install.sh                # copies everything into ~/.claude
```

### Agents (8)
`code-reviewer`, `docs-fact-checker`, `docu-writer`, `pr-ci-fixer`,
`pr-comment-implementer`, `pr-reviewer`, `requirements-analyst`, `tester`

### Skills (8)
`agent-writer`, `croner`, `golang`, `grill-me`, `pr-address-comments`,
`skill-creator`, `ui-ux-pro-max`, `use-modern-go`

### Rules (1)
`git-safety-standards` — safe-git practices (no force-push, branch naming,
credential scanning, PR merge strategy).

### Tools
`page-reader.mjs` — a Firefox/Playwright web-page text extractor. Run
`npm install` inside `tools/` to pull its dependency.

## Install

```bash
git clone https://github.com/NoobCoder1209/claude-setup.git
cd claude-setup
./install.sh
```

The installer copies `agents/`, `skills/`, `rules/`, and `tools/` into
`~/.claude/`. If those directories already exist, it backs them up first
(`<dir>.bak-<timestamp>`) so nothing is lost. It does not touch your
`~/.claude.json`, MCP servers, or plugins.

### Plugins (manual)
See [`plugins.md`](plugins.md) for the marketplace plugins and their install
commands.

### MCP servers (manual)
See [`mcp-servers.example.json`](mcp-servers.example.json) for a config
template. Fill in your own paths/credentials and merge it into your
`~/.claude.json` under `mcpServers`.

### Tools dependencies (manual)
```bash
cd ~/.claude/tools && npm install
```
