---
name: cargo-auditor
description: "Audit Cargo table data quality on the NITC Wiki: blank required fields, junk rows from preload pages, pages that transclude a data template but store nothing, and duplicate rows. Use when asked to audit Cargo data, check table health, or find pages with missing or broken structured data."
---

# Cargo Auditor

Use this skill to **audit the Cargo data layer** of `wiki.fosscell.org` in bulk.
Cargo tables drive the Main Page "This day in history" feature, listing pages,
and the magazine index. Bad rows break those silently.

This skill is read-heavy: detect first, report to a human, then fix
page-by-page.

---

## The tables

**Never rely on a hardcoded table list — discover the live set at the start
of every audit.** Tables appear and disappear as templates evolve (e.g.
`Organizations` replaced the old `Clubs` table; ingest skills add tables like
`BusRoutes`, `HostelFees`, `InstituteFees`).

1. Preferred: `cargo-list-tables`, then `cargo-describe-table` per table for
   field schemas.
2. If those tools are restricted or stuck (see failure-modes note below):
   fetch `Special:CargoTables` in a browser, or infer tables from the
   Cargo-declaring templates (`rules/templates.md` lists the data templates).

---

## CRITICAL: how to actually run queries

The `cargo-query` MCP tool calls the Cargo API, which on this wiki is
restricted. Regular accounts (group `student`) get:

```
permission_denied: You don't have permission to run arbitrary Cargo queries.
```

**Workaround that works for any account**: run the query as a
`{{#cargo_query:}}` parser function through `parse-wikitext`. The parser
function executes with page-render permissions, not API permissions.

```
parse-wikitext(wikitext="{{#cargo_query:tables=Events
  |fields=_pageName,year,month,day,type,organizer
  |where=type='' OR organizer=''
  |order by=year DESC
  |limit=100
  |format=ul}}")
```

Notes on this technique:

- Output is rendered HTML, not JSON. Parse the `<li>` items.
- Numbers come back locale-formatted (`2,026` means `2026`).
- Cargo collapses NULL to empty string, so `field=''` matches both unset and
  empty values.
- Paginate by adding `|offset=N`. A `More...` link in the output means more
  rows exist.
- `group by=` and `order by=` are supported (with spaces, unlike the API).
- Try the `cargo-query` tool first; if it returns `permission_denied`, switch
  to this method. Do not retry the API.
- **Failure mode**: after a network outage the `cargo-*` tools can keep
  failing with "Wiki could not be reached to check for the extension" even
  once the wiki is back — the server cached a failed extension probe. The
  parser-function method keeps working; a full MCP client restart clears the
  tools. See `rules/agent-conventions.md` §6.

The canonical description of this technique lives in
`rules/structured-data.md` § Querying Cargo.

---

## Audit recipes

### 1. Blank required fields

Each table has fields that must be filled for queries to work. Examples:

- `Events`: `year`, `month`, `day`, `type` (blank month/day breaks
  "This day in history")
- `WikiTasks`: `task_title`, `status`
- `MagazineSubmissions`: `title`, `type`, `year`
- `UserProfiles`: `display_name`

Query pattern:

```
{{#cargo_query:tables=Events|fields=_pageName,month,day|where=month='' OR day=''|format=ul}}
```

Fix: fetch each flagged page, fill the blank template parameters, save with
summary `Bot: Fill missing Cargo fields - <agent>`.

### 2. Junk rows from preload pages

Preload pages (`Template:X/preload`) transclude the data template with blank
fields, so they store a garbage row in the table.

**Known recurring case**: `Template:User Profile/preload` has stored a junk row
in `UserProfiles` with `display_name=User Profile` (tracked as repo issue #13).
Check it and every other `/preload` page each audit.

Detect:

```
{{#cargo_query:tables=UserProfiles|fields=_pageName|where=_pageName LIKE 'Template:%'|format=ul}}
```

Run the same check on every table. Fix requires a template edit (wrap the
`{{#cargo_store:}}` call in a namespace check), which needs template-editor
rights: produce the exact change and hand it to an admin.

### 3. Transcluding but not storing

A page that transcludes a data template but produced no row means the
template call is malformed (typo in a parameter name, broken nesting).

Detect by comparing two lists:

```
get-links-here(title="Template:Event", type="transclusions")
{{#cargo_query:tables=Events|fields=_pageName|limit=500|format=ul}}
```

Pages in the first list but not the second are broken. Fetch each and compare
its template call against `Template:Event`'s documented parameters.

### 4. Duplicate rows

A page storing two rows in the same table usually means the template is
transcluded twice (often a copy-paste leftover).

```
{{#cargo_query:tables=Events|fields=_pageName,COUNT(*)=n|group by=_pageName|having=COUNT(*)>1|format=ul}}
```

Fix: fetch the page and remove the duplicate template call, keeping the one
with more fields filled.

### 5. Values outside the accepted set

Listing pages filter on exact strings, so near-miss values vanish from lists
(a real past incident: `Comic` stored instead of the accepted `Comics` in
`MagazineSubmissions.type`, making entries vanish from the magazine index).
Group by the field and eyeball the distinct values:

```
{{#cargo_query:tables=MagazineSubmissions|fields=type,COUNT(*)=n|group by=type|format=ul}}
```

Singleton values that look like variants of a bigger bucket are suspects.
Check the live listing page or template doc for the accepted set before
renaming anything.

---

## Workflow

1. `cargo-list-tables`, then `cargo-describe-table` for each table in scope.
2. Run recipes 1 to 5 per table. Collect findings into a single report:
   table, page, problem, proposed fix.
3. Show the report to a human before editing anything.
4. Apply approved fixes one page at a time with clear edit summaries.
5. Template-namespace fixes go to an admin as exact wikitext, not as edits.

## Authoritative references

- `rules/structured-data.md` - how Cargo is set up on this wiki; what not to
  touch (never edit `{{#cargo_declare:}}` blocks).
- `Agents.md` - review protocol and write rules.
- `.agents/skills/wiki-diagnostics` - page-level structural checks; this
  skill is the bulk, query-driven complement to its Cargo section.
