---
name: board-janitor
description: "Audit and clean the NITC Wiki task board: stale claims, review-stuck tasks, cancelled clutter, duplicate tasks, malformed Task fields, orphan assignees, and overdue items. Use when asked to groom, audit, or clean up the task board, or to produce a board health report."
---

# Board Janitor

Use this skill to run a **hygiene pass over the task board**
(`WIKI FOSSCELL NITC:Tasks/`, backed by the `WikiTasks` Cargo table).
Boards rot in predictable ways: tasks claimed and forgotten, work finished
but stuck in `review`, cancelled tasks polluting queries, the same job
ticketed twice, and fields filled with values no query matches.

This skill is **report-first**: detect everything, present one report to the
human, then apply only the approved fixes.

---

## Data sources

- `WikiTasks` via `{{#cargo_query:}}` through `parse-wikitext`
  (`rules/structured-data.md` § Querying Cargo).
- `Template:Task` (`get-page`) — the accepted status/priority/category sets.
- `get-page-history` — per-task last-edit timestamps for staleness.
- Today's date — resolve from your environment (`rules/agent-conventions.md` §4).

Staleness thresholds come from `rules/task-board.md` §10:
`claimed` 14 days, `in-progress` 30 days, `review` 14 days.

---

## Checks

### 1. Stale claims and review-stuck tasks

```
{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,assignee,status
|where=status IN ('claimed','in-progress','review')
|format=table|limit=200}}
```

For each row, `get-page-history(title, limit=1)` and compare the last edit
timestamp against the threshold for its status. Flag breaches with the
assignee and days idle.

### 2. Overdue tasks

```
{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,assignee,deadline,status
|where=deadline < '<TODAY>' AND status!='done' AND status!='cancelled'
|format=table}}
```

Per `rules/task-board.md` §8, each one should get a new deadline or return
to `open` — propose one of the two per task.

### 3. Malformed field values

Group each controlled field and diff the distinct values against the
accepted sets (`Template:Task` + `rules/task-board.md` §§1,3,4):

```
{{#cargo_query:tables=WikiTasks|fields=status,COUNT(*)=n|group by=status|format=ul}}
{{#cargo_query:tables=WikiTasks|fields=priority,COUNT(*)=n|group by=priority|format=ul}}
{{#cargo_query:tables=WikiTasks|fields=category,COUNT(*)=n|group by=category|format=ul}}
```

Also flag: empty or non-ISO `created_date`; `task_title` containing raw
wikitext or template markup (a real past case: an entire infobox pasted
into the `title` field); missing required fields.

### 4. Orphan assignees

For each distinct assignee, check `get-page("User:<assignee>")` exists.
Flag assignees with no user page (typo or non-existent account —
prohibited by `rules/task-board.md` §11).

### 5. Duplicate tasks

For non-done, non-cancelled tasks, look for likely duplicates:

- Titles sharing 2+ significant keywords
  (`task_title LIKE '%kw1%' AND task_title LIKE '%kw2%'` pairwise probes).
- Same assignee with semantically overlapping open tasks.

Propose which to keep (usually the one with more history/detail) and which
to close as `cancelled` with a cross-link in its Notes.

### 6. Cancelled clutter

List `status='cancelled'` tasks still referenced by active board queries or
listing pages. Never delete them (history!); if a listing page shows them,
propose adding `status!='cancelled'` to that page's query instead.

---

## Workflow

1. Run all six checks. Collate into a single report: check, page, problem,
   proposed fix. Include the §13 health-report counters from
   `rules/task-board.md` (counts by status/priority, unassigned, stale,
   overdue, orphans).
2. Show the human the report. Get explicit approval per fix category.
3. Apply approved fixes one page at a time:
   - `get-page(metadata=true)` → edit → `update-page` with `latestId`.
   - Edit summaries per `rules/task-board.md` §12.
4. On write errors, follow `rules/agent-conventions.md` §3.

## Guardrails

- **Never delete a task page** — close via `done`/`cancelled`.
- **Never touch `WIKI FOSSCELL NITC:Task Board` itself** (sysop-protected
  board layout).
- Reopening or unclaiming someone else's task is **admin-only** — propose,
  don't do, unless the operator is an admin and approves.
- Status changes respect the lifecycle in `rules/task-board.md` §§1–2.
- One revision per task page per pass — batch all fixes to a page into a
  single save (`rules/agent-conventions.md` §2).

## Authoritative references

- `rules/task-board.md` — lifecycle, taxonomy, staleness thresholds, summaries.
- `rules/agent-conventions.md` — dates, error handling, preview discipline.
- `rules/structured-data.md` — the query technique.
- `.agents/skills/wiki-task-board` — day-to-day task operations.
