#!/usr/bin/env bash
#
# install.sh — drop this Claude setup into ~/.claude on a new machine.
#
# Copies agents, skills, rules, and tools into your ~/.claude directory.
# Existing files with the same name are backed up to ~/.claude/<dir>.bak-<timestamp>
# before being overwritten, so nothing is silently lost.
#
# It does NOT touch your ~/.claude.json, MCP servers, or installed plugins —
# see plugins.md and mcp-servers.example.json for those (manual steps).

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${CLAUDE_HOME:-$HOME/.claude}"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "Source:      $SRC"
echo "Destination: $DEST"
echo ""

mkdir -p "$DEST"

copy_dir() {
  local name="$1"
  [ -d "$SRC/$name" ] || return 0
  if [ -d "$DEST/$name" ]; then
    echo "Backing up existing $name -> $name.bak-$STAMP"
    cp -R "$DEST/$name" "$DEST/$name.bak-$STAMP"
  fi
  mkdir -p "$DEST/$name"
  cp -R "$SRC/$name/." "$DEST/$name/"
  echo "Installed $name/"
}

copy_dir agents
copy_dir skills
copy_dir rules
copy_dir tools

echo ""
echo "Done."
echo ""
echo "Next steps (manual):"
echo "  1. Install plugins          -> see plugins.md"
echo "  2. Configure MCP servers    -> see mcp-servers.example.json"
echo "  3. Install tools deps        -> cd \"$DEST/tools\" && npm install"
