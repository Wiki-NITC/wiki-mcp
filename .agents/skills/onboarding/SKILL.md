---
name: onboarding
description: "Personal onboarding and work dashboard for NITC Wiki team members. Checks whether the current user is fully onboarded (profile page, Hello task, roster entry), fixes the gaps, then shows their open tasks and overdue items and recommends unclaimed tasks matched to their team from the Wiki Admin Team roster. Use when someone says onboard me, asks what their tasks are, what they should work on next, or wants to get started as a member."
---

# Onboarding & Personal Dashboard

One skill for "get me set up" and "what's on my plate". Run it for a brand-new
member and it walks them through onboarding; run it for an existing member and
it becomes their task dashboard with recommendations.

Everything here is **read-first**: gather all the facts, present one picture,
then act only on what the human approves.

---

## Step 1 - Who are you

1. `whoami` - the wiki username everything keys off.
2. Find the current roster: `search-page-by-prefix(prefix="Wiki Admin Team/", namespace=4)`,
   take the latest academic year, `get-page` it.
3. Locate the user's `{{Cargo Organization Team Member}}` row (match the
   `organization` field to the username, case-insensitively; spaces and
   underscores are interchangeable). Note their `role` (team) and `branch`
   (their written responsibilities, when filled).

## Step 2 - Onboarding audit

Check these three, in order. For anything missing, propose the fix and get
human confirmation before creating anything (`AGENTS.md` §8).

| Check | How | Fix if missing |
|---|---|---|
| Profile page | `get-page("User:<username>")` transcludes `{{User Profile}}`? | Create it following the `first-contribution` skill (read `Template:User Profile` for current fields) |
| Hello task | `get-page("WIKI FOSSCELL NITC:Tasks/Hello <Name>")` | Create from the Hello pattern (see any existing `Hello X` task): status `open`, assignee = the user, **no team category**, the standard 4-item checklist |
| Roster entry | Row found in Step 1? | Do NOT edit the roster yourself - it is the team's source of truth. Prepare the exact `{{Cargo Organization Team Member}}` row and hand it to the lead for approval |

If the Hello task exists with its checklist complete but status is still
`open`/`claimed`, remind the user to move it to `review`.

## Step 3 - Your board

Query the user's tasks (technique: `rules/structured-data.md`):

```
{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,status,priority,deadline
|where=assignee LIKE '%<username>%' AND status!='done' AND status!='cancelled'
|format=table}}
```

(`assignee` is comma-separated - verify matches aren't substrings of someone
else's name.) Present grouped: **in-progress** first, then **claimed**,
**review** (waiting on others), **open** (assigned but not started). Flag
anything with `deadline < <TODAY>` as **overdue** and suggest a new deadline
or returning it to `open` (`rules/task-board.md` §8).

## Step 4 - What do you want to work on?

Ask. If they name something specific, search the board for related existing
tasks first (keyword `LIKE` queries, per the meeting-processor dedup pattern)
- claim or continue an existing task rather than creating a duplicate.

## Step 5 - Recommendations

Match their roster role to a board category and query unclaimed work:

| Roster role | Board category to query |
|---|---|
| Lead, MCP | `mcp-admins` |
| Templates, Content | `template-admins` |
| App, Mini Apps | `app-dev` |
| PRC | `prc` |
| Social Media | `social-media` |
| Video | `video-editors` |
| Brand Book | `design` |
| Policy | `policy` |
| Task Board | no category - their work IS the board: suggest running `board-janitor` and picking up its findings |
| Demos | no category filter - show high-priority unassigned tasks across all teams |

```
{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,priority,created_date
|where=category HOLDS '<category>' AND assignee='' AND status='open'
|order by=priority
|format=table}}
```

Present the top 3-5 with a one-line "why you" (their roster `branch`
responsibilities text is the tiebreaker when it's filled in). If their
category has nothing open, widen to all unassigned open tasks and say so.

## Step 6 - Claim it

For whatever they pick, follow the `wiki-task-board` skill: set assignee +
`status=claimed`, save with `latestId` and summary `Bot: Claim task - <agent>`.

---

## Guardrails

- Human confirmation before every page creation (profile, Hello task).
- **Never edit the roster page directly** - prepare the row, hand to the lead.
- Never assign tasks to other people from here; this skill is first-person.
- Recommendations are suggestions - the human picks, the agent never
  auto-claims.
- On write errors: `rules/agent-conventions.md` §3.

## Authoritative references

- `WIKI FOSSCELL NITC:Wiki Admin Team/<year>` on the live wiki - roster and
  responsibilities (the `role` and `branch` fields).
- `.agents/skills/first-contribution` - profile page mechanics.
- `.agents/skills/wiki-task-board` - claiming and task operations.
- `.agents/skills/board-janitor` - the Task Board team's home turf.
- `rules/task-board.md` - lifecycle, categories, overdue rules.
