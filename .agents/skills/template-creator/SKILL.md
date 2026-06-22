---
name: template-creator
description: Create new structured wiki templates with Cargo declare/store, infobox display, Page Forms, preloads, and helper pages. For when a new data type needs structured storage on the NITC Wiki.
---

# Template Creator

Use this skill when asked to **design and create a new structured template** on the NITC Wiki — including the Cargo table, infobox display, Page Form, preload, and helper page.

---

## Golden rules

1. **Reuse before create.** Check if a template for this data already exists: `search-page("Template:Your Idea")` or `templates.md`
2. **Never edit** an existing Cargo-declaring template (`{{#cargo_declare:}}` / `{{#cargo_store:}}`) — that requires a table rebuild and human review
3. **Brand-new templates are safe** — no pages depend on them yet
4. **Match the wiki's style** — copy the pattern from existing templates like `Template:Bus Route` or `Template:Hostel Fee Structure`

---

## What to create (in order)

For each new structured data type, you need up to 4 wiki pages:

| # | Page | Purpose |
|---|---|---|
| 1 | `Template:Your Name` | Cargo declare + cargo store + display |
| 2 | `Form:Your Name` | Web UI for humans to fill in the template |
| 3 | `Template:Your Name/preload` | Pre-filled content for the create form |
| 4 | `WIKI FOSSCELL NITC:Create a Your Name` | Helper page with an `<inputbox>` button |

If the MCP session has write access, create them directly. If not (anonymous session), show the user the exact wikitext to paste at each URL.

---

## Step 1: Template anatomy

A template page has two sections:

### `<noinclude>` section — Cargo declaration + docs

```wikitext
<noinclude>{{#cargo_declare:_table=TableName
|field1=String
|field2=Integer
|field3=Date
|field4=Text
|field5=Boolean
}}</noinclude>
```

Cargo field types:

| Type | Use for |
|---|---|
| `String` | Short text, names, categories |
| `Text` | Longer text, descriptions, notes |
| `Integer` | Whole numbers (amounts, counts) |
| `Date` | Dates in YYYY-MM-DD format |
| `Boolean` | Yes/No, True/False |
| `Coordinates` | Lat, lon for maps |

After the declare comes the documentation (usage, parameter table, categories):

```wikitext
<noinclude>
== Your Name Template ==
Description.

=== Usage ===
<pre>
{{Your Name
|field1=value1
|field2=value2
}}
</pre>

=== Parameters ===
* field1 — Description

[[Category:Data templates]]
</noinclude>
```

### `<includeonly>` section — Cargo store + display

Always starts with `{{#cargo_store:}}` — writes the data to the Cargo table:

```wikitext
<includeonly>{{#cargo_store:_table=TableName
|field1={{{field1|}}}
|field2={{{field2|}}}
|field3={{{field3|}}}
|field4={{{field4|}}}
|field5={{{field5|}}}
}}
```

Then add the display. Three display patterns:

**Pattern A: Infobox (right-floated table)** — for data that has one record per page (like `{{Infobox Hostel}}`)

```wikitext
{| class="wikitable" style="float:right; margin-left:1em; width:300px;"
! colspan="2" style="background:#2980B9; color:white; text-align:center;" | Title
|-
! Field 1
| {{{field1}}}
|-
! Field 2
| {{{field2}}}
|}
```

**Pattern B: Minimal (no display box)** — for templates that are used many times on a single page (like `{{Event}}`, `{{Institute Fee Structure}}`). Just the cargo_store, no display.

**Pattern C: Styled card** — for visually prominent entries (like `{{Magazine Submission}}`)

### Complete example

```wikitext
<noinclude>{{#cargo_declare:_table=ExampleData
|name=String
|year=Integer
|description=Text
}}</noinclude><includeonly>{{#cargo_store:_table=ExampleData
|name={{{name|}}}
|year={{{year|}}}
|description={{{description|}}}
}}{| class="wikitable" style="float:right; margin-left:1em; width:300px;"
! colspan="2" style="background:#2C3E50; color:white; text-align:center;" | {{{name}}}
|-
! Year
| {{{year}}}
|-
! Description
| {{{description}}}
|}
</includeonly><noinclude>
== Example Template ==
Usage etc.

[[Category:Data templates]]
</noinclude>
```

---

## Step 2: Form creation

Forms let humans edit template data through the wiki UI at `Special:FormEdit/...`. Pattern:

```wikitext
<noinclude>
This form creates and edits Example pages.

{{#forminput:form=Example|button text=Create an Example page}}
[[Category:Forms]]
</noinclude><includeonly>
{{{info|create title=Create Example|edit title=Edit Example}}}
{{{for template|Template Name}}}
{| class="formtable"
! Field 1:
| {{{field|field1|mandatory|input type=text|size=50}}}
|-
! Field 2:
| {{{field|field2|input type=textarea|rows=4|cols=60}}}
|-
! Field 3:
| {{{field|field3|input type=dropdown|values=A,B,C}}}
|}
{{{end template}}}

'''Page content:'''

{{{standard input|free text|rows=8}}}

{{{standard input|summary}}}
{{{standard input|save}}} {{{standard input|preview}}} {{{standard input|cancel}}}
</includeonly>
```

Common input types:

| Type | When |
|---|---|
| `text` | Short text, numbers |
| `textarea` | Longer text, notes |
| `dropdown` | Fixed set of values |
| `date` | Date fields |
| `list` | Comma-separated values |

---

## Step 3: Preload template

The preload is placed at `Template:Your Name/preload` with a blank template call:

```wikitext
{{Your Name
|field1 = 
|field2 = 
|field3 = 
}}
```

This pre-fills the editor when someone creates a new page via the input box.

---

## Step 4: Helper page with input box

Place at `WIKI FOSSCELL NITC:Create a Your Name`:

```wikitext
{{DISPLAYTITLE:Create a Your Name}}
<div style="max-width: 700px; margin: 0 auto; padding: 1em;">
<div style="text-align: center; margin-bottom: 1.5em;">
<div style="font-size: 1.5em; font-weight: bold;">📄 Create a Your Name</div>
<div style="color: var(--color-base--subtle); margin-top: 0.5em;">Description...</div>
</div>

<div style="background: var(--color-surface-2); border-radius: 12px; padding: 1.5em; border: 1px solid var(--color-border);">
<inputbox>
type=create
default=
preload=Template:Your Name/preload
buttonlabel=Create
break=no
</inputbox>
</div>

<div style="margin-top: 1.5em; font-size: 0.9em; color: var(--color-base--subtle);">
Naming instructions...
</div>
</div>
[[Category:Wiki Maintenance]]
```

---

## Workflow summary

1. Identify the data fields and their types
2. Write the template (declare + store + display) — show the user
3. Create `Template:Your Name` on the wiki
4. Create `Form:Your Name` on the wiki
5. Create `Template:Your Name/preload` on the wiki
6. Create `WIKI FOSSCELL NITC:Create a Your Name` on the wiki
7. Test by creating a sample page

---

## Safety checklist

- [ ] Does a template for this already exist? (check via `search-page`)
- [ ] Is this a **new** template? (safe) Or editing an existing one? (stop → human review)
- [ ] Are field names consistent with existing templates (snake_case)?
- [ ] Does the Cargo table name match the template name?
- [ ] Is the form's `{{{for template|}}}` pointing to the right template?
- [ ] Is the preload URL correct (`Template:Your Name/preload`)?
- [ ] Does the helper page's `default=` suggest the right naming convention?
- [ ] Human confirmed the draft wikitext before saving?
