#!/bin/bash
# validate-config.sh — Checks config.json against the live wiki API
#
# Usage: bash scripts/validate-config.sh [path/to/config.json]
#
# Defaults to ./config.json if no path is given.

set -euo pipefail

CONFIG_PATH="${1:-config.json}"
ERRORS=0

# ANSI colour codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass()  { echo -e "  ${GREEN}[PASS]${NC} $1"; }
warn()  { echo -e "  ${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "  ${RED}[FAIL]${NC} $1"; ERRORS=$((ERRORS + 1)); }

echo "==> Validating config: $CONFIG_PATH"
echo ""

# ------------------------------------------------------------------
# 1. File exists and is valid JSON
# ------------------------------------------------------------------
echo "--- Step 1: File check ---"

if [ ! -f "$CONFIG_PATH" ]; then
  fail "File not found: $CONFIG_PATH"
  echo ""
  echo "Config check failed with $ERRORS error(s)."
  exit 1
fi
pass "File exists: $CONFIG_PATH"

if ! jq empty "$CONFIG_PATH" 2>/dev/null; then
  fail "Invalid JSON in $CONFIG_PATH"
  echo ""
  echo "Config check failed with $ERRORS error(s)."
  exit 1
fi
pass "Valid JSON"

# ------------------------------------------------------------------
# 2. Required top-level fields
# ------------------------------------------------------------------
echo ""
echo "--- Step 2: Top-level fields ---"

DEFAULT_WIKI=$(jq -r '.defaultWiki // empty' "$CONFIG_PATH")
if [ -z "$DEFAULT_WIKI" ]; then
  fail "Missing 'defaultWiki' field"
else
  pass "defaultWiki: $DEFAULT_WIKI"
fi

WIKI_COUNT=$(jq '.wikis | length' "$CONFIG_PATH")
if [ "$WIKI_COUNT" -eq 0 ]; then
  fail "No wikis configured under 'wikis' key"
else
  pass "Found $WIKI_COUNT wiki(s) configured"
fi

# ------------------------------------------------------------------
# 3. Per-wiki validation
# ------------------------------------------------------------------
echo ""
echo "--- Step 3: Per-wiki fields ---"

jq -r '.wikis | to_entries[] | .key' "$CONFIG_PATH" | while read -r wiki_key; do
  echo "  Wiki: $wiki_key"

  sitename=$(jq -r ".wikis[\"$wiki_key\"].sitename // empty" "$CONFIG_PATH")
  server=$(jq -r ".wikis[\"$wiki_key\"].server // empty" "$CONFIG_PATH")
  # articlepath and scriptpath are legitimately empty strings on root-path
  # wikis (e.g. wiki.fosscell.org), so check key presence, not truthiness.
  has_articlepath=$(jq -r ".wikis[\"$wiki_key\"] | has(\"articlepath\")" "$CONFIG_PATH")
  has_scriptpath=$(jq -r ".wikis[\"$wiki_key\"] | has(\"scriptpath\")" "$CONFIG_PATH")
  articlepath=$(jq -r ".wikis[\"$wiki_key\"].articlepath // \"\"" "$CONFIG_PATH")
  scriptpath=$(jq -r ".wikis[\"$wiki_key\"].scriptpath // \"\"" "$CONFIG_PATH")
  is_private=$(jq -r ".wikis[\"$wiki_key\"].private // false" "$CONFIG_PATH")

  # Check required fields
  if [ -z "$sitename" ]; then
    echo -e "    ${RED}[FAIL]${NC} Missing sitename"
  else
    echo -e "    ${GREEN}[PASS]${NC} sitename: $sitename"
  fi

  if [ -z "$server" ]; then
    echo -e "    ${RED}[FAIL]${NC} Missing server"
  else
    echo -e "    ${GREEN}[PASS]${NC} server: $server"
  fi

  if [ "$has_articlepath" = "true" ]; then
    echo -e "    ${GREEN}[PASS]${NC} articlepath: '${articlepath}' (empty = pages served at site root)"
  else
    echo -e "    ${RED}[FAIL]${NC} Missing articlepath key"
  fi

  if [ "$has_scriptpath" = "true" ]; then
    echo -e "    ${GREEN}[PASS]${NC} scriptpath: '${scriptpath}' (empty = api.php at site root)"
  else
    echo -e "    ${RED}[FAIL]${NC} Missing scriptpath key"
  fi

  # Warn if no auth configured for a private wiki
  token=$(jq -r ".wikis[\"$wiki_key\"].token // empty" "$CONFIG_PATH")
  username=$(jq -r ".wikis[\"$wiki_key\"].username // empty" "$CONFIG_PATH")
  password=$(jq -r ".wikis[\"$wiki_key\"].password // empty" "$CONFIG_PATH")

  if [ "$is_private" = "true" ]; then
    if [ -z "$token" ] && { [ -z "$username" ] || [ -z "$password" ]; }; then
      echo -e "    ${YELLOW}[WARN]${NC} Private wiki but no auth configured (token or username+password)"
    else
      echo -e "    ${GREEN}[PASS]${NC} Auth configured for private wiki"
    fi
  fi

  # ------------------------------------------------------------------
  # 4. Connectivity check
  # ------------------------------------------------------------------
  echo ""
  echo "--- Step 4: Connectivity check for $wiki_key ---"

  API_URL="$server${scriptpath}/api.php"
  if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$API_URL?action=query&meta=siteinfo&format=json" | grep -q "200"; then
    echo -e "    ${GREEN}[PASS]${NC} API reachable: $API_URL"

    SITENAME_FROM_API=$(curl -s "$API_URL?action=query&meta=siteinfo&format=json" | jq -r '.query.general.sitename // "unknown"')
    echo -e "    ${GREEN}[INFO]${NC} Remote sitename: $SITENAME_FROM_API"
  else
    echo -e "    ${YELLOW}[WARN]${NC} API not reachable at $API_URL (network or DNS issue)"
  fi

  # ------------------------------------------------------------------
  # 5. Authenticated rights check
  # ------------------------------------------------------------------
  # Reachability alone doesn't tell you whether the configured bot account can
  # actually edit. This logs in with username/password and compares the
  # account's rights against what editing this wiki requires, so a permission
  # gap (e.g. Template namespace needing editinterface here, see
  # rules/templates.md) shows up before an agent hits it mid-task.
  if [ -n "$username" ] && [ -n "$password" ]; then
    echo ""
    echo "--- Step 5: Authenticated rights check for $wiki_key ---"

    COOKIE_JAR="$(mktemp)"

    LOGIN_TOKEN=$(curl -s -c "$COOKIE_JAR" --connect-timeout 5 \
      "$API_URL?action=query&meta=tokens&type=login&format=json" \
      | jq -r '.query.tokens.logintoken // empty')

    if [ -z "$LOGIN_TOKEN" ]; then
      echo -e "    ${YELLOW}[WARN]${NC} Could not fetch a login token; skipping rights check"
    else
      LOGIN_RESULT=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" --connect-timeout 5 \
        --data-urlencode "action=login" \
        --data-urlencode "lgname=$username" \
        --data-urlencode "lgpassword=$password" \
        --data-urlencode "lgtoken=$LOGIN_TOKEN" \
        --data-urlencode "format=json" \
        "$API_URL" | jq -r '.login.result // "Failed"')

      if [ "$LOGIN_RESULT" != "Success" ]; then
        echo -e "    ${RED}[FAIL]${NC} Login failed ($LOGIN_RESULT) — check username/password in .env or config.json"
      else
        RIGHTS=$(curl -s -b "$COOKIE_JAR" --connect-timeout 5 \
          "$API_URL?action=query&meta=userinfo&uiprop=rights&format=json" \
          | jq -r '.query.userinfo.rights[]?')

        echo -e "    ${GREEN}[PASS]${NC} Logged in as $username"

        REQUIRED_RIGHTS=("edit" "createpage" "editinterface")
        for right in "${REQUIRED_RIGHTS[@]}"; do
          if echo "$RIGHTS" | grep -qx "$right"; then
            echo -e "    ${GREEN}[PASS]${NC} Has right: $right"
          else
            echo -e "    ${YELLOW}[WARN]${NC} Missing right: $right (editinterface is required to edit Template: pages on this wiki)"
          fi
        done
      fi
    fi
    rm -f "$COOKIE_JAR"
  else
    echo ""
    echo -e "    ${YELLOW}[WARN]${NC} No username/password configured — skipping authenticated rights check (Step 5)"
  fi
done

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
echo ""
echo "==="
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}Config validation passed.${NC}"
else
  echo -e "${RED}Config validation finished with $ERRORS error(s).${NC}"
  exit 1
fi
