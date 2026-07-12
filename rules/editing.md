# Editing Rules — Wikitext Style Guide

The wikitext style AI agents should follow when creating or editing pages on the
NITC Wiki. For *what* to put on each kind of page, see
[page-types.md](page-types.md) and [structured-data.md](structured-data.md).

---

## 1. Section headings

Use `==` and `===` for section headings. Do not use `=` for the page title.

Correct:
```wikitext
== History ==
=== Early years ===
=== Recent developments ===
== Organisation ==
```

Incorrect:
```wikitext
= History =   (reserved for page title)
==Early years==  (no space — hard to read)
===Early Years===  (inconsistent capitalisation)
```

Heading capitalisation: Sentence case. Capitalise the first word and proper nouns only.

> **Exception — established page families.** Some page families predate this rule
> and use fixed headings (event pages: `== Sub Committees ==`, `== Highlights ==`;
> meeting minutes: `== Meeting Info ==`, `== Action Items ==`). When adding to an
> existing family, match its established headings — consistency within the family
> beats the general rule.

## 2. Text formatting

| Purpose | Syntax |
|---|---|
| Bold | `'''text'''` |
| Italic | `''text''` |
| Bold italic | `'''''text'''''` |
| Strikethrough | `<s>text</s>` (use sparingly) |
| Inline code | `<code>text</code>` |
| Block code | `<pre>text</pre>` or indent with space |

Do not use HTML `<b>`, `<i>`, or `<u>` tags — use wikitext equivalents.

## 3. Internal links

- Link to wiki pages: `[[Page title]]` or `[[Page title|display text]]`.
- Link to a section: `[[Page title#Section heading]]`.
- Link to a category: `[[:Category:Category name]]` (leading colon renders as link, not categorisation).
- Link to a file: `[[File:Filename.png|thumb|caption]]`.
- Plurals work via the link trail: write `[[Page]]s`, not `[[Page|Pages]]`.
- Link to an event in a year namespace with its prefix: `[[2026:FOSSMeet]]`.

## 4. External links

- Named: `[https://example.com Display text]`
- Bare URL: `https://example.com` (avoid — always provide display text)
- References: `[https://example.com Display text]` wrapped in `<ref>` tags.

## 5. References and citations

- Use `<ref>` tags for inline citations, containing a plain external link and
  source name:
  ```wikitext
  <ref>[https://example.com Example Source], retrieved <TODAY>.</ref>
  ```
- **Do not use `{{Cite web}}`, `{{Cite book}}`, or `{{Reflist}}`** — the CS1
  citation modules are not imported on this wiki, so they render as red links.
  See [templates.md](templates.md) § Citations.
- Place references section at the bottom, before categories:

```wikitext
== References ==
<references />
```

## 6. Lists

Unordered:
```wikitext
* Item one
* Item two
** Sub-item
* Item three
```

Ordered:
```wikitext
# First
# Second
## Sub-step
# Third
```

Definition lists:
```wikitext
; Term
: Definition
```

## 7. Tables

Use MediaWiki table syntax, not HTML `<table>`:

```wikitext
{| class="wikitable"
|+ Caption
! Header 1 !! Header 2
|-
| Cell 1 || Cell 2
|-
| Cell 3 || Cell 4
|}
```

Always include `class="wikitable"` for standard styling.

## 8. Edit summaries

See `Agents.md § Identity` for the required edit summary format. Summaries must:

- Be non-empty.
- Briefly describe what changed and why.
- Not contain personal information.

## 9. Markup: prose vs. presentation

Keep a clean split:

- **Article prose** — plain wikitext. Don't wrap ordinary paragraphs in `<div>`,
  add inline CSS, or build layout tables. Use headings, lists, and links.
- **Presentation/layout** lives in **templates** (infoboxes, Main Page sections,
  tabs). These legitimately use `<div style="...">` and tables — that's how the
  wiki is built. If you must style inside a template, use the theme's **CSS
  variables** (`var(--color-surface-2)`, `var(--color-border)`, …) so pages stay
  night-mode aware. Never hardcode hex colours.
- No `<font>` tags (deprecated). Avoid raw HTML where a wikitext equivalent exists.

## 10. Useful parser features on this wiki

- **Diagrams:** `{{#mermaid:}}` renders Mermaid graphs (used in club "Team
  Structure" sections).
- **Display titles:** `{{DISPLAYTITLE:FOSSMeet'26}}` for stylised titles; the real
  page title still follows the naming convention.
- **Structured data:** `{{#cargo_query:}}` to list data instead of hand-maintained
  lists. See [structured-data.md](structured-data.md).

## 11. Page structure

Pages should follow this general structure:

```wikitext
'''Lead paragraph''' — bold summary of the page topic.

== Section 1 ==
Content here.

== Section 2 ==
Content here.

=== Subsection 2.1 ===
Content here.

== See also ==
* [[Related page 1]]
* [[Related page 2]]

== References ==
<references />

[[Category:Category name]]
```
