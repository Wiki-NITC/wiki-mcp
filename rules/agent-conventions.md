# Agent Conventions

Cross-cutting operating rules for every AI agent working on the NITC Wiki
through the MCP server. Skills and other rules files link here instead of
restating these rules. If another document conflicts with this one,
`Agents.md` takes precedence, then this file.

---

## 1. Edit summaries

Every edit, creation, or upload uses this summary format:

```
Bot: <action> - <agent-name>
```

Examples:

| Action | Summary |
|---|---|
| Create a page | `Bot: Create page "2026:Ragam" - Claude` |
| Fix content | `Bot: Fix typo in "FOSSCell/About" - Cursor` |
| Create a task | `Bot: Create task "<title>" - Claude` |
| Claim a task | `Bot: Claim task - Claude` |
| Update task status | `Bot: Mark <status> - Claude` |

Plain ASCII only: use a hyphen, not an em dash (older docs used an em dash;
the hyphen form is now canonical).

> The MCP server automatically appends `(via <tool> on MediaWiki MCP Server)`
> to every summary. Do not add anything like that yourself.

---

## 2. Preview before saving

Every save is a permanent revision in the page history. Noisy histories bury
real changes and waste reviewer time.

1. **Render risky wikitext with `parse-wikitext` before saving** - new
   templates calls, tables, styling, Cargo queries, anything you are not
   certain renders correctly.
2. **Iterate in preview, not in saved revisions.** Adjust styling, layout,
   and formatting against `parse-wikitext` output until it is right, then
   save once.
3. **One revision per logical change.** Batch related cosmetic changes into
   a single save.

Anti-example (really happened): an agent saved about a dozen consecutive
revisions on one page while experimenting with table border and background
colors. Every experiment is now a permanent revision. All of that iteration
belonged in `parse-wikitext`.

---

## 3. Handling write errors

MCP tool errors come in seven categories. Required responses:

| Category | Meaning | What to do |
|---|---|---|
| `not_found` | Page or title does not exist | Check the title; use `create-page` for new pages |
| `permission_denied` | Account lacks a required right | Stop. Report which right is missing. Do not retry |
| `invalid_input` | Malformed request | Fix the parameters; retry once |
| `conflict` | Page changed since your `latestId` | Re-fetch with `get-page(metadata=true)`, re-apply your change on the new revision, retry once. If it conflicts again, stop and surface to the human |
| `authentication` | Credentials invalid or expired | Stop. Point the operator at `scripts/validate-config` and `docs/rotating-credentials.md` |
| `rate_limited` | Too many requests | Honor the reported wait time, then continue more slowly |
| `upstream_failure` | Wiki unreachable or server error | Retry up to 3 times with increasing delay; then stop and report |

**Always pass `latestId` on `update-page`** (get it from `get-page` with
`metadata=true`). Without it, concurrent edits are silently clobbered.

Never silently swallow an error. Every error gets logged in the agent's
output.

---

## 4. Dates

Never copy a date out of a documentation example. Where this repo's docs and
skills need "today", they write `<TODAY>`:

- Resolve `<TODAY>` from your environment (the session date) at run time.
- Deadlines, `created` fields, and overdue queries always use the resolved
  date in ISO 8601 (`YYYY-MM-DD`).

If you find a literal date in an example, treat it as a placeholder shape,
never as a value to reuse.

---

## 5. Finding the current roster

Team rosters live under `WIKI FOSSCELL NITC:Wiki Admin Team/<academic-year>`
(e.g. `.../2026-27`). Never hardcode the year:

1. `search-page-by-prefix(prefix="Wiki Admin Team/", namespace=4)`
2. Pick the latest academic year from the results.
3. Match display names to wiki usernames case-insensitively, and treat
   spaces and underscores as interchangeable (`H R Soorya Dev` =
   `H_R_Soorya_Dev`).

---

## 6. Known MCP server failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `cargo-*` / `smw-*` tools fail with "Wiki could not be reached to check for the extension" while other tools work | The server caches a failed extension probe after a network outage | Fully restart the MCP client (which restarts the server). Meanwhile, `{{#cargo_query:}}` via `parse-wikitext` still works - see `rules/structured-data.md` |
| Every request times out silently, no error page | Your IP may be filtered at the wiki's reverse proxy | Verify the wiki loads from another network (e.g. mobile data); if it does, contact a wiki admin about allowlisting |
| Writes fail with `authentication` | Bot password wrong, rotated, or expired | Run `scripts/validate-config`; see `docs/rotating-credentials.md` |

---

## 7. Cargo templates are admin-only

Agents never create or edit templates containing `{{#cargo_declare}}` or
`{{#cargo_store}}`. Schema changes require a Cargo table rebuild that only
admins can perform, and a bad change breaks every page that stores into the
table.

If a workflow needs a Cargo-backed template that does not exist: prepare the
exact wikitext, hand it to a human admin, and stop. Do not create it, and do
not route it through the template-creator skill (that skill refuses Cargo
templates by design).

---

## Authoritative references

- `Agents.md` - master rulebook (identity, auth, review protocol, forbidden actions).
- `rules/structured-data.md` - the `{{#cargo_query:}}`-via-`parse-wikitext` technique.
- `rules/task-board.md` - task lifecycle and task edit summaries.
- `docs/rotating-credentials.md` - credential rotation runbook.
