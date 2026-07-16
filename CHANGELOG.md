# Changelog

All notable changes to this repo are documented here.

## [0.2.4] — 2026-07-16

New member curriculum, agreed with the team lead: what the wiki is about,
setting up an agent, MCP, the bot-protection extension, the task board and
admin team, and making a first edit - plus automating as much of it as
possible so a senior doesn't have to walk each person through it by hand.

### Added
- **`HowTo:Install Wiki Access Extension`** (new wiki page) - the
  bot-protection browser extension referenced by every Hello task
  checklist ("confirm extension installation...") had zero documentation
  anywhere on the wiki until now. Covers Firefox/Chrome/Edge/Brave/Kiwi
  install steps and explains the Anubis proof-of-work puzzle it skips.
  Confirmed this only affects browser visits, not MCP/agent traffic.
- **`HowTo:Setting Up Your Agent`** (new wiki page) - the "which app do I
  even install" step that was missing before `HowTo:SetupMCP` (which
  starts from "you already picked one"). Recommends opencode and explains
  why, with install links for all four supported clients.
- **`onboarding` skill Step 7: teach-by-doing.** For a genuinely first-ever
  session (profile, Hello task, and roster row all created in this
  session) or on request, the agent picks a safe low-stakes task, claims
  and finishes it together with the user, narrating the task-board and
  editing mechanics live. This is the actual automation behind "opencode
  onboards new members instead of a person having to."

### Changed
- **`HowTo:Onboard Admin` restructured and deduplicated.** Slotted in the
  new agent-picker and extension steps in curriculum order (account →
  agent → MCP → extension → role → task board/admin team → conventions →
  first edit → stay in touch). Also removed a pre-existing duplicate
  content block (the page had both the `{{HowTo}}` template call and a
  second literal copy of the same sections) - now matches every other
  HowTo page's single-template-call convention.
- **`first-contribution` skill's scope narrowed and clarified** against
  the new `onboarding` skill: `onboarding` now owns automatic setup
  (profile/Hello/roster) and the task-board walkthrough;
  `first-contribution` owns the "which first CONTENT" decision
  (magazine/blog/edit) when someone wants to write something instead of
  claiming a task. `AGENTS.md`'s routing table updated to match.

## [0.2.3] — 2026-07-14

Full verification pass: validators, launcher, self-updater, every rules/skill
cross-reference, and live wiki state re-checked end to end.

### Fixed
- **Username-to-`assignee` matching was silently broken.** Every documented
  technique built a `LIKE '%username%'` pattern from the literal wiki
  username. Confirmed live: account `JayJayTee` has 7 active tasks, but the
  board records them under `Jay_Jay_Tee` (underscores inserted between
  words - not a space/underscore swap of the same string), so the
  documented query returned zero rows for a real, active user. Cargo's
  `LIKE` cannot normalize this at query time. New canonical technique in
  `rules/agent-conventions.md` (§6): pull the small set of active tasks
  unfiltered by assignee, then normalize both sides (strip
  spaces/underscores/hyphens, lowercase, split multi-assignee commas)
  before comparing client-side. Applied to `onboarding`, `wiki-task-board`,
  `weekly-update-reporter`, and `eod-status-report`.
- `AGENTS.md` routing table was missing the `eod-status-report` skill.
- Skill count corrected 19 → 20 (README.md and the live
  `WIKI FOSSCELL NITC:MCP Rules` wiki page both still said 19).
- Five stale `rules/agent-conventions.md §7` references (the new §6 shifted
  the old §7 "Cargo templates are admin-only" to §8) fixed across four
  skills and `AGENTS.md`.
- `.env.example` referenced `start-mcp.sh` as the credential reader; it's
  actually `start-mcp.js` (the wrapper just delegates to it).

### Verified
- Both validators (`.sh` and `.ps1`) pass identically against the live wiki,
  including a fresh negative test (missing field correctly fails, exit 1).
- Launcher handshake smoke-tested again: instructions injected, stdout
  framing clean, tools discovered.
- Self-updater's dirty-tree check: real tracked-file edits still block
  auto-update; untracked scratch files still don't (confirms the #38 fix
  holds).
- `config.example.json` is byte-identical in shape to the launcher's
  generated default.
- Live board: one task had `category=projects` (not a valid taxonomy
  value) - normalized to `app-dev`. One task's `assignee` has no matching
  `User:` page - flagged for human review rather than guessed at.
- No secrets tracked in git; `config.json` and `.env` both gitignored and
  absent from the tree.

## [0.2.2] — 2026-07-13

### Added
- **Launcher self-update.** On every start, `start-mcp.js` fetches origin and
  fast-forwards to `origin/main` when it is safe (git clone, on `main`, clean
  working tree). Otherwise it prints a "run git pull" reminder to stderr.
  Offline, ZIP installs, and any git failure are silently tolerated — the
  server always starts. Updated launcher code takes effect on the next
  restart.

## [0.2.1] — 2026-07-13

Agents now get the house rules in context on every connection, from any
client.

### Added
- **Rules injected into the MCP handshake.** `start-mcp.js` appends the NITC
  house-rules summary (naming conventions, task board values, edit summary
  format, preview discipline, error handling) to the server's `instructions`
  during initialize, pointing at the canonical wiki page
  `WIKI FOSSCELL NITC:MCP Rules`. Clients that only configured the MCP server
  — no repo folder, no skills — are grounded the moment they connect.
- **README section "How agents get the rules"** documenting the three
  channels: opencode folder auto-load, handshake injection, wiki rules page.

### Changed
- **`Agents.md` renamed to `AGENTS.md`** (cross-tool convention): opencode
  and other AGENTS.md-aware clients now auto-load the master rulebook when
  the repo is opened as a project. All references updated.

## [0.2.0] — 2026-07-12

Complete revamp of rules, skills, and scripts. An audit found 26 verified
defects (contradictions, hardcoded rotting dates, dead-end skill references,
validator bugs); this release fixes them and adds five new skills.

### Changed
- **Upstream server pinned at `0.13.1`** (was drifting: README said 0.10.0,
  script said 0.12.0, live configs called `@latest`). Tested at the protocol
  level: initialize + tools/list clean on stdio; the discovery regression
  reported in issue #17 did not reproduce.
- **Single cross-platform Node launcher** (`scripts/start-mcp.js`) replaces
  the bash-only path; `start-mcp.sh` is now a thin wrapper and `jq` is no
  longer needed. Fixes a real Windows bug where stdio inherit through
  cmd.exe silently broke MCP discovery. `opencode.json` launches via node.
- **Single validator** (`scripts/validate-config.js`) behind the `.sh` and
  `.ps1` wrappers. Fixes the bash bug where per-wiki field failures never
  affected the exit code; the API being unreachable is now a FAIL; Windows
  gets the Step 5 authenticated rights check for the first time.
- **`.env` credentials take effect** and win over hand-edited `config.json`
  values (with a printed notice). `.env` is the one place to update on a
  bot-password rotation.
- **Rules consolidated to single owners.** `categories.md` owns category
  names; `uploads.md` owns upload policy; `structured-data.md` owns the
  cargo_query-via-parse-wikitext technique; `AGENTS.md` no longer contradicts
  itself about `bot`/`minor`/`maxlag` (the edit tools do expose `bot` and
  `latestId`; they do not expose `minor`/`maxlag`/`assert=bot`).
- **`editing.md` no longer recommends `{{Cite web}}`/`{{Cite book}}`** — CS1
  is not imported; that advice contradicted `templates.md` and produced red
  links.
- **`task-board.md` documents the `cancelled` status**, the `created` param
  vs `created_date` Cargo field split, and valid category values only.
- **Edit summary format is now plain ASCII**: `Bot: <action> - <agent>`.
- **magazine-archiver merged into magazine-submission.** The archiver's
  format bypassed the Cargo table entirely and used invalid type values
  (`Comic`/`Artwork` vs the accepted `Comics`/`Art`).
- **Skills no longer hardcode dates, rosters, or table lists.** Examples use
  a `<TODAY>` placeholder; rosters are discovered by prefix search; Cargo
  tables come from live discovery (the old hardcoded list included a table
  that no longer exists and missed four that do).

### Added
- **`rules/agent-conventions.md`** — single owner of cross-cutting agent
  rules: edit summaries, preview-before-save (batch cosmetic changes; no
  more 12-revision styling sessions), the seven MCP error categories with
  required responses, date handling, roster discovery, known server failure
  modes (including stuck extension probes after a network outage), and the
  Cargo-templates-are-admin-only rule.
- **Five new skills**: `board-janitor` (task board hygiene), 
  `weekly-update-reporter` (weekly call updates from real edits),
  `wiki-gardener` (uncategorized/orphan backlog), `recent-changes-patroller`
  (quality patrol + churn detection), `rules-drift-auditor` (repo-vs-wiki
  drift reports).
- **Windows support end to end**: same launcher, same validator, documented
  Claude Desktop setup. Supersedes PR #4; closes issue #2.

### Removed
- **`wiki-templates-catalogue.md`** — 669-line orphan referenced by nothing
  and already stale; live drift checking is now the `rules-drift-auditor`
  skill's job.
- **`magazine-archiver` skill** (merged, see above).

### Earlier unreleased work folded into this release
- `validate-config` Step 5 authenticated rights check (`edit`, `createpage`,
  `editinterface`).
- `docs/rotating-credentials.md` rotation runbook.
- `rules/templates.md` note that this wiki protects `Template:` with
  `editinterface`, not `editprotected`/`sysop`.

## [0.1.0-beta] — 2026-06-09

First beta. The repo now works against the live wiki out of the box.

### Fixed
- **Corrected wiki API path.** `scriptpath` and `articlepath` were `/w` and
  `/wiki`, which 404'd. The live wiki serves its API at the root, so both are now
  empty strings. Reading previously failed before this fix.
- **Corrected `sitename`** to `WIKI FOSSCELL NITC` (matches the live siteinfo).
- **Fixed `opencode.json`.** Removed the invalid `${workspaceRoot}` token (VS Code
  syntax, not supported by opencode) and switched to a relative command path.
- **`validate-config.sh`** no longer reports legitimately-empty `scriptpath` /
  `articlepath` as missing.

### Changed
- **Pinned the upstream server** to `@professional-wiki/mediawiki-mcp-server@0.10.0`
  for reproducible beta installs. Bump in `scripts/start-mcp.sh` to upgrade.
- **Rewrote the README** with per-client setup (opencode, Claude Desktop, Cursor),
  Node 22.12+ prerequisite, troubleshooting, and a beta notice.
- **`AGENTS.md`** now states clearly what the wiki/MCP enforce versus what is
  agent-followed guidance, and notes that `bot` / `minor` / `maxlag` / `assert=bot`
  are not exposed by the MCP edit tools.
- **`start-mcp.sh`** adds a soft Node-version check and clearer error messages.

### Added
- **Rewrote `rules/` against the live wiki** (MediaWiki 1.45 + Cargo + SMW + Page
  Forms). `namespaces.md`, `categories.md`, and `templates.md` now use the wiki's
  real namespaces, category names (Title Case, plural), and templates that actually
  exist — replacing earlier invented values. `editing.md` reflects real markup
  practice (themed inline styles in templates, `{{#mermaid:}}`, `{{DISPLAYTITLE}}`).
- **New `rules/structured-data.md`** — Cargo / SMW / Page Forms: use the matching
  form/template, include `{{Event}}` on event pages, never break Cargo-declaring
  templates.
- **New `rules/page-types.md`** — per-type recipes (event, club, person, faculty,
  course, building, hostel, home team, HowTo, task).
- **New skill `.agents/skills/nitc-wiki-editing/`** so any skill-aware agent loads
  these conventions on demand.
- **`AGENTS.md`** read/write rules updated for the real namespaces, the
  structured-data workflow, and Cargo/Module/Widget edit protections.

### Removed
- **File uploads are disabled** for this beta. `AGENTS.md`, the README, and the
  setup agent all reflect that agents cannot upload files yet.
- **Removed the symlink machinery** (`symlinks/` and `scripts/setup-symlinks.sh`).
  Each client points at the repo directly; no cross-tool symlinks are needed.
- **Removed the `examples/` direct-API scripts** and all references to them.

### Known limitations
- File uploads are intentionally disabled in this beta.
- The `opencode.json` command assumes the client runs it from the repo root.
