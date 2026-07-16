---
name: onboarding
description: "Personal onboarding and work dashboard for NITC Wiki team members. Runs PROACTIVELY at the start of every session for authenticated users: checks whether they are fully onboarded (profile page, Hello task, roster entry), offers to fix gaps, and opens with a short status of their open and overdue tasks before assisting with their actual request. For genuinely first-time users, offers a narrated teach-by-doing walkthrough of claiming and finishing a real task - so the agent itself teaches task management, page creation, and template usage instead of a human. Also triggers on demand: onboard me, what are my tasks, what should I work on next, help me pick and finish my first task."
---

# Onboarding & Personal Dashboard

One skill for "get me set up" and "what's on my plate". Run it for a brand-new
member and it walks them through onboarding; run it for an existing member and
it becomes their task dashboard with recommendations.

## The three user states

By the time someone's `whoami` shows a real username, they have already
finished the wiki's documented setup funnel: account with an @nitc.ac.in
email → bot password → credentials in `.env`
([[HowTo:Create a Wiki Account]] → [[HowTo:Create a Bot Password]] →
[[HowTo:Wiki-MCP Setup Guide]] on the live wiki). So:

| State | Who | What this skill does |
|---|---|---|
| Anonymous | New person without an account, or a read-only browser | Nothing proactive. But the moment they ask about contributing/editing, or a write fails with `authentication` — walk them through the funnel (see Step 0) |
| Authenticated, incomplete | Has account + bot password, but missing profile / Hello task / roster row | Full dashboard + start onboarding immediately |
| Authenticated, complete | Existing member | Full dashboard, then assist |

## When to run

**Automatically, in full, at the start of every session.** The user never
asks for this — it self-initiates on their first message:

- `whoami` anonymous → **no proactive dashboard** (don't nag read-only
  visitors). Step 0 fires only when contributing comes up.
- Authenticated → run Steps 1-3 **and** Step 5 unprompted, and open your
  first reply with the complete dashboard:

  ```
  Setup: OK (profile + Hello task + roster: MCP team)
  Your tasks: 2 in-progress, 1 open · OVERDUE: Create end-to-end brandbook
  Recommended pickups (mcp-admins): MCP-mobile-setup (high), ...
  ```

  Then handle whatever they actually asked in the same reply.
- **If setup is incomplete, begin onboarding immediately** — present what's
  missing and the proposed fixes. Page creations still require their
  confirmation (Review Protocol), but the initiative is yours, not theirs.
  If this was a from-scratch onboarding (everything was missing), offer
  Step 7's teach-by-doing walkthrough once setup is done.
- Only Step 6 (claiming a task) waits for the user to choose — never
  auto-claim.

Also re-run in full whenever asked: "onboard me", "what are my tasks",
"what should I work on".

Everything here is **read-first**: gather all the facts, present one picture,
then act only on what the human approves.

---

## Step 0 - Anonymous user wants to contribute

Trigger: an anonymous session asks how to contribute/edit, or attempts a
write and gets an `authentication` error. Turn the dead end into onboarding
— walk them through the wiki's own funnel, in order:

1. **Account**: [[HowTo:Create a Wiki Account]] — needs an @nitc.ac.in
   email, plus the confirmation email (check spam).
2. **Bot password**: [[HowTo:Create a Bot Password]] — bot name `wiki-mcp`,
   tick exactly the four documented permissions, copy the password
   immediately (shown once).
3. **Credentials**: `.env` in the wiki-mcp folder (`BOT_USERNAME`,
   `BOT_PASSWORD`), then fully restart the client.

Tell them: next session, this skill takes over automatically and finishes
their onboarding (profile, Hello task, roster). Reading needs none of this
— never push the funnel on someone who just wants to browse.

The full human-readable version of this same walkthrough (including
picking and installing an agent app in the first place, and the wiki's
bot-protection browser extension) lives on the wiki at
[[HowTo:Onboard Admin]] - point people there if they'd rather read than
be walked through it live.

## Step 1 - Who are you

1. `whoami` - the wiki username everything keys off.
2. Find the current roster: `search-page-by-prefix(prefix="Wiki Admin Team/", namespace=4)`.
   **Pick the numerically greatest academic year** (e.g. `2026-27` beats
   `2024-25`) - NOT the first search result, which is alphabetical. Then
   `get-page` it.
   **Redirects:** the roster title may be a redirect (it currently points at
   `2026:WIKINITC/Team`). The MCP `get-page` follows redirects transparently;
   but if you ever see a bare `#REDIRECT [[Target]]` as the page source
   (e.g. via a raw fetch), fetch the target - zero member rows on a
   one-line page means you are looking at the redirect, not the roster.
3. Locate the user's `{{Cargo Organization Team Member}}` row by matching
   the whoami username against each row's **`organization=` parameter** -
   exact match, case-insensitive, spaces and underscores interchangeable.
   Do NOT fuzzy-match against `name=` (that's a display name and routinely
   differs from the username, e.g. `name=Joshua Jacob Thomas` but
   `organization=JayJayTee`). Note their `role` (team) and `branch` (their
   written responsibilities, when filled).
4. Before concluding the user is missing from the roster, list the
   `organization=` values you compared against - a wrong-year page or a
   display-name mismatch is far more likely than a genuinely missing row.

## Step 2 - Onboarding audit

Check these three, in order. For anything missing, propose the fix and get
human confirmation before creating anything (`AGENTS.md` §8).

**Evidence rule: a fact goes on the dashboard only if a tool call in THIS
session showed it.** "Profile missing" requires `get-page("User:<name>")`
returning not_found - an unticked checkbox on their Hello task is NOT
evidence (checklists go stale; a real incident: an agent told a user their
profile was missing when it had existed for a week, because it trusted the
checklist instead of checking).

**Speed: batch your reads.** The whole audit fits in ~4 tool calls, not 10:
- One `get-pages` call for `User:<name>` + `WIKI FOSSCELL NITC:Tasks/Hello <Name>`
  + the roster page together.
- One `parse-wikitext` call carrying BOTH Cargo queries (your-tasks and
  team recommendations) - multiple `{{#cargo_query:}}` blocks concatenated
  in the same wikitext render in a single call.
On slow models this is the difference between a 1-minute and a 5-minute
dashboard.

| Check | How | Fix if missing |
|---|---|---|
| Profile page | `get-page("User:<username>")` transcludes `{{User Profile}}`? | Create it following the `first-contribution` skill (read `Template:User Profile` for current fields) |
| Hello task | `get-page("WIKI FOSSCELL NITC:Tasks/Hello <Name>")` | Create from the Hello pattern (see any existing `Hello X` task): status `open`, assignee = the user, **no team category**, the standard 4-item checklist |
| Roster entry | Row found in Step 1? | Do NOT edit the roster yourself - it is the team's source of truth. Prepare the exact `{{Cargo Organization Team Member}}` row and hand it to the lead for approval |

If the Hello task exists with its checklist complete but status is still
`open`/`claimed`, remind the user to move it to `review`.

## Step 3 - Your board

**Do not filter by the literal username in SQL** - `assignee` values are
hand-typed and can use a different separator convention than the real
username (`rules/agent-conventions.md` §6; e.g. account `JayJayTee` shows
up on task pages as `Jay_Jay_Tee` - a naive `LIKE` on the literal username
finds zero rows for a person who has several active tasks). Pull the
active board and normalize-compare client-side:

```
{{#cargo_query:tables=WikiTasks
|fields=_pageName,task_title,status,priority,deadline,assignee
|where=status!='done' AND status!='cancelled' AND assignee!=''
|format=table}}
```

For each row, strip spaces/underscores/hyphens and lowercase both the
`assignee` value (split on `,` first - it can list multiple people) and
the target username, then compare for equality. Present grouped:
**in-progress** first, then **claimed**, **review** (waiting on others),
**open** (assigned but not started). Flag anything with `deadline < <TODAY>`
as **overdue** and suggest a new deadline
or returning it to `open` (`rules/task-board.md` §8).

## Step 4 - What do you want to work on?

Ask. If they name something specific, search the board for related existing
tasks first (keyword `LIKE` queries, per the meeting-processor dedup pattern)
- claim or continue an existing task rather than creating a duplicate.

If they'd rather **write something** than claim a task (a magazine piece,
a blog post, or an open-ended page edit), hand off to the
`first-contribution` skill's first-post routing instead of forcing them
toward the task board.

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
|where=category LIKE "%<category>%" AND assignee="" AND status="open"
|order by=priority
|format=table}}
```

Present the top 3-5 with a one-line "why you" (their roster `branch`
responsibilities text is the tiebreaker when it's filled in). If their
category has nothing open, widen to all unassigned open tasks and say so.

## Step 6 - Claim it

For whatever they pick, follow the `wiki-task-board` skill: set assignee +
`status=claimed`, save with `latestId` and summary `Bot: Claim task - <agent>`.

## Step 7 - Teach by doing (brand-new users only)

**Trigger:** Step 2 just created the profile page, Hello task, AND roster
row for this person in this session (i.e. they were missing all three -
this is a genuinely first-ever session, not an existing member with one
gap). Also trigger on the explicit phrase "help me pick and finish my
first task" or similar, from anyone.

This is the automation behind "opencode onboards new members instead of a
senior having to walk them through it by hand" - the point is to *show*
task management, page editing, and template usage live, narrated, not just
describe it.

1. **Pick a safe practice task.** Prefer `priority=low` or `medium`, no
   near-term `deadline`, and a scope you can realistically finish in one
   sitting (a category fix, a small content addition, filling in a missing
   template field) over anything `high`/`critical` or deadline-pressured -
   a beginner's first live edit should not carry real stakes. If nothing
   suitable is open, offer a harmless standalone practice rep instead:
   adding a category to one genuinely uncategorized page, or expanding
   their own profile page.
2. **Claim it together**, narrating each step as you do it (per Step 6) -
   "I'm setting status to claimed and assigning it to you, here's the
   edit summary format we use..."
3. **Walk the actual work**, narrating the mechanics as they happen: read
   the page first, why you're using this specific template/infobox
   (`rules/page-types.md` recipe for the type), why the category needs to
   exist first, why you preview with `parse-wikitext` before saving
   (`rules/agent-conventions.md` §2), why you pass `latestId`. The
   narration IS the lesson - a new member who watches one real edit happen
   correctly understands the conventions faster than reading `rules/`.
4. **Finish it together** - move to `review` or `done` per the normal
   lifecycle, and point out where the task-to-skill routing table in
   `AGENTS.md` lives for next time they need a different workflow.
5. Offer, don't force: if they'd rather just watch you do the dashboard
   and explore on their own, that's fine - this step is a teaching option,
   not a requirement.

---

## Guardrails

- Human confirmation before every page creation (profile, Hello task).
- **Never edit the roster page directly** - prepare the row, hand to the lead.
- Never assign tasks to other people from here; this skill is first-person.
- Recommendations are suggestions - the human picks, the agent never
  auto-claims.
- On write errors: `rules/agent-conventions.md` §3.

## Authoritative references

- `HowTo:Onboard Admin` on the live wiki - the human-readable version of
  this same curriculum, including agent/extension setup before MCP.
- `WIKI FOSSCELL NITC:Wiki Admin Team/<year>` on the live wiki - roster and
  responsibilities (the `role` and `branch` fields).
- `.agents/skills/first-contribution` - choosing a first CONTENT
  contribution (magazine/blog/edit) rather than a task-board task.
- `.agents/skills/wiki-task-board` - claiming and task operations.
- `.agents/skills/board-janitor` - the Task Board team's home turf.
- `rules/task-board.md` - lifecycle, categories, overdue rules.
