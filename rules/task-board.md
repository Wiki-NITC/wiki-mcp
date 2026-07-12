# Task Board Rules

Rules and conventions for the **NITC Wiki Task Board** at
`WIKI FOSSCELL NITC:Task Board`. Tasks are tracked via `Template:Task`, which
stores rows into the `WikiTasks` Cargo table.

---

## 1. Task lifecycle

Every task follows a linear lifecycle. Agents must not skip states:

```
open → claimed → in-progress → review → done
```

| State | Meaning | Who can set it |
|---|---|---|
| `open` | Available for anyone to claim | Creator, admin |
| `claimed` | Someone intends to work on it | Assignee, admin |
| `in-progress` | Work has started | Assignee, admin |
| `review` | Work is complete, awaiting review | Assignee, admin |
| `done` | Reviewed and accepted as complete | Reviewer, admin |
| `cancelled` | Task abandoned/obsolete — kept for history | Creator, admin |

A task can also be reopened (`done` → `open`) only by an admin. `cancelled`
sits outside the linear lifecycle: any non-`done` state may move to
`cancelled` (creator or admin), and queries for active work should exclude
both `done` and `cancelled`.

---

## 2. Status transitions

- `open` → `claimed` — assign yourself (add `assignee`)
- `claimed` → `in-progress` — begin work
- `in-progress` → `review` — submit for review
- `review` → `done` — reviewer approves
- `review` → `in-progress` — reviewer requests changes
- Any state → `open` — admin only (unclaim / reopen)

---

## 3. Priority levels

| Priority | Meaning | Example |
|---|---|---|
| `critical` | Blocking or urgent (requires sysop) | Spam wave, site outage |
| `high` | Important, should be next | Import CS1 modules, categorize uncategorized |
| `medium` | Normal task | Apply infoboxes, fix broken links |
| `low` | Nice to have, no deadline | Create naming conventions page |

Only admins may set `critical`. Anyone may set `high`/`medium`/`low`.

---

## 4. Category taxonomy

Tasks use **team categories** for routing. Multiple categories may be
comma-separated: `|category=template-admins,mcp-admins`.

### Team categories

| Category | Team |
|---|---|---|
| `template-admins` | Template Administrators (incl. content/data quality work) |
| `app-dev` | Application Developers |
| `prc` | Public Relations Committee (incl. outreach) |
| `social-media` | Social Media team |
| `video-editors` | Video Editing team |
| `mcp-admins` | MCP Server Administrators (incl. server/infra work) |
| `design` | Design team (brandbook, visual identity) |
| `policy` | Policy and Delegations (policies, conventions docs) |

These categories are for **task routing** — they let team leads query
unassigned tasks in their domain. They are not user roles; user roles are
tracked via categories on User pages (see §6).

Only these values are valid. Do not invent variants (`templates`, `infra`,
`content`, `brand`, `outreach`, `documentation`, and `Policy_team` have all
appeared on the board and had to be normalized away — the parenthetical
notes above show where each maps). No spaces after commas in
multi-category lists (`a,b`, not `a, b` — the space breaks `HOLDS` queries).

**Exception:** onboarding tasks (`Onboard <Name>`, `Hello <Name>`) carry
**no** team category — leave `category` empty. Onboarding is people work,
not team-queue work; the newcomer's team goes in the description.

---

## 5. Task page structure

```
WIKI FOSSCELL NITC:Tasks/<Short-descriptive-name>
```

Each task page contains exactly one `{{Task}}` call. Fields:

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | One-line task summary |
| `status` | Yes | Must be a valid lifecycle state (§1) |
| `priority` | Yes | Must be a valid priority (§3) |
| `category` | Yes | Comma-separated from §4 taxonomy |
| `description` | Yes | Self-contained context for action |
| `assignee` | No | Wiki username of the assignee |
| `deadline` | No | ISO 8601 date (`YYYY-MM-DD`) |
| `created` | Yes | ISO 8601 date of creation — resolve today's date from your environment |

> **Template parameter vs Cargo field:** the template parameter is `created`,
> but it stores to the Cargo field **`created_date`**. Page wikitext uses
> `|created=`; `{{#cargo_query:}}` filters use `created_date`.

Example (dates shown as placeholders — use real resolved dates):

```wikitext
{{Task
|title=Apply hostel infoboxes to 15+ pages
|status=claimed
|priority=medium
|category=template-admins
|assignee=SomeUser
|deadline=<TODAY+7>
|description=The {{Infobox Hostel}} template exists. Apply it to all hostel pages.
|created=<TODAY>
}}
```

Optional additional sections after the template call:

```wikitext
== Notes ==
* Links to relevant pages, reference material.

== Subtasks ==
* [ ] Step one
* [ ] Step two
```

---

## 6. User roles

Team affiliations are tracked as **categories on user pages**:

- `[[Category:Template Admins]]` on `User:Username`
- `[[Category:App Developers]]`
- `[[Category:PRC]]`
- `[[Category:Social Media]]`
- `[[Category:Video Editors]]`
- `[[Category:MCP Admins]]`

Query members of a team:
`get-category-members("Template Admins")` or
`{{#cargo_query:tables=WikiTasks|fields=assignee|where=category HOLDS "template-admins" AND status="open"|format=ul}}`

Role categories are Title Case, plural, matching wiki convention.

---

## 7. Page protection

| Page | Protection level |
|---|---|
| `WIKI FOSSCELL NITC:Task Board` | `sysop` — only admins edit the board layout |
| `WIKI FOSSCELL NITC:Tasks/*` | `autoconfirmed` — prevents spam/anons from creating tasks |
| `Template:Task` | `sysop` — Cargo-declaring template; changes need table rebuild |

Individual task pages are not protected beyond the namespace default, so
assignees can edit their own tasks.

---

## 8. Deadline conventions

- Format: `YYYY-MM-DD` (ISO 8601). Resolve "today" from your environment —
  never copy dates from documentation examples (see `rules/agent-conventions.md` §4).
- A past-deadline task that is not `done`, `cancelled`, or `in-progress` is
  **overdue**.
- Overdue tasks should be either updated with a new deadline or returned to
  `open` for someone else to pick up.
- Agents should flag overdue tasks in health reports.

---

## 9. Cross-referencing

When a task is about specific wiki pages, link them inside the `description`:

```wikitext
|description=Apply {{Infobox Hostel}} to [[:Category:Hostels]] pages.
```

To track which pages a task affects, use `get-links-here(title="WIKI FOSSCELL NITC:Tasks/<task>", type="wikilinks")`.

---

## 10. Stale task handling

A task is **stale** if:
- `status=claimed` and no edit for 14 days
- `status=in-progress` and no edit for 30 days
- `status=review` and no edit for 14 days

Agents should flag stale tasks in health reports. An admin may:
- Reassign to someone else
- Return to `open`
- Close as `done` if the work is verified complete

---

## 11. Prohibited actions

- Deleting task pages (close via `status=done` or `status=cancelled` so history is preserved).
- Setting `assignee` to a username that does not exist on the wiki.
- Setting `critical` priority without admin approval.
- Editing task pages to blank content.

---

## 12. Edit summary conventions for tasks

Format follows `rules/agent-conventions.md` §1 (plain ASCII hyphen):

| Action | Summary |
|---|---|
| Create task | `Bot: Create task "<title>" - <agent>` |
| Claim task | `Bot: Claim task - <agent>` |
| Assign | `Bot: Assign to <User> - <agent>` |
| Update status | `Bot: Mark <status> - <agent>` |
| Update deadline | `Bot: Update deadline to <date> - <agent>` |
| Cancel task | `Bot: Cancel task - <agent>` |
| Reopen | `Bot: Reopen task - <agent>` |

---

## 13. Board health report

A recurring health report should cover:

1. **Counts by status** — open / claimed / in-progress / review / done / cancelled
2. **Counts by priority** — critical / high / medium / low
3. **Unassigned open tasks** — grouped by category
4. **Stale tasks** — per §10 criteria
5. **Overdue tasks** — past deadline, not done or cancelled
6. **Orphan tasks** — assigned to a user that does not exist

The `board-janitor` skill (`.agents/skills/board-janitor`) automates this report.

---

## Authoritative references

- `Template:Task` on the live wiki — accepted field values and Cargo schema.
- `.agents/skills/wiki-task-board` — agent skill for working with tasks.
- `rules/page-types.md` — page-type recipe for tasks.
- `rules/templates.md` — template usage rules.
- `AGENTS.md` — master rulebook and review protocol.
