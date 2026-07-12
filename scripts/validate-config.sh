#!/bin/bash
# validate-config.sh - thin wrapper. The validator lives in validate-config.js
# so Windows and Unix run the identical checks. See README.md.
#
# Usage: bash scripts/validate-config.sh [path/to/config.json]
set -euo pipefail

if ! command -v node &> /dev/null; then
  echo "Node.js is required (version 22.12 or newer)." >&2
  echo "Install it from https://nodejs.org and try again." >&2
  exit 1
fi

if [ $# -ge 1 ]; then
  export CONFIG="$1"
fi

exec node "$(dirname "$0")/validate-config.js"
