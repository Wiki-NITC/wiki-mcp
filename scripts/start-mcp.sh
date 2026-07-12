#!/bin/bash
# start-mcp.sh - thin wrapper. All launcher logic lives in start-mcp.js so
# Windows, macOS, and Linux run the identical code path. See README.md.
set -euo pipefail

if ! command -v node &> /dev/null; then
  echo "Node.js is required (version 22.12 or newer)." >&2
  echo "Install it from https://nodejs.org and try again." >&2
  exit 1
fi

exec node "$(dirname "$0")/start-mcp.js" "$@"
