---
name: eod-status-report
description: Generate an end-of-day (EOD) status report cross-referencing the Wiki Admin Team roster with the WikiTasks Cargo table to show each member's active tasks, status, priority, ETA/deadline, and who is idle. Use when asked for a team-wide status update, accountability check, or EOD summary.
---

# EOD Status Report

Produces a comprehensive table mapping every member of the current
`WIKI FOSSCELL NITC:Wiki Admin Team/<academic-year>` roster against their
task assignments, surfacing idle members, overdue items, and missing
deadlines.

---

## Data sources

1. **Team roster** — the current academic year's
   `WIKI FOSSCELL NITC:Wiki Admin Team/<year>` page. Discover it — never
   hardcode the year (see `rules/agent-conventions.md` §5).
2. **Task board** — `WikiTasks` Cargo table via `{{#cargo_query:}}` through
   `parse-wikitext` (technique: `rules/structured-data.md` § Querying Cargo).

---

## Step-by-step

### 1. Find and fetch the current team roster

```
search-page-by-prefix(prefix="Wiki Admin Team/", namespace=4)
```

Pick the latest academic year from the results, then `get-page` it. Extract
each `<tr>` row from the `|members=` value:

- **Username** — wikilink target (`[[User:...]]`) or plain text.
- **Team** — column 2 (MCP, Templates, App, PRC, Social Media, Video, or —).
- Normalise username casing (the task board uses differing casing, e.g.
  `C3tm` vs `c3tm`, or `H_R_Soorya_Dev` vs `h_r_soorya_dev`; spaces and
  underscores are interchangeable). Match case-insensitively.

### 2. Fetch active (non-done, non-cancelled) tasks

Done items are excluded from the EOD report — they represent completed work
and there is no `closed_date` field to filter by recency.

```
parse-wikitext(wikitext="{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,status,priority,assignee,category,deadline,created_date
|where=status!='done' AND status!='cancelled'
|format=table
|limit=100}}")
```

### 3. Cross-reference

For each team member, collect all tasks where their username appears in the
`assignee` field (comma-separated, case-insensitive match). Collect into
columns:

- **Member** — display name from the team page.
- **Team** — MCP / Templates / App / PRC / Social Media / Video / Lead / —.
- **Task(s)** — comma-separated task titles (shortened if needed).
- **Status** — open / claimed / in-progress / review / done.
- **Priority** — high / medium / low.
- **Deadline / ETA** — value from the `deadline` field, or **—** if unset.
- **Idle** — **YES** if the member has zero active (non-done, non-cancelled)
  tasks.

### 4. Assemble the report table

Format as a Markdown table. Order: members with tasks first (sorted by team),
then idle members at the bottom.

Include a summary line at the end:
- Total team members
- Members with active tasks
- Idle members
- Tasks missing deadlines/ETAs

---

## Example output

```
| # | Member | Team | Task(s) | Status | Priority | Deadline |
|---|---|---|---|---|---|---|
| 1 | Vysakh | Lead | Induct Core Admin Team | in-progress | medium | <date> |
| 2 | ... | ... | ... | ... | ... | ... |
| N | Benjamin | MCP | — | **idle** | — | — |

**Summary:** 15 members · 9 with tasks · 5 idle · 0 deadlines set.
```

---

## Update protocol

If a member asks to add/change a deadline, follow the wiki-task-board skill
to update the task page with the new `deadline` value. Use edit-conflict
detection (`latestId`).
