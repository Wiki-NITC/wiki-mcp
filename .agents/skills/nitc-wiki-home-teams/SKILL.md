---
name: nitc-wiki-home-teams
description: Format and edit NITC Wiki home team pages (cultural, sports, technical) using the main-page + yearly-sub-page pattern. Covers the generic {{Home Team Year Report}} template, {{Infobox Home Team}}, member tables with Name/Role/Branch, batch-organized achievements, and the YYYY: namespace convention. Use when creating or restructuring any home team page on wiki.fosscell.org.
---

# NITC Wiki Home Team Formatting

Every home team (cultural, sports, technical) on the NITC Wiki follows the same
two-layer pattern: a **main page** in the Main namespace and **yearly sub-pages**
in the YYYY: namespace. This skill documents that pattern.

> **New main pages:** For new home team main pages, prefer `{{Infobox Organization}}`
> (via `Form:Organization`) with `type=Cultural Organisation` / `Technical Organisation`
> / `Sports Organisation` — it stores to the `Organizations` Cargo table. The legacy
> `{{Infobox Home Team}}` (no Cargo storage) is only for existing pages.
> The yearly sub-page pattern (`{{Home Team Year Report}}`) is not deprecated.

## Reference pages (fetch these to see the pattern live)

- **`NITC Mime Team`** — the original model. Full yearly sub-pages from B08 to B25.
- **`The Act: Drama Team`** — the first team migrated to the generic template.

---

## Main page (Main namespace)

### Template: `{{Infobox Home Team}}` (deprecated — redirects to `{{Infobox Organization}}`)

Parameters (all optional):

| Parameter | Example |
|---|---|
| `name` | `The Act: Drama Team` |
| `image` | `The ACT .png` |
| `caption` | The ACT Logo |
| `type` | `Cultural`, `Technical`, or `Sports` |
| `discipline` | `English Drama`, `Classical French Mime`, `Football` |
| `founded` | `2013` |
| `batch_size` | `9–11` |
| `induction_year` | `1st year only` |
| `current_lead` | Name of current captain/lead |
| `faculty_advisor` | Name |
| `meeting_place` | e.g. `Main Ground` |
| `parent_fest` | `[[Ragam]]` |
| `achievements_count` | Number of prizes won |
| `instagram` | `https://www.instagram.com/...` |
| `website` | `https://...` |

### Body structure

1. **Bold lead sentence** — naming the team and what they do.
2. **`== Yearly Reports ==`** — bullet list of links to yearly sub-pages.
   Format: `* [[YYYY:TeamName|YYYY–YY (BXX)]]`
   e.g. `* [[2026:The Act|2025–26 (B25)]]`
3. **`== Achievements ==`** — organized by batch using `=== BXX ===` headings.
   Each entry: `'''Competition''' — Result`.
   Unknown-batch achievements go under `=== Earlier batches ===`.
4. **`== See also ==`** — `[[Home Teams]]`, `[[Ragam]]`, and related pages.
5. **Categories** at the bottom:
   - `[[Category:Home Teams]]` (always)
   - Plus subcategory if it exists: e.g. `[[Category:Cultural Home Teams]]`
     (verify with `search-page-by-prefix` before using).

---

## Yearly sub-pages (YYYY: namespace)

### Template: `{{Home Team Year Report}}`

The **generic** template — works for any home team (cultural, technical, sports).

Parameters (all optional):

| Parameter | Purpose | Example |
|---|---|---|
| `team` | Main team page title | `The Act: Drama Team` |
| `year` | Academic year | `2025–26` |
| `batch` | Batch label | `B25` |
| `type` | Team type | `Cultural` / `Technical` / `Sports` |
| `captain` | Team lead name | |
| `image` | Team photo filename | |
| `members` | Custom member table wikitext | See below |
| `achievements` | Competition results | |
| `participations` | Events table wikitext | |
| `project` | Technical team project description | |
| `docs` | Set to `yes` to add a Docs sub-page tab | `yes` |
| `videos` | Performance/competition video links | |
| `news` | News coverage links | |

### What the template generates

```
{{Home Team Year Tabs}}                    ← tab navigation (auto-detects base page)
{{Infobox Home Team Year}}                 ← infobox with team/year/batch/captain/project/image

= TeamName — Year (Batch) =

== Members ==
  Default: Captain/Lead row + empty Member rows
  Override via `members` param with custom wikitext

[if project set]
== Project ==
  {{{project}}}

== Achievements ==

== Participations ==  (always shown; placeholder table when empty)
  Sortable table: Event / Venue / Date / Result

[if docs set]
== Technical Documentation ==
  → link to sub-page /Docs

== Coverage ==
  === Videos ===
  === News ===

== See also ==
  → main page
```

### Member table

When `members` is omitted, the template renders a default table with
a Captain/Lead row (filled from the `captain` param) and empty Member rows.

**Override `members`** with full wikitext for team-specific roles.
The live column convention is **Name / Role / Branch**. Example for a drama team:

```wikitext
<table class="wikitable" style="width:100%;">
<tr><th style="background:#C0392B; color:white;">Name</th><th style="background:#C0392B; color:white;">Role</th><th style="background:#C0392B; color:white;">Branch</th></tr>
<tr><td>H R Soorya Dev</td><td>Writer</td><td>CSE</td></tr>
<tr><td>Anagha Burra</td><td>Actor, Writer</td><td>ECE</td></tr>
<tr><td>Savio Shijo</td><td>Actor</td><td>CSE</td></tr>
</table>
```

The `captain` param is **not** auto-inserted into the table when `members`
is overridden — include the captain in the custom table if desired.

### Participations table

`participations` takes bare `<tr>` rows — the template wraps them in the
`<table>` itself (columns: Event / Venue / Date / Result):

```wikitext
<tr><td>SlamDunk at NIT Surathkal</td><td>NIT Surathkal</td><td>14–16 March 2026</td><td>Runners Up</td></tr>
```

### Tab navigation

`{{Home Team Year Tabs}}` is called automatically by the template.
It generates a tab bar: **Main** | **Coverage** (| **Docs** if `docs` is set).
Coverage sub-pages go at `YYYY:TeamName/Coverage`, docs at
`YYYY:TeamName/Docs`.

### Technical teams

For technical home teams, use the `project` and `docs` params:
- `project` — describe the team's project for the year
- `docs` — set to `yes` to enable a Docs tab + Technical Documentation section
  (content goes on a `/Docs` sub-page)

### Example (minimal for a cultural team)

```wikitext
{{Home Team Year Report
| team           = The Act: Drama Team
| year           = 2025–26
| batch          = B25
| achievements   = Won second place at [[Ragam]] 2026.
}}
```

### Common mistakes

- **Hyphen instead of en-dash in `year`** — the field uses `2025–26`
  (en-dash `–`), not `2025-26`. A hyphen breaks consistency with every other
  yearly page.
- **Team name spelled differently from the main page title** — breaks the
  template's auto-generated `== See also ==` link back to the main page.
- **Adding `[[Category:Home Teams]]` manually** — the template adds it via
  `<includeonly>`; a manual duplicate creates category noise.

---

## Batch naming

- Batch number = the year first-years joined.
  Example: B25 joined in 2025, performs in academic year 2025–26.
- Yearly sub-page title uses the **end year** of the academic year:
  `2026:TeamName` for the batch performing in 2025–26.

> **Timeline caveat:** Batch-vs-academic-year mappings shift depending on
> college admin (induction delays, academic calendar changes). When in doubt,
> ask a human or leave the batch for the wiki editor to fill. Do not invent
> batch numbers based on assumptions about the academic calendar.

---

## Creating a new home team page

1. **Verify templates exist** (`get-page` on each):
   - `Template:Infobox Organization` (preferred for main page — has Cargo storage)
   - `Template:Home Team Year Report`
   - `Template:Infobox Home Team Year`
   - `Template:Home Team Year Tabs`
2. **Check no page exists** with the same name (`get-page`).
3. **Fetch a reference page** — `NITC Mime Team` or `The Act: Drama Team`.
4. **Draft the main page:**
   - `{{Infobox Organization}}` with `type=Cultural Organisation` / `Sports Organisation` (preferred — stores to `Organizations` Cargo table)
   - Do not use `{{Infobox Home Team}}` for new pages (legacy, no Cargo storage)
   - Bold lead sentence
   - `== Yearly Reports ==` listing
   - `== Achievements ==` by batch
   - `== See also ==`
   - Categories are auto-assigned by the template based on `type`
5. **Create at least one yearly sub-page** for the current batch:
   - Title: `YYYY:TeamName`
   - Content: `{{Home Team Year Report|team=|year=|batch=}}`
6. **Preview with `parse-wikitext`**, then **show the proposed wikitext to
   the human** before saving (Review Protocol, `Agents.md` §8).

## Editing an existing home team page

1. Fetch current content (`get-page`).
2. If migrating from flat text to structured format:
   - Add `{{Infobox Organization}}` with the matching `type` (preferred — enables Cargo queries) or `{{Infobox Home Team}}` (legacy).
   - Move existing achievements into batch-organized `== Achievements ==`.
   - Add `== Yearly Reports ==` with existing or placeholder yearly links.
   - Categories are auto-assigned by the template based on `type`.
3. Fetch with `metadata=true` and pass `latestId` on `update-page`
   (edit-conflict detection; on errors see `rules/agent-conventions.md` §3).
4. Always provide a clear edit summary:
   `Bot: <action> - <agent-name>`
