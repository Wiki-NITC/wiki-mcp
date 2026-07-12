---
name: wiki-task-board
description: Work with the NITC Wiki task board. Find open tasks, claim or update them, mark them done, and create new tasks under the WIKI FOSSCELL NITC project namespace using Template:Task and the WikiTasks Cargo table. Use when asked what needs doing on the wiki, to pick up or assign a task, or to log new work.
---

# Wiki Task Board

Use this skill to read, create, claim, update, and report on tasks in the
NITC Wiki task board. Tasks are wiki pages in `WIKI FOSSCELL NITC:Tasks/`
backed by the `WikiTasks` Cargo table.

---

## How to query tasks

Query via `{{#cargo_query:}}` through `parse-wikitext` — the canonical
technique and its caveats are in `rules/structured-data.md` § Querying Cargo.
Dates in the examples below are placeholders: resolve `<TODAY>` from your
environment (`rules/agent-conventions.md` §4).

### All open tasks, highest priority first

```
parse-wikitext(wikitext="{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,priority,assignee,deadline,category
|where=status='open' OR status='claimed'
|order by=priority
|format=table
|limit=100}}")
```

### Unassigned open tasks (what can I pick up?)

```
parse-wikitext(wikitext="{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,priority,category
|where=status='open' AND assignee=''
|order by=priority
|format=ul}}")
```

### Tasks by team category

```
parse-wikitext(wikitext="{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,assignee,status
|where=category HOLDS 'template-admins' AND status='open'
|format=ul}}")
```

### Tasks assigned to a specific user

```
parse-wikitext(wikitext="{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,status,deadline
|where=assignee='SomeUsername'
|format=ul}}")
```

### Overdue tasks

```
parse-wikitext(wikitext="{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,assignee,deadline
|where=deadline < '<TODAY>' AND status != 'done' AND status != 'cancelled'
|format=table}}")
```

---

## How to create a task

1. **Check it does not already exist.** Search `WikiTasks` for similar titles
   using `parse-wikitext` + `{{#cargo_query:...|where=task_title LIKE '%keyword%'|format=ul}}`.
   Also `get-page` the planned title to confirm the page doesn't exist.

2. **Read `Template:Task` first** for the current field names and accepted
   values.

3. **Create the page** at `WIKI FOSSCELL NITC:Tasks/<Short-name>` with one
   `{{Task}}` call. Always provide:
   - `title` — one-line summary
   - `status=open`
   - `priority` — high, medium, or low
   - `category` — work-type (+ team if applicable), comma-separated
   - `description` — self-contained, actionable context
   - `created` — today's date in `YYYY-MM-DD`

4. **Show the human the wikitext** before saving (review protocol).

### Preload snippet for new tasks

```wikitext
{{Task
|title=
|status=open
|priority=medium
|category=
|assignee=
|deadline=
|description=
|created=<TODAY>
}}

== Details ==


== Notes ==


```

---

## How to claim a task

1. Fetch the task page **with metadata**: `get-page("WIKI FOSSCELL NITC:Tasks/<task>", metadata=true)` — keep the revision ID.
2. Set `assignee=<your-username>` in the `{{Task}}` call.
3. Set `status=claimed`.
4. Save with `latestId=<revision ID>` and summary `Bot: Claim task - <agent>`.

---

## How to assign a task to someone else

1. Fetch the task page.
2. Set `assignee=<their-username>`.
3. Leave `status=open` (they can claim it when ready) or set `status=claimed`.
4. Save with summary `Bot: Assign to <User> - <agent>`.

---

## How to update task status

| Current → Target | Summary |
|---|---|
| `claimed` → `in-progress` | `Bot: Mark in-progress - <agent>` |
| `in-progress` → `review` | `Bot: Submit for review - <agent>` |
| `review` → `done` | `Bot: Mark done - <agent>` |
| `review` → `in-progress` | `Bot: Return for changes - <agent>` |
| any non-done → `cancelled` | `Bot: Cancel task - <agent>` (creator or admin only) |

Always fetch the page first, change `status`, add any relevant updates to
`description` or `== Notes ==`, then save with the revision ID for conflict
detection.

---

## How to report board health

Combine queries into a concise health report. Return this to the human as a
formatted summary.

### Health check queries

```
{{#cargo_query:tables=WikiTasks|fields=status,COUNT(*)=n|group by=status|format=ul}}
```
— counts by status

```
{{#cargo_query:tables=WikiTasks|fields=priority,COUNT(*)=n|where=status!='done'|group by=priority|format=ul}}
```
— open counts by priority

```
{{#cargo_query:tables=WikiTasks|fields=category,COUNT(*)=n|where=status='open'|group by=category|format=ul}}
```
— open tasks by category

```
{{#cargo_query:tables=WikiTasks|fields=_pageName,task_title,assignee,deadline,created_date
|where=status!='done' AND status!='cancelled' AND assignee!='' AND created_date < '<TODAY minus 30 days>'
|format=table}}
```
— potentially stale (no recent activity)

```
{{#cargo_query:tables=WikiTasks|fields=_pageName,task_title,assignee,deadline
|where=deadline < '<TODAY>' AND status!='done' AND status!='cancelled'
|format=table}}
```
— overdue tasks

For a full automated hygiene pass (stale claims, duplicates, malformed
fields), use the `board-janitor` skill.

---

## Team categories for task routing

When creating or querying tasks, use these team categories to route work:

| Category | Team |
|---|---|---|
| `template-admins` | Template Administrators |
| `app-dev` | Application Developers |
| `prc` | Public Relations Committee |
| `social-media` | Social Media team |
| `video-editors` | Video Editing team |
| `mcp-admins` | MCP Server Administrators |

Query unclaimed tasks for a team:
`category HOLDS 'template-admins' AND assignee=''`

User roles are tracked as categories on user pages, not in the task system.
To find members of a team:
`get-category-members("Template Admins")`

---

## Rules to follow

- One task per page; one `{{Task}}` call per page.
- Do not delete task pages — close them by changing `status=done`.
- Show the human proposed wikitext before creating new tasks (review protocol).
- Tasks requiring admin rights should say so in the description.
- Always fetch current content before editing (edit-conflict detection).
- Use the correct edit summary format (see `rules/task-board.md §12`).

---

## Authoritative references

- `rules/task-board.md` — full task management rules and conventions.
- `Template:Task` on the live wiki — field names, accepted status/priority/category values.
- `rules/page-types.md` — "Task (Project Task Board)" recipe.
- `.agents/skills/cargo-auditor` — parser-function query technique.
- `Agents.md` — master rules, review protocol, and edit summary format.
