---
name: meeting-processor
description: Convert meeting transcripts into structured meeting minutes on the NITC Wiki and create individual task pages in the WikiTasks Cargo table, deduplicating against existing tasks. Use when a user provides a meeting transcript (Google Meet/Gemini notes/Jitsi Meet or similar) and wants minutes generated plus action items tracked on the task board.
---

# Meeting Transcript -> Minutes + Tasks

Converts a meeting transcript (from Google Meet/Gemini/Jitsi Meet or similar) into a
structured Meeting Minutes page on the wiki and creates individual task pages
in the WikiTasks Cargo table, deduplicating against existing tasks.

---

## Input format

The skill expects a transcript with these sections (Gemini note-taking format):

```
Meeting <date> at <time> IST
Meeting records Transcript


Summary
...

Decisions
...

Next steps
[Name] Action item description
[Name] Action item description
...

Details
=== Topic Heading ===
Narrative with timestamps (00:03:15)
...
```

If the transcript format differs significantly, adapt the parsing rules
accordingly or ask the human for clarification.

---

## Data sources

1. **Transcript** -- provided by the user (the trigger).
2. **Team roster** -- the current academic year's
   `WIKI FOSSCELL NITC:Wiki Admin Team/<year>` page for
   username -> team -> category mapping. Discover the latest year with
   `search-page-by-prefix(prefix="Wiki Admin Team/", namespace=4)` -- never
   hardcode it (`rules/agent-conventions.md` sec. 5).
3. **WikiTasks Cargo table** -- queried via `parse-wikitext` with
   `{{#cargo_query:}}` for dedup checks (technique:
   `rules/structured-data.md` sec. Querying Cargo).
4. **Template:Task** -- used as-is for creating task pages.

---

## Step-by-step

### 1. Parse the transcript

Extract from the user-provided transcript:

- **Meeting date & time** -- from the first lines.
- **Attendees** -- infer from names appearing in Next steps and Details.
- **Summary** -- the paragraph(s) under "Summary".
- **Decisions** -- each line under "Decisions".
- **Next steps** -- each `[Name] Task description` line.
- **Details** -- each `=== Topic ===` section with its narrative.
- **Group items** -- lines starting with `[The group]` in Next steps treated as group assignments.

### 2. Fuzzy-match names to wiki usernames

For each unique name found in Next steps and Details:

1. Try `search-page-by-prefix("User:<name>")`.
2. If no direct match, try the last word of the name (e.g. "Thomas" for
   "Joshua Jacob Thomas").
3. If still no match, try the first word as a `User:` page search.
4. Cross-check against the roster page from Data sources -- its member rows
   link display names to `User:` pages, which resolves most nicknames and
   handle-style usernames (e.g. a "Benjamin Mathew" in the transcript may be
   `Benjammer` on the wiki).
5. If ambiguous (multiple matches) or no match at all -> **ask the human**.

Do not maintain or rely on a hardcoded name -> username table; people join
and leave every year. The roster page is the live source.

### 3. Create the Meeting Minutes page

**Title:** `WIKI FOSSCELL NITC:Meetings/YYYY-MM-DD`

**Before creating, check if page already exists:**
1. Call `get-page` with the proposed title.
2. If the page exists, append `-2`, `-3`, etc. until the title is free.
3. Record the resolved title for Step 7.

**Wikitext format:**

```wikitext
== Meeting Info ==
* '''Date:''' YYYY-MM-DD
* '''Time:''' HH:MM IST
* '''Source:''' Google Meet transcript

== Attendees ==
* [[User:Username|Display Name]]
...

== Summary ==
(transcript Summary)

== Decisions ==
# Decision 1
# Decision 2

== Discussion ==
=== Topic 1 ===
Narrative... (00:03:15)

=== Topic 2 ===
Narrative... (00:07:02)
...

== Action Items ==
{| class="wikitable"
! Task !! Assignee !! Priority !! Status
|-
| [[WIKI FOSSCELL NITC:Tasks/<slug>|Title]] || Assignee || high/med/low || open
...
|}
```

Use `create-page` to create the minutes page.

**Before saving, show the human the proposed wikitext** (review protocol).

### 4. Extract action items

#### From Next steps (primary)

Each `[Name] Task description` line becomes an action item.

- **Assignee:** mapped username from Step 2.
- **Description:** the task description text.
- **Priority heuristic (applied to task title & description):**

  | Keyword | Priority |
  |---|---|
  | `fix`, `resolve`, `complete`, `finish`, `implement`, `configure`, `deploy`, `build`, `create`, `setup` | **high** |
  | `recruit`, `collect`, `send`, `remind`, `check`, `ask`, `poll`, `review` | **low** |
  | everything else | **medium** |

#### Deadline extraction

For each action item (from both Next steps and Details), scan the
description for deadline cues and parse them relative to the meeting date:

| Pattern | Example | Computed deadline |
|---|---|---|
| `by <date>` | "by YYYY-MM-DD" or "by June 25" | That date |
| `within <N> days` | "within 3 days" | Meeting date + N |
| `within <N> weeks` | "within 2 weeks" | Meeting date + Nx7 |
| `by <dayname>` | "by Friday", "by Monday" | Next occurrence of that day |
| `before next meeting` | "before next meeting" | Meeting date + 7 |
| `this week` | "this week" | Meeting date + (6 - day_of_week) -> Saturday |
| `tomorrow` | "by tomorrow" | Meeting date + 1 |
| `next week` | "next week" | Meeting date + 7 |
| `by end of <month>` | "by end of June" | Last day of that month |

Where the meeting date is known (from Step 1), compute the deadline as a
`YYYY-MM-DD` string. If the pattern is ambiguous or cannot be reliably
parsed, leave `deadline` empty.

Set the parsed deadline in the task's `deadline` field.

#### From Details (conservative)

- "committed to [doing X]"
- "will [do X]"
- "going to [do X]"
- "plan to [do X]"
- "plans to [do X]"
- "will handle [X]"
- "take on [X]"
- "will take on [X]"

If found, check against the Next-steps list to avoid duplicates. If unique,
create an action item with **medium** priority (unless context suggests
higher, e.g. "urgent" or "blocker" language).

### 5. Deduplicate against existing tasks

**Run this step for ALL action items before showing any Y/N/D prompt or
creating anything.** Do not skip or defer dedup to after the review.

For each extracted action item:

1. Search WikiTasks via `parse-wikitext` using the first 2-3 significant
   keywords from the action item title:
   ```
   {{#cargo_query:tables=WikiTasks
   |fields=_pageName,task_title,status
   |where=task_title LIKE '%keyword%' AND status!='done' AND status!='cancelled'
   |format=ul
   |limit=10}}
   ```
   If the first keyword combination returns no results, retry with individual
   keywords (e.g. search "Windows" separately from "MCP" separately from
   "install") to catch semantically related tasks with different wording.

2. Also run a broad search by assignee to catch any open tasks already
   assigned to the same person covering a similar topic:
   ```
   {{#cargo_query:tables=WikiTasks
   |fields=_pageName,task_title,status
   |where=assignee='<username>' AND status!='done' AND status!='cancelled'
   |format=ul
   |limit=20}}
   ```
   Scan the results for semantic overlap with the action item even if no
   keyword matches -- e.g. "Setup Windows installer script" covers "Perform
   clean Windows installation for MCP script".

3. If a matching active task exists:
   - **Skip creation.**
   - Note in the minutes page:
     `Already tracked by [[WIKI FOSSCELL NITC:Tasks/<existing>|existing task]]`.

4. If no match found, mark as "to create" and proceed to Step 6.

### 6. Create task pages

For each unique (non-duplicate) action item:

**Title:** `WIKI FOSSCELL NITC:Tasks/Mtg-YYYY-MM-DD-<Short-slug>`

The slug should be a clean, hyphenated summary of the task (e.g.
`Fix-Images`, `CI-Workflow`, `Course-Page-Cargo-Table`). Keep it under
~40 chars.

**Content:**
```wikitext
{{Task
|title=<Description of the task>
|status=open
|priority=<high|medium|low>
|category=<inferred team category>
|assignee=<wiki username>
|deadline=<YYYY-MM-DD or leave empty>
|description=<Context from the transcript, expanded for actionability>
|created=YYYY-MM-DD
}}
```

If a deadline was extracted in Step 4 (from patterns like "within 3 days"
or "by Friday"), populate the `|deadline=` field. Otherwise leave it empty.

**Category inference (from team roster):**

| Team | Category |
|---|---|
| Lead | `mcp-admins` |
| MCP | `mcp-admins` |
| Templates | `template-admins` |
| App | `app-dev` |
| PRC | `prc` |
| Social Media | `social-media` |
| Video | `video-editors` |
| Design | `design` |
| Policy | `policy` |

If the member is not found in the team roster, leave `category` empty.

**Before creating, check if page already exists:**
1. Call `get-page` with the proposed title.
2. If the page exists, the task was likely created from a previous meeting.
   Skip creation and note in the minutes:
   `Already exists at [[WIKI FOSSCELL NITC:Tasks/<existing>|existing task]]`.

**Per-task human confirmation:**
For each unique task that passed all checks, show the human the proposed
`{{Task}}` content and ask:
```
Create task '<Slug>'? (Y/N/D)
```
- **Y** -- create the page via `create-page`.
- **N** -- skip entirely (do not note in minutes).
- **D** -- defer. Skip for now but add to minutes as `Deferred -- not yet assigned`.

Only proceed to the next task after receiving input on the current one.

### 7. Update the minutes page with task links

Append the Action Items table to the minutes page listing all created and
skipped tasks:

```
== Action Items ==
{| class="wikitable"
! Task !! Assignee !! Priority !! Status
|-
| [[WIKI FOSSCELL NITC:Tasks/Mtg-<meeting-date>-Fix-Images|Fix image rendering]] || Vysakh || high || open
|-
| ''Already tracked by [[WIKI FOSSCELL NITC:Tasks/Some-task|existing task]]'' || -- || -- || --
|}
```

Use `update-page` with edit-conflict detection (`latestId` from the initial
`create-page` response).

---

## Which items to skip

| Condition | Action |
|---|---|
| Assignee is `[The group]` | Skip entirely |
| Similar active task exists in WikiTasks | Skip, note existing link in minutes |
| Task clearly already done (completed language in transcript) | Skip entirely |
| Assignee name cannot be mapped (after asking human) | Skip, flag in minutes as "unassigned" |
| Title already exists on wiki | Skip, note pre-existing link in minutes |
| Human declines (N) | Skip entirely -- do not note in minutes |
| Human defers (D) | Skip creation, note as "Deferred" in minutes |

---

## Review protocol

Per `AGENTS.md sec. 8`, the skill must pause and surface to the human:

1. **Before creating the minutes page** -- show the proposed wikitext.
2. **Before creating any task page** -- show the proposed `{{Task}}` content.
3. **When a name cannot be matched** -- show the name and possible matches,
   ask for clarification.
4. **For each task** -- individual Y/N/D confirmation (see Step 6).

---

## Edit summaries

Format follows `rules/agent-conventions.md` sec. 1:

| Action | Summary |
|---|---|
| Create minutes page | `Bot: Add meeting minutes for YYYY-MM-DD - <agent>` |
| Create task page | `Bot: Create task from meeting YYYY-MM-DD - <agent>` |
| Update minutes with links | `Bot: Link action items on minutes - <agent>` |

---

## Related skills & references

- `wiki-task-board` -- task creation, status updates, and board queries.
- `eod-status-report` -- team roster parsing and name cross-referencing.
- `rules/agent-conventions.md` -- edit summaries, error handling, roster discovery.
- `AGENTS.md` -- master rules, review protocol (sec. 8), edit summary format (sec. 1).
- `rules/namespaces.md` -- naming conventions.
- `Template:Task` on the live wiki -- field names and accepted values.
