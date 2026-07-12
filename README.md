# NITC Wiki tools (MCP)

Ask questions about — and edit — the [NITC Wiki](https://wiki.fosscell.org) from any
MCP-compatible AI client (opencode, Claude Desktop, Cursor, and others).

> **Status: Beta.** This works and is being tested by the FOSS Cell team. Setup
> steps and rules may still change. Please report anything broken (see
> [Feedback](#feedback)).

Under the hood this is a thin, pinned wrapper around the
[`@professional-wiki/mediawiki-mcp-server`](https://github.com/ProfessionalWiki/MediaWiki-MCP-Server)
(v0.10.0) plus NITC-specific config and house rules. We don't reinvent the server —
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
then point your client at it.

> Tip: the included script auto-creates a `config.json` on first run, so reading
> works immediately. Run `bash scripts/validate-config.sh` any time to confirm the
> wiki is reachable.

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
      "command": "bash",
      "args": ["/ABSOLUTE/PATH/TO/wiki-mcp/scripts/start-mcp.sh"]
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/wiki-mcp` with the real path (run `pwd` inside the folder
to get it), then restart Claude Desktop.

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
   `start-mcp.sh` reads `.env` and writes the credentials into `config.json` for
   you (requires `jq`; install it if the script warns it's missing). You can
   still edit `config.json` directly instead if you prefer.
3. Restart your client.

Rotating the bot password later (e.g. after regenerating it in
`Special:BotPasswords`) only needs step 2 and 3 repeated — edit `.env`, restart
your client. See [docs/rotating-credentials.md](docs/rotating-credentials.md)
for why a restart is required and the full rotation runbook.

> **File uploads are off in this beta.** Agents can create and edit text pages but
> cannot upload files yet. This is intentional and will be enabled later.

**Never commit `config.json`** — it holds your credentials and is already in
`.gitignore`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Node.js is required` | Install Node 22.12+ from [nodejs.org](https://nodejs.org). |
| Client shows no wiki tools | Confirm the path in your client config is absolute and points to `scripts/start-mcp.sh`. Restart the client fully. |
| "API not reachable" | Run `bash scripts/validate-config.sh`. Check your internet connection and that `https://wiki.fosscell.org` loads. |
| Edits rejected / "permission denied" | Add a valid bot password to `config.json` and restart. |
| First run is slow | `npx` downloads the server once, then caches it. |

---

## House rules for agents

Every agent acting on the wiki should follow [`Agents.md`](Agents.md) and the
detailed guides in [`rules/`](rules/):

- [`rules/namespaces.md`](rules/namespaces.md) — namespaces + naming conventions
- [`rules/structured-data.md`](rules/structured-data.md) — Cargo / SMW / Page Forms
- [`rules/page-types.md`](rules/page-types.md) — recipe per page type
- [`rules/categories.md`](rules/categories.md), [`rules/templates.md`](rules/templates.md), [`rules/editing.md`](rules/editing.md)

These are verified against the live wiki. Most are **guidance the AI is asked to
follow**, not limits the server hardware-enforces — see the top of `Agents.md` for
what's actually enforced.

A loadable **skill** at [`.agents/skills/nitc-wiki-editing/`](.agents/skills/nitc-wiki-editing/SKILL.md)
packages the essentials so any skill-aware agent picks up these conventions
automatically.

---

## Feedback

This is a beta. If setup fails or an agent misbehaves, tell the FOSS Cell team or
open an issue. Include your OS, Node version (`node -v`), client, and the error.

---

## About

Maintained by [FOSS Cell, NIT Calicut](https://fosscell.org). Licensed under AGPL-3.0.
The bundled upstream MCP server is MIT-licensed by [Professional Wiki](https://professional.wiki).
