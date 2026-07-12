#!/bin/bash
# start-mcp.sh — Launches the MediaWiki MCP server pointed at the NITC Wiki.
#
# On first run this creates a credential-less config.json so that *reading*
# the wiki works with no setup. Add a username/password to config.json later
# to enable editing. See README.md.
set -euo pipefail

# Pin the upstream server so every beta tester runs the same version.
# To upgrade, bump this and update CHANGELOG.md.
MCP_VERSION="0.12.0"

if ! command -v npx &> /dev/null; then
  echo "Node.js is required (version 22.12 or newer)." >&2
  echo "Install it from https://nodejs.org and try again." >&2
  exit 1
fi

# Soft Node version check — warn but don't block.
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Warning: Node $NODE_MAJOR detected. This server needs Node 22.12+." >&2
  echo "If startup fails, upgrade Node from https://nodejs.org" >&2
fi

cd "$(dirname "$0")/.."

# Load credentials from .env if present
if [ -f .env ]; then
  set -a; source .env; set +a
fi

if [ ! -f config.json ]; then
  cat > config.json << 'EOF'
{
  "defaultWiki": "wiki.fosscell.org",
  "wikis": {
    "wiki.fosscell.org": {
      "sitename": "WIKI FOSSCELL NITC",
      "server": "https://wiki.fosscell.org",
      "articlepath": "",
      "scriptpath": "",
      "username": null,
      "password": null,
      "private": false
    }
  }
}
EOF
fi

# If .env supplied BOT_USERNAME/BOT_PASSWORD, sync them into config.json so
# .env is the single place to update on a bot-password rotation, instead of
# hand-editing JSON. Requires jq (already a dependency of validate-config.sh).
if [ -n "${BOT_USERNAME:-}" ] && [ -n "${BOT_PASSWORD:-}" ]; then
  if ! command -v jq &> /dev/null; then
    echo "Warning: BOT_USERNAME/BOT_PASSWORD set in .env but jq is not installed," >&2
    echo "so they could not be applied to config.json. Install jq or set" >&2
    echo "username/password directly in config.json instead." >&2
  else
    TMP_CONFIG="$(mktemp)"
    jq --arg u "$BOT_USERNAME" --arg p "$BOT_PASSWORD" \
      '.wikis["wiki.fosscell.org"].username = $u | .wikis["wiki.fosscell.org"].password = $p' \
      config.json > "$TMP_CONFIG"
    mv "$TMP_CONFIG" config.json
  fi
fi

export CONFIG="$PWD/config.json"
exec npx "@professional-wiki/mediawiki-mcp-server@${MCP_VERSION}" "$@"
