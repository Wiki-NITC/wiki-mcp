---
name: rules-drift-auditor
description: Compare this repo's documented claims (templates, categories, Cargo tables, task statuses, namespaces, forms) against the live NITC Wiki and report drift as proposed repo edits. Use when asked to verify the rules are current, audit repo-vs-wiki drift, or refresh the documentation after wiki changes.
---

# Rules Drift Auditor

This repo documents live wiki state — template inventories, category names,
Cargo tables, accepted task statuses, the namespace map. The wiki keeps
moving; the docs don't. Past drift has included a category table missing
live categories, a skill hardcoding a Cargo table that no longer existed,
and a 669-line template catalogue nothing referenced. This skill makes the
docs self-maintaining.

Output is **proposed repo edits** (diffs for the human to apply or approve),
never wiki edits.

---

## What to compare

| Repo claim | Live source | How |
|---|---|---|
| `rules/templates.md` template tables | `Template:` namespace | `search-page-by-prefix(prefix="", namespace=10, limit=500)`; flag documented-but-missing and notable-but-undocumented templates |
| `rules/categories.md` top-level table | `Category:` namespace | `search-page-by-prefix` per documented name (namespace 14); flag missing ones; spot-check prominent live categories absent from the table |
| Cargo tables referenced anywhere in `rules/` or `.agents/` | live table list | `cargo-list-tables` (or `{{#cargo_query:}}` probe per table via `parse-wikitext` if restricted); flag references to nonexistent tables |
| `rules/task-board.md` status/priority sets | `Template:Task` source + live data | `get-page("Template:Task")` for the declared sets; `group by=status` query for values actually in use |
| `rules/namespaces.md` namespace map | `get-site-info` | diff IDs and names; check the year-namespace range is still current |
| `rules/structured-data.md` forms list | `Form:` namespace | `search-page-by-prefix(prefix="", namespace=106)` |
| The wiki's condensed rulebook `WIKI FOSSCELL NITC:MCP Rules` (served to every agent via the MCP handshake) | this repo's AGENTS.md + rules/ | `get-page` it and diff against the repo: taxonomy values, naming conventions, never-do list, summary format must all match; flag any statement the repo no longer makes |
| Version pin in `scripts/start-mcp.js` | upstream npm/GitHub releases | web check of `@professional-wiki/mediawiki-mcp-server` releases; report if the pin lags |
| "Uploads disabled" claims | live config / a `whoami includeRights` check | if upload rights appear, flag every doc that says disabled |

## Workflow

1. Run the comparisons above (read-only wiki access; repo file reads).
2. For each mismatch record: repo file + line, what the repo says, what the
   wiki says, proposed edit.
3. Deliver a single drift report. High-urgency items (a skill referencing a
   dead table, a category that no longer exists) go first.
4. If asked, apply the approved repo edits and update `CHANGELOG.md`.

## Guardrails

- **Repo edits only** — if the *wiki* looks wrong (e.g. an inverted category
  hierarchy), flag it for a human/admin, don't fix the wiki from here.
- Don't churn the docs for cosmetic differences; report only drift that
  would mislead an agent.
- Live wiki wins by default; where the repo intentionally documents policy
  rather than state (e.g. "prefer X for new pages"), note the difference
  instead of "fixing" it.

## Authoritative references

- `rules/agent-conventions.md` §6 — extension-tool failure mode (affects the
  Cargo comparison).
- `rules/structured-data.md` — query technique.
- `CHANGELOG.md` — where accepted doc refreshes get recorded.
