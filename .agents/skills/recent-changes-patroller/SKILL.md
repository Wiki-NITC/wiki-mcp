---
name: recent-changes-patroller
description: Patrol the NITC Wiki recent-changes feed for quality problems (new pages without categories, event pages missing Cargo templates, naming-convention violations, bad edit summaries, and revision-churn bursts). Use when asked to patrol recent changes, review recent activity, or run a daily/weekly quality check.
---

# Recent Changes Patroller

Where `wiki-gardener` drains old backlog, this skill **stops new backlog from
forming**: it patrols the recent-changes feed and flags quality problems
while they're one revision deep instead of one semester deep.

Read-only detection; fixes go through a human-approved report.

---

## Gathering the feed

```
get-recent-changes(types=["edit","new"], since="<window-start ISO 8601>")
```

Default window: since the last patrol, or 7 days. Paginate with the
`continue` token if the window returns the 50-row cap.

---

## Checks

### 1. New pages missing basics

For each `isNew` row, `get-page` and flag:

- **No `[[Category:...]]`** — every page needs at least one
  (`rules/categories.md`).
- **Event page without `{{Event}}`** — a page in a `YYYY:` namespace
  (IDs 3000–3135) that doesn't transclude `{{Event}}` never appears in
  date queries (`rules/structured-data.md`).
- **Typed page without its infobox** — a page that reads like a club,
  person, course, hostel, etc. but lacks the matching template
  (`rules/page-types.md`).

### 2. Naming-convention violations

Flag new titles that break `rules/namespaces.md`:

- Events created in main namespace instead of `YYYY:`.
- Special characters outside `- / ' :`.
- People pages not in `Firstname Lastname` form.
- Missing main-namespace redirect for a new event edition (check
  `get-page` on the common name).

### 3. Edit summary hygiene

Flag agent edits (summaries containing `via ... MCP Server`) whose summary
doesn't follow `Bot: <action> - <agent>` (`rules/agent-conventions.md` §1),
and any run of edits with empty summaries.

### 4. Revision-churn bursts

Flag **more than 5 consecutive revisions by one account on one page inside
an hour** — almost always someone iterating styling through saved edits
instead of previewing (`rules/agent-conventions.md` §2; this exact pattern
has happened: a dozen straight revisions adjusting table colours). The fix
is coaching, not reverting: note the account and point them at the
preview-before-save rule.

### 5. Suspicious content changes

Flag for human eyes (never act alone): large deletions (`sizeDelta` below
about -2000 on content pages), page blanking, and repeated
revert/counter-revert pairs (`mw-manual-revert` tags bouncing).

---

## Report format

One report per patrol, grouped by check, each finding with: page, revision
or timestamp, problem, proposed action (fix / coach / escalate). End with
counts per check so trends are visible patrol-over-patrol.

Deliver the report to the human. Apply only approved fixes, one revision
per page, `latestId` passed, summaries per `rules/agent-conventions.md` §1.

## Guardrails

- Patrolling is detection: **no autonomous reverts, no user talk-page
  messages** without explicit human approval.
- Don't re-flag findings already reported in a previous patrol unless they
  got worse (keep a short state note with the report if run recurringly).
- Escalate anything that looks like vandalism or spam to a human admin
  immediately — blocking users is always human-only (`AGENTS.md` §6).
- On write errors, follow `rules/agent-conventions.md` §3.

## Authoritative references

- `rules/agent-conventions.md` — summary format, preview/batching rule.
- `rules/namespaces.md`, `rules/categories.md`, `rules/page-types.md` —
  the conventions being enforced.
- `.agents/skills/wiki-gardener` — fixes the backlog this skill prevents.
- `.agents/skills/wiki-diagnostics` — deeper structural checks.
