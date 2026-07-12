# Agents.md — Master Rules for AI Agents on the NITC Wiki

This document is the **authoritative rulebook** for any AI agent (Claude, Cursor, Copilot, or any MCP-compatible client) interacting with the [NITC Wiki](https://wiki.fosscell.org). Every agent must load this document before performing any action on the wiki.

Cross-cutting operating conventions (edit summaries, error handling, dates, preview discipline) live in [`rules/agent-conventions.md`](rules/agent-conventions.md) — read it together with this file.

---

## 0. What is enforced vs. what is guidance

Be honest about where these rules live:

- **Enforced by the wiki** — MediaWiki user rights and bot-password grants. An agent literally cannot do what its account isn't permitted to do (e.g. delete a page without the delete right).
- **Provided by the MCP server** — the bundled `@professional-wiki/mediawiki-mcp-server` exposes a fixed set of tools (`get-page`, `update-page`, `upload-file`, `whoami`, etc.). Uploads are off until upload directories are configured. The edit tools expose a `bot` flag and `latestId` edit-conflict detection, plus `section` and `mode=append/prepend` editing; they do **not** expose `minor`, `maxlag`, or `assert=bot`.
- **Guidance only (this document + `rules/`)** — naming conventions, edit-summary format, namespace etiquette, license tags. Nothing mechanically enforces these; they work only because the agent is asked to follow them.

When in doubt, prefer the [Review Protocol](#8-review-protocol): surface the action to a human.

---

## 1. Identity

Every edit, upload, or other logged action must identify the agent clearly.

**Edit summary format:**
```
Bot: <action> - <agent-name>
```

Examples:
- `Bot: Create page "2026:Ragam" - Claude`
- `Bot: Fix typo in "FOSSCell/About" - Cursor`

The MCP server automatically appends `(via <tool> on MediaWiki MCP Server)` to summaries — do not add it yourself. Full summary conventions: [`rules/agent-conventions.md`](rules/agent-conventions.md).

The agent name must match the `User-Agent` header sent to the MediaWiki API.

**User-Agent format:**
```
<agent-name>/<version> (https://wiki.fosscell.org; <operator-username>) <library>/<version>
```

---

## 2. Authentication

### Preferred — Bot Password
- Create a bot password at `Special:BotPasswords` with minimal scopes.
- Store credentials in `.env` (synced into `config.json` by the launcher) — see the README and `docs/rotating-credentials.md`.
- Each agent should have its own dedicated bot password.

### Alternative — OAuth2
- If bot passwords are insufficient, use OAuth2 with a personal access token stored in `config.json` under `token`.
- The token must be scoped to the minimum permissions needed.
- Never log or expose the token value.

### General rules
- Never share credentials between agents. Each agent gets its own token or bot password.
- Anonymous (unauthenticated) access is allowed for read-only tools only.

---

## 3. Read Rules

Agents may freely read any page in the following namespaces:

| Namespace | ID | Notes |
|---|---|---|
| Main (articles) | 0 | Standard wiki content |
| `YYYY:` (year) | 3000–3135 | Event/edition pages (e.g. `2026:FOSSMeet`) |
| HowTo | 3200 | How-to guides |
| User | 2 | Only pages the agent's operator owns |
| File | 6 | File metadata and descriptions |
| MediaWiki | 8 | Read only — never edit |
| Template | 10 | Read to understand infobox/Cargo parameters |
| Form | 106 | Read to learn a page type's fields (Page Forms) |
| Property | 102 | Semantic MediaWiki properties |
| Category | 14 | Category pages and hierarchy |
| Help | 12 | Help documentation |
| `WIKI FOSSCELL NITC:` (Project) | 4 | Policy, Task Board, form helpers |

For the full namespace map and naming conventions see
[`rules/namespaces.md`](rules/namespaces.md). Agents must not browse `Special:` pages
or restricted API modules directly, with one exception: **includable report pages**
(e.g. `{{Special:UncategorizedPages}}`, `{{Special:LonelyPages}}`) may be rendered
through `parse-wikitext` for maintenance reports.

> **This is a structured-data wiki** (Cargo + SMW + Page Forms). Before creating
> content, read [`rules/structured-data.md`](rules/structured-data.md) and the
> per-type recipes in [`rules/page-types.md`](rules/page-types.md). Task-board
> operations follow [`rules/task-board.md`](rules/task-board.md).

---

## 4. Write Rules

### Before creating a page
1. Check the page does not already exist (`get-page`), and look at a sibling page of the same type to copy its pattern.
2. Verify the title follows the wiki's naming conventions (see [`rules/namespaces.md`](rules/namespaces.md)): `YYYY:EventName` for events, `Firstname Lastname` for people, common name for clubs. No special chars except `-`, `/`, `'`, `:`.
3. The page must belong to an allowed namespace (see Read Rules).
4. Use the matching **form/infobox/Cargo template** for the page type — don't hand-format structured content. See [`rules/page-types.md`](rules/page-types.md).
5. Add at least one **category** (real names only — see [`rules/categories.md`](rules/categories.md)).
6. **Preview with `parse-wikitext` before saving.** Iterate in preview, save once. See [`rules/agent-conventions.md`](rules/agent-conventions.md).

### Before editing a page
1. Fetch the current content **and revision ID**: `get-page` with `metadata=true`.
2. Pass that revision ID as `latestId` on `update-page` so concurrent edits are detected instead of clobbered.
3. Do not blank content. If a page should be deleted, surface to a human operator.
4. Always provide a non-empty edit summary (see Identity section).
5. Batch related cosmetic changes into one revision — never iterate styling through saved edits.

### Edit parameters
- `bot: true` — marks the edit as a bot edit (hidden from Recent Changes by default). Takes effect only when the account has the `bot` right or the high-volume bot-password grant. Use it for bulk or automated edit runs.
- `latestId` — base revision for edit-conflict detection. Use it on every `update-page`.
- `section` / `mode=append|prepend` — edit one section or send a delta instead of shipping the full page source.
- `minor`, `maxlag`, and `assert=bot` are **not** exposed by the MCP tools (direct-API concepts only).

### Prohibited edits
- No edits to `MediaWiki:` namespace pages (system messages).
- No edits to user JS/CSS pages (`User:*.js`, `User:*.css`) unless the operator explicitly confirms.
- No changes to a **Cargo-declaring template** (`{{#cargo_declare}}` / `{{#cargo_store}}`) — see [`rules/agent-conventions.md`](rules/agent-conventions.md) §7.
- No edits to `Module:`, `Widget:`, `GeoJson:`, or `smw/schema:` pages without human review (code/schema).

---

## 5. Upload Rules

Upload policy — allowed formats, naming, license tags, and the current
**uploads disabled** status — lives in [`rules/uploads.md`](rules/uploads.md),
the single owner of that policy.

---

## 6. Forbidden Actions

The following actions are **always forbidden** without explicit, written human approval:

- Deleting any page.
- Blocking or unblocking users.
- Changing user rights or groups.
- Editing `MediaWiki:*.css` or `MediaWiki:*.js`.
- Editing the Main Page.
- Editing an agent operator's user page or user talk page except for bot notices.
- Creating pages outside allowed namespaces.
- Uploading files without a license tag.

---

## 7. Rate Limits and Error Handling

MCP tool errors fall into seven categories: `not_found`, `permission_denied`,
`invalid_input`, `conflict`, `authentication`, `rate_limited`, and
`upstream_failure`. The required response to each — including the
`conflict` → re-fetch `latestId` → retry-once pattern — is defined in
[`rules/agent-conventions.md`](rules/agent-conventions.md) §3.

Agents must never silently swallow errors. Every error must be logged in the agent's output.

---

## 8. Review Protocol

The agent must pause and surface a decision to a human operator in these situations:

1. **Creating a new page** — Show the proposed wikitext and ask for confirmation before saving.
2. **Deleting or blanking a page** — Always require human confirmation.
3. **Editing a page in the `MediaWiki:` namespace** — Require human confirmation.
4. **First-time authentication** — Confirm the token works by calling `whoami` and showing the result to the human.

The agent must provide the human with:
- The action to be performed.
- The page(s) affected.
- A summary of changes (diff if available).
- The rationale for the action.

---

## 9. Draft Format

When the user asks you to prepare a draft (of category pages, template changes, new pages, or any batch edit), follow this procedure:

### Location
- Create a `drafts/` directory at the project root (`{repo_root}/drafts/`) if it does not already exist.
- Place **all** draft files inside this directory. Do not scatter drafts elsewhere in the repo.

### Contents
1. **Draft document** — one or more `.md` files describing every proposed change (page content, category tags, etc.). Name them descriptively, e.g. `category-hierarchy-draft.md`.
2. **HTML mockups** — one or more `draftpage-{N}.html` files showing how the modified pages will look after the changes are applied. The mockups should mimic the wiki's actual rendering (Citizen skin) as closely as possible.
   - If the draft affects many similar pages (e.g. adding a category tag to 50 templates), make mockups of **2–3 representative pages** only.
   - Mockups must be self-contained HTML files (CSS inline or in `<style>`).

### Goal
The human operator should be able to open each `draftpage-*.html` in a browser and see exactly what the wiki will look like after the changes — without having to imagine or cross-reference.

---

## 10. Use the skills — do not improvise known workflows

This repo ships task-specific skills under `.agents/skills/`. **Before doing
any of the tasks below, load and follow the matching skill** — improvised
versions get conventions wrong (real example: meeting minutes created at a
free-form title instead of `WIKI FOSSCELL NITC:Meetings/YYYY-MM-DD` because
the skill wasn't loaded; the page had to be moved).

| Task | Skill |
|---|---|
| Any read/edit on this wiki (start here) | `nitc-wiki-editing` |
| Meeting transcript → minutes + tasks | `meeting-processor` |
| Task board: find/claim/create/update tasks | `wiki-task-board` |
| Task board cleanup / health report | `board-janitor` |
| Event or fest edition pages | `event-page-creator` |
| Home team pages | `nitc-wiki-home-teams` |
| Magazine entries or MagCom archiving | `magazine-submission` |
| New contributor onboarding | `first-contribution` |
| Fee/bus PDF ingestion | `hostel-fee-ingest` / `institute-fee-ingest` / `bus-timings-ingest` |
| New (non-Cargo) templates | `template-creator` |
| Cargo data audits | `cargo-auditor` |
| Structural health checks | `wiki-diagnostics` |
| Uncategorized/orphan page sweeps | `wiki-gardener` |
| Recent-changes patrol | `recent-changes-patroller` |
| Weekly standup update for a member | `weekly-update-reporter` |
| Repo docs vs live wiki drift check | `rules-drift-auditor` |

If your client does not auto-load skills, read the relevant
`.agents/skills/<name>/SKILL.md` file before starting the task.

---

## 11. Enforcement

- Every agent integration in the Wiki-NITC organisation **must** load this document, [`rules/agent-conventions.md`](rules/agent-conventions.md), and the topic rules in `rules/` — and follow them.
- If an agent's setup contradicts any rule here, this document takes precedence.
- Violations should be reported to the wiki sysops via `Special:EmailUser` or the FOSS Cell communication channel.
