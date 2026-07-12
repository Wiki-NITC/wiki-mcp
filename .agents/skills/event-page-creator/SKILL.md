---
name: event-page-creator
description: Scaffold new event/festival edition pages on the NITC Wiki (e.g. `2026:FOSSMeet`, `2026:Tathva`, `2026:Ragam`). Use when asked to create an event page, set up a new edition of a recurring fest, or build out a full event page with subpages, Cargo data, infobox, and correct year-namespace title.
---

# Event Page Creator

Use this skill when **creating a new event or festival edition page** on
`wiki.fosscell.org`. Events are the most structured page type on the wiki - a
single wrong field silently breaks date-based Cargo queries and the "This day in
history" feature.

---

## Page naming

```
YYYY:EventName
```

Examples: `2026:FOSSMeet`, `2025:Ragam`, `2026:Tathva`, `2026:GDG DevFest NITC`.

The `YYYY:` year namespace is mandatory. Always add a **redirect** from the
common short name in main namespace:

```
#REDIRECT [[2026:FOSSMeet]]
```

Common redirect aliases: `FOSSMeet'26`, `FOSSMeet 2026` → `[[2026:FOSSMeet]]`.

---

## Required templates (in order)

Always read the relevant `Form:` and `Template:` pages on the live wiki for
current field names before writing.

### 1. `{{Event}}` - Cargo data (REQUIRED)

This template is what makes the event appear in date-based queries. Never omit it.

```wikitext
{{Event
| year        = 2026
| month       = February
| day         = 21
| description = Annual Free and Open Source Software conference at NIT Calicut.
| type        = Technical
| organizer   = FOSSCell
}}
```

`type` accepted values (check `Template:Event` for current list):
`Technical`, `Cultural`, `Sports`, `Hackathon`, `Workshop`, `Seminar`.

### 2. Infobox

For recurring fests, use the fest-specific infobox if it exists:

| Event | Infobox template |
|---|---|
| FOSSMeet | `{{Infobox FOSSMeet}}` |
| Ragam | `{{Infobox Event}}` |
| Tathva | `{{Infobox Event}}` |
| Generic | `{{Infobox Event}}` |

Always `get-page("Template:Infobox FOSSMeet")` (or the relevant one) to read
current fields before filling.

### 3. `{{DISPLAYTITLE:...}}` (optional)

Use when the stylised title differs from the page title:

```wikitext
{{DISPLAYTITLE:FOSSMeet'26}}
```

---

## Full page skeleton

```wikitext
{{Event
| year        = 2026
| month       = 
| day         = 
| description = 
| type        = Technical
| organizer   = FOSSCell
}}
{{Infobox FOSSMeet
| name        = FOSSMeet'26
| image       = 
| dates       = 
| venue       = NIT Calicut
| edition     = 21st
| theme       = 
| website     = 
| previous    = [[2025:FOSSMeet]]
| next        = 
}}
{{DISPLAYTITLE:FOSSMeet'26}}

'''FOSSMeet'26''' is the 21st edition of [[FOSSMeet]], the annual Free and Open
Source Software conference held at [[NIT Calicut]], organised by [[FOSSCell]].

== Highlights ==

== Sub Committees ==

== Speakers ==
See [[2026:FOSSMeet/Speakers]].

== Schedule ==
See [[2026:FOSSMeet/Schedule]].

== Team ==
See [[2026:FOSSMeet/Team]].

== Gallery ==
See [[2026:FOSSMeet/Gallery]].

== See also ==
* [[FOSSMeet]] - main page
* [[2025:FOSSMeet]] - previous edition

[[Category:FOSSMeet]]
[[Category:FOSSMeet 2026]]
[[Category:Events]]
```

---

## Subpages to create

After the main page, scaffold these as needed (check which exist for prior
editions first - use `get-page("2025:EventName/Schedule")` as a reference):

| Subpage | When to create |
|---|---|
| `/Schedule` | If the event has a programme grid |
| `/Speakers` | If there are confirmed speakers |
| `/Team` | Organising committee list |
| `/Gallery` | Post-event photos |
| `/Coverage` | Press/social media links |
| `/Roadmap` | Pre-event planning (FOSSMeet uses this) |

Minimal subpage stub:
```wikitext
''Schedule to be announced.''

[[Category:FOSSMeet 2026]]
```

---

## Categories

Every event page needs **three layers**:

1. **Specific** - `FOSSMeet 2026`, `Ragam 2025`
2. **Series** - `FOSSMeet`, `Ragam`, `Tathva`
3. **Umbrella** - `Events`

Verify all three exist with `search-page` before using.

---

## Workflow

1. Confirm the event doesn't already have a page: `get-page("YYYY:EventName")`.
2. Fetch the previous edition's page as a structural reference:
   `get-page("YYYY-1:EventName")`.
3. Read the relevant `Template:Infobox X` for current field names.
4. Draft the main page wikitext (skeleton above, filled in).
5. **Preview with `parse-wikitext`** — verify the infobox and Event template
   render without errors (`rules/agent-conventions.md` §2).
6. Show the human the proposed page and confirm before saving.
7. `create-page` with summary `Bot: Create YYYY:EventName - <agent>`.
8. Create the main-namespace redirect(s).
9. Scaffold subpages if requested (one `create-page` call each).

**On write errors** (conflict, permission, auth): follow
`rules/agent-conventions.md` §3. If editing an existing event page instead of
creating, fetch with `metadata=true` and pass `latestId` on `update-page`.

> The `== Highlights ==` / `== Sub Committees ==` headings are this page
> family's established structure — keep them as-is (see `rules/editing.md` §1,
> established-family exception).

---

## Common mistakes to avoid

- Omitting `{{Event}}` - the page won't appear in Cargo queries.
- Using `YYYY-YY` (hyphen) in the year namespace instead of just `YYYY`.
- Creating the page in main namespace instead of `YYYY:` namespace.
- Using categories that don't exist yet - verify first.
- Putting content in `{{DISPLAYTITLE}}` that differs from the real title pattern
  (confuses redirects).

---

## Authoritative references

- `rules/page-types.md` → "Event / festival edition" section.
- `rules/namespaces.md` → year-namespace IDs (3000–3135).
- `rules/structured-data.md` → how `{{Event}}` feeds Cargo.
- `Template:Event` on the live wiki - required field reference.
- `Template:Infobox FOSSMeet` / `Template:Infobox Event` - infobox field reference.
