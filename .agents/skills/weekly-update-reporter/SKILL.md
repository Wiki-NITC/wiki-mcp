---
name: weekly-update-reporter
description: Generate a member's weekly update for the FOSS Cell team call from their recent NITC Wiki edits and task board state. Use when asked what someone did this week, to prepare a weekly standup update, or to summarize wiki activity before the Weekly Wiki Call.
---

# Weekly Update Reporter

Team members are expected to share their weekly update **before** the Weekly
Wiki Call if they can't attend. This skill assembles that update from what
actually happened on the wiki — every line cites a page or revision, nothing
is invented.

---

## Inputs

- **Wiki username** — whose update to build. Default to the operator's own
  account (`whoami`). Match case-insensitively; spaces and underscores are
  interchangeable (`rules/agent-conventions.md` §5).
- **Window** — defaults to the last 7 days, ending today (resolve today from
  your environment).

---

## Data gathering

### 1. Edits in the window

```
get-recent-changes(user="<username>", since="<window-start ISO 8601>")
```

Group results by page; collapse consecutive revisions to the same page into
one line ("updated X, N revisions"). Note created pages (`isNew`) separately.

### 2. Task movement

Current task state:

```
{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,status,priority,deadline
|where=assignee LIKE '%<username>%'
|format=table}}
```

(`assignee` can hold comma-separated names — use `LIKE`, then verify the
match isn't a substring of someone else's name.)

For each of the user's task pages, `get-page-history` within the window to
detect status transitions (claimed → in-progress → review → done) from the
edit summaries.

### 3. Blockers and overdue

From the same task query: tasks past deadline and not `done`/`cancelled`,
and tasks stuck in the same non-done status for over the staleness
thresholds (`rules/task-board.md` §10).

---

## Report format

Markdown, ready to paste into the group chat:

```markdown
**Weekly update — <Display Name> (<window-start> to <window-end>)**

*Done this week*
- Marked done: <task title> ([task page])
- Created <page> (+2 follow-up edits)

*In progress*
- <task title> — <status>, <one-line state note>

*Blocked / overdue*
- <task title> — deadline was <date>; <reason if known, else "needs re-plan">

*Planned next*
- <open/claimed tasks on their board>
```

Rules for the content:

- **Every line cites its source** — a task page, a created page, or a
  revision count. If there is no wiki evidence for an item, it does not go
  in the report (the human can add off-wiki work themselves).
- Skip noise: typo fixes and self-reverts don't need their own lines.
- Keep it under ~15 lines; this is a standup update, not an audit.

---

## Posting (opt-in only)

The default deliverable is text returned to the human. Only if they
explicitly ask, save it on the wiki at:

```
User:<username>/Updates/<ISO week, e.g. 2026-W28>
```

with summary `Bot: Add weekly update <week> - <agent>`, following the
review protocol (`AGENTS.md` §8 — show the wikitext first).

## Guardrails

- Read-only by default; the single optional write is the update page above.
- Never editorialize about *other* members' inactivity in a personal update
  — that's the eod-status-report skill's job, for admins, with full-team
  scope.
- If `get-recent-changes` supports no user filter in the running server
  version, fetch the window unfiltered and filter client-side by the
  `user` field.

## Authoritative references

- `.agents/skills/eod-status-report` — the team-wide accountability
  counterpart.
- `rules/task-board.md` — status meanings and staleness thresholds.
- `rules/structured-data.md` — the Cargo query technique.
- `rules/agent-conventions.md` — dates, username matching, summaries.
