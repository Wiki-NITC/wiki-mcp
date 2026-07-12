---
name: wiki-diagnostics
description: "Find and fix structural problems on the NITC Wiki: broken preload forms, empty templates, missing infoboxes, orphaned pages, stub pages without categories, and Cargo data gaps. Use when asked to audit, health-check, or fix the wiki."
---

# Wiki Diagnostics

Use this skill when asked to **audit, health-check, or fix** structural problems
on **wiki.fosscell.org**. It covers the most common failure modes and how to
resolve each.

---

## 1. Broken Create Forms (InputBox + preload)

Create forms on pages like `WIKI FOSSCELL NITC:Log FOSSCell Activity` use
`<inputbox>` with `preload=Template:X/preload`. They break silently when the
preload page is empty or missing.

### How to detect

```
get-page("WIKI FOSSCELL NITC:Log FOSSCell Activity")
get-page("WIKI FOSSCELL NITC:Create FOSSCell Event")
get-page("WIKI FOSSCELL NITC:Create an event")
get-page("WIKI FOSSCELL NITC:Submit to the Magazine")
get-page("WIKI FOSSCELL NITC:Create a Book Club meeting")
get-page("WIKI FOSSCELL NITC:Create Task")
```

For each `preload=` value found, fetch that page and check if its `source` is
empty or missing.

### How to fix

- If the preload **page is missing** and is in the main namespace (e.g.
  `Club/preload`, `Centre/preload`) → use `create-page`.
- If the preload **page exists but is empty** and is in `Template:` namespace →
  you need template-editor/sysop rights. Surface to a human with the exact
  content to paste in.
- Build the preload content from the corresponding `Template:X` - read it first
  for exact field names.
- Preload format: `{{TemplateName\n| field = \n| field = \n}}` followed by
  commented instructions, then stub sections (`== About ==`, etc.).

### Known recurring candidate

`Template:FOSSCell Activity/preload` has been found empty in past audits
(requires admin to fix). Re-check it — and every other `/preload` page — on
each run rather than assuming past state. The correct content is the
`{{FOSSCell Activity}}` template invocation with all fields blank, a comment
block explaining each field, and stub sections.

---

## 2. Pages Missing Infoboxes

Pages that should have a structured infobox but don't will not appear in Cargo
queries or on listing pages (e.g. `Clubs`, `Multidisciplinary Centres`).

### How to detect

```
get-links-here(title="Template:Infobox Organization", type="transclusions")
search-page(query="Category:Clubs")
```

Compare the two lists. Pages in the category but not transcluding the infobox
are candidates for fixing. Pages transcluding the infobox but not in the
category are candidates for categorization fixes.

### How to fix

Fetch the page, fetch a sibling page that has the infobox, and add the
`{{Infobox Organization | ... }}` block at the top. Never replace existing prose - prepend
the infobox. Always read `Template:Infobox Organization` for current field names first.

---

## 3. Stub Pages Without Categories

Pages with `{{Stub}}` or very little content (< 200 bytes) and no category will
never surface in navigation.

### How to detect

```
search-page(query="stub")
```

Scan results for pages with no `[[Category:...]]` line.

### How to fix

Add the appropriate category based on page type (see `rules/categories.md`).
Mark with `{{Stub}}` if not already present.

---

## 4. Cargo Data Gaps

Pages that use `{{#cargo_store:}}` templates (via infoboxes) but have blank
required fields will produce null rows in Cargo queries, breaking dashboards.

### How to detect

Look for pages where the infobox `name=` field is blank (defaults to
`{{PAGENAME}}` - usually fine) or where `type=` / `year=` are empty on event
pages. Fetch a sample of pages from:

```
get-links-here(title="Template:Infobox Event", type="transclusions")
get-links-here(title="Template:Infobox Organization", type="transclusions")
```

### How to fix

Fetch the page, identify which fields in the infobox are empty, and fill them
in. Use an edit summary like `Bot: Fill missing Cargo fields - <agent>`.
**Never edit a `{{#cargo_declare}}` block** - that requires a table rebuild and
human review.

---

## 5. Missing Preload Pages (InputBox form links)

Listing pages like `Clubs` and `Multidisciplinary Centres` have
`action=edit&preload=X` links. If `X` doesn't exist, the editor opens blank.

### How to detect

```
get-page("Clubs")        → look for preload= values
get-page("Multidisciplinary Centres")
```

Fetch each preload target with `get-page`; if missing → create it.

### Checking

Do not assume past audit state — fetch each preload target on every run
(`Club/preload` and `Centre/preload` were correct in past audits but can
change).

---

## Workflow

1. Run detection steps above - surface findings to human before fixing anything.
2. For each fixable issue: fetch the relevant `Template:X`, fetch a sibling page,
   draft the fix, preview with `parse-wikitext`, show the human the diff, then
   apply with `latestId` conflict detection.
3. For issues that require admin rights (Template namespace edits): produce the
   exact content and tell the human which page to edit.
4. Log every change with summary `Bot: Fix <issue> - <agent>`.
5. On write errors, follow `rules/agent-conventions.md` §3.

> If the `cargo-*` tools error with "Wiki could not be reached to check for
> the extension" while other tools work, the server cached a failed extension
> probe (see `rules/agent-conventions.md` §6) — use `{{#cargo_query:}}` via
> `parse-wikitext` and ask the operator to restart the MCP client.

## Authoritative references

- `AGENTS.md` - what requires human review before writing.
- `rules/templates.md` - which templates exist.
- `rules/structured-data.md` - how Cargo/SMW works; what not to break.
- `rules/page-types.md` - preload content patterns per page type.
