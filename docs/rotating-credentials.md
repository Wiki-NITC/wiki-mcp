# Rotating the bot password

The bot account (`JayJayTee@mcp-bot` at time of writing) authenticates every
edit this MCP server makes. Rotate its password periodically, or immediately
if it may have leaked (shared in a chat, committed by accident, etc.).

## Why a restart is required

The MCP server reads `config.json` once, at startup, and then caches the
authenticated session in memory for as long as the process runs. Editing
`.env` or `config.json` while the server is already running has no effect on
that running process — it's still using the old password until it's
restarted and re-reads the config from disk.

## Steps

1. Go to [`Special:BotPasswords`](https://wiki.fosscell.org/Special:BotPasswords)
   on the wiki, log in as the account that owns the bot password
   (`JayJayTee` at time of writing).
2. Find the bot (`mcp-bot`) in the list and click it, then click **Update** to
   regenerate its password. (Don't create a new bot password unless you also
   intend to retire the old name — regenerating keeps the same grants.)
3. Copy the new password shown on screen. It is only shown once.
4. Update credentials:
   - If using `.env` (recommended): edit `BOT_PASSWORD` in `.env`.
   - If editing `config.json` directly: update the `password` field under
     `wikis["wiki.fosscell.org"]`.
5. Fully quit and reopen your MCP client (Claude Desktop, Cursor, etc.) so it
   respawns the server process. Reloading the client window or just starting
   a new chat is not enough — the server subprocess itself must restart.
6. Verify the new credentials work:
   ```sh
   bash scripts/validate-config.sh
   ```
   Step 5 of that script logs in with the configured credentials and reports
   whether the account still has the rights editing requires. A "Login
   failed" result there means the password wasn't updated correctly in step 4.

## If grants need to change too

Rotating the password (steps above) does not change what the bot account is
*allowed* to do — those are the checkboxes on the same BotPasswords page
(`Edit existing pages`, `Edit protected pages`, etc.) plus the underlying
account's own MediaWiki rights (groups, `editinterface`, etc.). If editing
starts failing with a permissions error after a rotation, that's a separate
problem from the password itself — see `rules/templates.md` for the
Template-namespace-specific case we've hit before.
