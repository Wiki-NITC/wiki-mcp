# NITC Wiki tools (MCP)

Ask questions about — and edit — the [NITC Wiki](https://wiki.fosscell.org) from any
MCP-compatible AI client (opencode, Claude Desktop, Cursor, and others).

> **Status: Beta.** This works and is being tested by the FOSS Cell team. Setup
> steps and rules may still change. Please report anything broken (see
> [Feedback](#feedback)).

Under the hood this is a thin, pinned wrapper around the
[`@professional-wiki/mediawiki-mcp-server`](https://github.com/ProfessionalWiki/MediaWiki-MCP-Server)
(the exact version is pinned in [`scripts/start-mcp.js`](scripts/start-mcp.js))
plus NITC-specific config and house rules. We don't reinvent the server —
we point it at our wiki and add guardrails.

---

## What you need

- **Node.js 22.12 or newer** — install from [nodejs.org](https://nodejs.org). Check with `node -v`.
- An MCP-compatible client (see [Setup](#setup) below).

Reading the wiki needs **no account and no credentials**. Editing needs a bot
password (see [Editing the wiki](#editing-the-wiki)).

---

## Setup

Download this folder (green **Code** button → **Download ZIP**, or `git clone`),
then point your client at it. The launcher is a Node script, so **the same
setup works on Windows, macOS, and Linux**.

> Tip: the launcher auto-creates a `config.json` on first launch, so reading
> works immediately. After that first launch (or after copying
> `config.example.json` to `config.json`), run `bash scripts/validate-config.sh`
> (Windows: `powershell -File scripts\validate-config.ps1`) any time to confirm
> the wiki is reachable and your credentials have the rights editing needs.

### opencode

Open the `wiki-mcp` folder as your project. opencode auto-discovers
[`opencode.json`](opencode.json) at the repo root — no further config needed. Then
just ask about the wiki.

### Claude Desktop

Edit your `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows: `%APPDATA%\Claude\claude_desktop_config.json`) and add:

```json
{
  "mcpServers": {
    "wiki.fosscell.org": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/wiki-mcp/scripts/start-mcp.js"]
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/wiki-mcp` with the real path (on Windows use
double backslashes, e.g. `C:\\Users\\you\\wiki-mcp\\scripts\\start-mcp.js`),
then restart the client fully.

### Cursor

Create `.cursor/mcp.json` in your project (or use **Settings → MCP → Add new MCP
Server**) with the same block as Claude Desktop above.

---

## Editing the wiki

Reading works out of the box. To **create or edit pages**:

1. Create a bot password at
   [`Special:BotPasswords`](https://wiki.fosscell.org/Special:BotPasswords) (ask the
   FOSS Cell team if you need an account).
2. Copy `.env.example` to `.env` and fill in `BOT_USERNAME` and `BOT_PASSWORD`.
   The launcher reads `.env` and writes the credentials into `config.json` on
   every start. **`.env` wins**: if you also hand-edit credentials in
   `config.json`, the `.env` values overwrite them on the next launch (the
   launcher prints a notice when that happens). To manage credentials in
   `config.json` directly instead, just don't set them in `.env`.
3. Restart your client.

Rotating the bot password later (e.g. after regenerating it in
`Special:BotPasswords`) only needs step 2 and 3 repeated — edit `.env`, restart
your client. See [docs/rotating-credentials.md](docs/rotating-credentials.md)
for why a restart is required and the full rotation runbook.

> **File uploads are off.** Agents can create and edit text pages but cannot
> upload files yet. This is intentional and will be enabled later — policy in
> [`rules/uploads.md`](rules/uploads.md).

**Never commit `config.json` or `.env`** — they hold your credentials and are
already in `.gitignore`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Node.js is required` | Install Node 22.12+ from [nodejs.org](https://nodejs.org). |
| Client shows no wiki tools | Confirm the path in your client config is absolute and points to `scripts/start-mcp.js` (command: `node`). Restart the client fully. |
| "API not reachable" | Run the validator. Check your internet connection and that `https://wiki.fosscell.org` loads. |
| Every request times out silently, but the wiki loads on mobile data | Your IP may be filtered at the wiki's reverse proxy — contact a wiki admin about allowlisting. |
| Cargo/SMW tools fail with "Wiki could not be reached to check for the extension" while other tools work | The server cached a failed extension probe after a network blip. Fully restart your client. Queries still work via `parse-wikitext` meanwhile. |
| Edits rejected / "permission denied" | Add a valid bot password via `.env` and restart. The validator's Step 5 tells you exactly which rights the account is missing. |
| First run is slow | `npx` downloads the server once, then caches it. |

---

## House rules for agents

Every agent acting on the wiki should follow [`Agents.md`](Agents.md) and the
detailed guides in [`rules/`](rules/):

- [`rules/agent-conventions.md`](rules/agent-conventions.md) — edit summaries, error handling, preview discipline
- [`rules/namespaces.md`](rules/namespaces.md) — namespaces + naming conventions
- [`rules/structured-data.md`](rules/structured-data.md) — Cargo / SMW / Page Forms
- [`rules/page-types.md`](rules/page-types.md) — recipe per page type
- [`rules/categories.md`](rules/categories.md), [`rules/templates.md`](rules/templates.md), [`rules/editing.md`](rules/editing.md), [`rules/task-board.md`](rules/task-board.md), [`rules/uploads.md`](rules/uploads.md)

These are verified against the live wiki. Most are **guidance the AI is asked to
follow**, not limits the server hardware-enforces — see the top of `Agents.md` for
what's actually enforced.

Loadable **skills** under [`.agents/skills/`](.agents/skills/) package the
conventions and common workflows (editing, task board, board hygiene, event
pages, magazine, ingest pipelines, patrols, weekly updates, drift audits) so
any skill-aware agent picks them up automatically —
[`nitc-wiki-editing`](.agents/skills/nitc-wiki-editing/SKILL.md) is the
starting point.

---

## Feedback

This is a beta. If setup fails or an agent misbehaves, tell the FOSS Cell team or
open an issue. Include your OS, Node version (`node -v`), client, and the error.

---

## About

Maintained by [FOSS Cell, NIT Calicut](https://fosscell.org). Licensed under AGPL-3.0.
The bundled upstream MCP server is MIT-licensed by [Professional Wiki](https://professional.wiki).
