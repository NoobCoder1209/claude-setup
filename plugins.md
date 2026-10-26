# Plugins

These plugins are installed from the official Claude Code marketplace. They are
**not** vendored in this repo (they are git-managed checkouts that update
themselves). Reinstall them on a new machine with the commands below.

## Add the marketplace (if not already added)

```
/plugin marketplace add anthropics/claude-plugins
```

## Install the plugins

Run each in Claude Code:

```
/plugin install chrome-devtools-mcp@claude-plugins-official
/plugin install frontend-design@claude-plugins-official
/plugin install superpowers@claude-plugins-official
/plugin install playwright@claude-plugins-official
/plugin install github@claude-plugins-official
/plugin install skill-creator@claude-plugins-official
/plugin install supabase@claude-plugins-official
```

| Plugin | What it does |
|---|---|
| `chrome-devtools-mcp` | Chrome DevTools MCP — browser automation, debugging, network/perf inspection |
| `frontend-design` | Guidance for distinctive, intentional frontend visual design |
| `superpowers` | Skills framework — brainstorming, TDD, systematic debugging, plan execution, and more |
| `playwright` | Playwright browser automation MCP |
| `github` | GitHub integration |
| `skill-creator` | Create, evaluate, and optimize skills |
| `supabase` | Supabase MCP |
