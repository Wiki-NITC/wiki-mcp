# CLAUDE.md

This repo's full agent rulebook is [AGENTS.md](AGENTS.md) - read it and
follow it; it is authoritative here. (This file exists because Claude Code
loads CLAUDE.md, not AGENTS.md.)

Two rules repeated here because they are mandatory, not judgment calls:

1. **Session start:** before answering the user's first message - even a
   plain "hi" - call the wiki MCP's `whoami` tool (never a raw HTTP request:
   an unauthenticated api.php call always reports anonymous; if the MCP
   tools are missing, say so instead of improvising). If it shows an
   authenticated user, run the `.agents/skills/onboarding/SKILL.md` flow
   unprompted:
   setup check (profile page, Hello task, roster entry - start onboarding
   if anything is missing), their open/overdue tasks, and recommended
   unclaimed tasks for their team, delivered as a compact dashboard opening
   your first reply. Then handle whatever they asked. Anonymous sessions
   skip the dashboard.

2. **Before any wiki write**, fetch the page `WIKI FOSSCELL NITC:MCP Rules`
   with `get-page` and follow it. Never state wiki capabilities from memory
   - for example, uploads are DISABLED on this wiki even though upload
   tools exist.

Task-specific workflows live in `.agents/skills/` - consult the routing
table in AGENTS.md section 10 before improvising any known workflow
(meeting minutes, task board, event pages, magazine, audits, onboarding).
