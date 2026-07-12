# Namespace Rules

Defines which MediaWiki namespaces agents may operate in on the NITC Wiki
([wiki.fosscell.org](https://wiki.fosscell.org)) and the naming conventions for
each. **Verified against the live wiki** (MediaWiki 1.45, Semantic MediaWiki +
Cargo + Page Forms).

> The canonical project namespace is **`WIKI FOSSCELL NITC:`** (the MediaWiki
> "Project" namespace), not `Project:`. Both resolve to the same place.

---

## Content namespaces agents use most

| Namespace | ID | Read | Write | Notes |
|---|---|---|---|---|
| Main (article) | 0 | Yes | Yes | Standard articles: clubs, people, places, departments. |
| `YYYY:` (year) | 3000–3135 | Yes | Yes | **Event/edition pages live here**, e.g. `2026:FOSSMeet`, `2026:Ragam`. One namespace per year 1961–2028. |
| `HowTo:` | 3200 | Yes | Yes | How-to guides and tutorials. Subpaged: `HowTo/Beginner`, `HowTo/AI`. |
| `WIKI FOSSCELL NITC:` (Project) | 4 | Yes | Caution | Wiki policy, the Task Board, form-helper pages. Edit policy pages only with human review. |
| `Category:` | 14 | Yes | Yes | See [categories.md](categories.md). Title Case, plural. |
| `File:` | 6 | Yes | **No** | Uploads are disabled — see [uploads.md](uploads.md) for status and policy. `Image:` is an alias. |
| `Help:` | 12 | Yes | Caution | Help docs — edit only with human review. |
| `User:` | 2 | Yes | Operator only | Only the agent operator's own user pages. |

## Structured-data namespaces (read before editing)

These power Cargo/SMW/Page Forms. **Do not edit without explicit human approval** —
breaking one breaks data entry or queries site-wide. See
[structured-data.md](structured-data.md).

| Namespace | ID | What it holds |
|---|---|---|
| `Template:` | 10 | Infoboxes and Cargo data templates. Protected (`editinterface`). |
| `Form:` | 106 | Page Forms definitions (`Form:Club`, `Form:Event`, …). |
| `Property:` | 102 | Semantic MediaWiki properties. |
| `Concept:` | 108 | SMW concepts. |
| `Module:` | 828 | Lua (Scribunto) modules. `Module` content model. |
| `Widget:` | 274 | Widgets. Protected (`editwidgets`). |
| `GeoJson:` | 420 | Map data. `GeoJSON` content model. |
| `smw/schema:` | 112 | SMW schemas. `smw/schema` content model. |

## Never edit without written human approval

| Namespace | ID | Reason |
|---|---|---|
| `MediaWiki:` | 8 | System messages / interface. Protected (`editinterface`). |
| `Template:` | 10 | Structured-data backbone — test in a sandbox first. |
| `Widget:`, `Module:`, `smw/schema:`, `GeoJson:` | — | Code/schema; a bad edit breaks pages. |
| `Translations:` | 1198 | Managed by the Translate extension, not by hand. |
| `Campaign:` | 460 | UploadWizard campaigns. |

`Special:` (-1) and `Media:` (-2) are virtual — read via the API where supported,
never "edit".

---

## Naming conventions (established practice)

These are the patterns the wiki already follows. A formal page is planned at
`WIKI FOSSCELL NITC:Naming Conventions`; until then, match existing pages.

- **Events / editions** → `YYYY:EventName` in the year namespace.
  Examples: `2026:FOSSMeet`, `2025:Ragam`, `2026:Tathva`.
- **Event subpages** → `/Schedule`, `/Speakers`, `/Team`, `/Gallery`, `/Coverage`,
  `/Roadmap`. Example: `2026:FOSSMeet/Schedule`.
- **People** → `Firstname Lastname` in the main namespace. Example: `Kailash Nadh`.
- **Clubs / organisations** → the club's common name. Example: `FOSSCell`.
- **Redirects** → create a main-namespace redirect from the common name to the
  canonical page (e.g. `FOSSMeet'26` → `[[2026:FOSSMeet]]`), and tag the redirect
  with the relevant category.
- **Titles** are first-letter-case (MediaWiki capitalises the first letter). Use
  natural capitalisation for the rest; use `{{DISPLAYTITLE:...}}` for stylised
  titles like `FOSSMeet'26`.
- Avoid special characters except `-`, `/`, `'`, and `:` (namespace separator).

When unsure of the right title or namespace, search for a sibling page first
(`search-page` / `search-page-by-prefix`) and copy its pattern.
