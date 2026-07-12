# Template Rules

Which templates agents may use on the NITC Wiki. **This list is verified against
the live `Template:` namespace** — these templates actually exist. Citation
templates (`Cite web`, etc.) are *not yet imported*, so don't assume them.

> Many of these are **Cargo data templates**: filling them in stores structured
> data that powers queries and features like "This day in history." Always prefer
> the right structured template over hand-rolled formatting. See
> [structured-data.md](structured-data.md).

---

## Infobox & data templates (by page type)

| Template | Use on | Auto-categorises pages as | Template page categorised under | Notes |
|---|---|---|---|---|---|
| `{{Infobox Organization}}` | Any organisation (club or home team) — **preferred** | Varies by `type`: see below | `Category:Infobox templates` | **Stores to `Organizations` Cargo table** (27 fields). Replaces `{{Infobox Club}}` and `{{Infobox Home Team}}` for new pages. `type` values: `Cultural Organisation`, `Technical Organisation`, `Sports Organisation`, `Professional Organisation`, `Non-Technical Organisation`. Auto-categorises: Cultural → `Home Teams`; Technical/Professional/Non-Technical → `Clubs` + type-specific cat; Sports → `Sports`. |
| `{{Infobox Club}}` | Club / organisation pages — **legacy** | `Category:Clubs and Organizations` | `Category:Infobox templates` | **No Cargo storage.** Use `{{Infobox Organization}}` instead for new pages. Parameters: `name`, `image`, `type`, `affiliated_with`, `teams`, `flagship_event`. **Redirects to `{{Infobox Organization}}`**. |
| `{{Infobox Home Team}}` | Home teams — **legacy** | `Category:Home Teams` | `Category:Infobox templates` | **No Cargo storage.** Use `{{Infobox Organization}}` with `type=Cultural Organisation` / `Technical Organisation` / `Sports Organisation` for new main pages. **Redirects to `{{Infobox Organization}}`**. |
| `{{Infobox Home Team Year}}` | Home team yearly pages | *(none — gap)* | `Category:Infobox templates` | Does not auto-categorise pages; consider adding manually. Not deprecated. |
| `{{Infobox FOSSMeet}}` | FOSSMeet edition pages | `Category:FOSSMeet`, `Category:Events` (+ year-specific) | `Category:Infobox templates` | edition/year/dates/venue/keynote/etc. |
| `{{Infobox Event}}` | General event pages | `Category:Events` | `Category:Infobox templates` | |
| `{{Infobox Person}}` | People | `Category:People` | `Category:Infobox templates` | |
| `{{Infobox Faculty}}` | Faculty | `Category:Faculty` | `Category:Infobox templates` | |
| `{{Infobox Course}}` | Courses | `Category:Courses` | `Category:Infobox templates` | |
| `{{Infobox Building}}` | Academic/campus buildings | `Category:Places in NITC` | `Category:Infobox templates` | |
| `{{Infobox Campus Location}}` | Campus places | `Category:Campus` | `Category:Infobox templates` | |
| `{{Infobox Hostel}}` | Hostels | `Category:Hostels` | `Category:Infobox templates` | |
| `{{Infobox Centre}}` | Centres | `Category:Multidisciplinary Centres` | `Category:Infobox templates` | |
| `{{Infobox SAC Meeting}}` | SAC meeting minutes | `Category:SAC Minutes`, `Category:Student Government` | `Category:Infobox templates` | |
| `{{Event}}` | **Any event page** | *(none — Cargo only)* | `Category:Infobox templates`, `Category:Main Page templates` | Stores to `Events` table; enables "This day in history". Pair with the matching infobox. |
| `{{Community}}` | Community/interest-group pages | *(none — Cargo only)* | `Category:Infobox templates` | |
| `{{Task}}` | Project Task Board entries | *(none — Cargo only)* | `Category:Infobox templates` | `title`, `status`, `priority`, `category`, `description`, `created` |

> **Don't guess parameters.** Before filling an infobox, read its template page
> (`get-page` on `Template:Infobox X`) or the matching `Form:X` to get the exact,
> current parameter names. Parameters change; the template/form is the source of truth.

> **Category names** in the tables above must exist in
> [categories.md](categories.md)'s top-level table — that file is the single
> authority for category names. If they diverge, categories.md wins.

## Maintenance & status templates

| Template | Purpose | Auto-categorises pages as | Template page categorised under |
|---|---|---|---|
| `{{Stub}}` | Marks a short/incomplete page | `Category:Stubs` | `Category:Infobox templates`, `Category:Maintenance templates` |
| `{{Cleanup}}` | Page needs formatting/structure fixes | `Category:Pages needing cleanup` | `Category:Maintenance templates` |
| `{{Outdated}}` | Content is out of date | `Category:Pages needing updates` | `Category:Maintenance templates` |

## Preload templates

Preload templates supply default wikitext when creating a new page via a form.
Every preload must be categorised under `Category:Preload templates`.

| Template | Used by form | Template page categorised under |
|---|---|---|
| `Template:Infobox Organization/preload` | Create an Organisation form | `Category:Preload templates` |
| `Template:Infobox Hostel/preload` | Create a Hostel form | `Category:Preload templates` |
| `Template:Infobox Home Team Year/preload` | Create a Home Team Year form | `Category:Preload templates` |
| `Template:Infobox Campus Location/preload` | Create a Building form | `Category:Preload templates` |
| `Template:Infobox Centre/preload` | Create a Centre form | `Category:Preload templates` |
| `Template:Task/preload` | Create Task form | `Category:Preload templates` |
| `Template:Book Club Meeting/preload` | Create a Book Club meeting form | `Category:Main Page templates` |
| `Template:Event/preload` | Create an event form | `Category:Main Page templates` |

> Preloads use `<includeonly>` to wrap form content and `<noinclude>` for the
> self-category. Never leave a preload's wikitext bare — always use this structure
> so the template page itself isn't accidentally categorised as content.

There is no `{{Under construction}}` or generic `{{Infobox}}` on this wiki — use
the specific templates above.

---

## Citations

CS1/Citation modules are **not yet imported** (it's an open task). Until then:

- Cite inline with `<ref>` tags containing a plain external link and source name:
  ```wikitext
  <ref>[https://example.com Example Source], retrieved 2026-06-09.</ref>
  ```
- Put `<references />` under a `== References ==` heading.
- Do **not** add `{{Cite web}}` / `{{Cite book}}` / `{{Reflist}}` — they don't
  resolve yet and will render as red links.

---

## Creating or editing templates

Templates are the wiki's structured-data backbone and live in a protected
namespace. Treat them as code:

> **Permission note:** this wiki protects the `Template:` namespace with the
> `editinterface` right specifically — not the more common `editprotected` or
> `sysop`. If an edit fails with `protectednamespace`, check
> `Special:ListGroupRights` for which right the Template row actually
> requires, rather than assuming it's `editprotected`. `scripts/validate-config.sh`
> checks for `editinterface` on the configured bot account ahead of time.

1. **Reuse first.** Check for an existing template before making a new one.
2. **Do not edit a live template** that pages depend on without human review —
   a bad edit can break every page that transcludes it (and its Cargo table).
3. If a template declares a Cargo table (`{{#cargo_declare:}}`) or stores data
   (`{{#cargo_store:}}`), changing fields requires a Cargo table rebuild — always
   surface this to a human.
4. Document parameters in a `<noinclude>` section; categorise the template under
   one of the valid subcategories of `Category:Templates`.
5. **Every template must add at least one content category** in `<includeonly>` so
   pages that use it are automatically categorised. The tables above list the
   category each template adds. If creating a new template, pick or create the
   matching content category and add `[[Category:<name>]]` inside `<includeonly>`.
6. **Every template must categorise itself** in `<noinclude>` under exactly **one**
   subcategory of `Category:Templates`. This is how templates are discoverable.
   Choose the matching subcategory:
   - Infobox/data templates → `[[Category:Infobox templates]]`
   - Maintenance/status templates → `[[Category:Maintenance templates]]`
   - Layout/navigation templates → `[[Category:Main Page templates]]` or `[[Category:Navigation templates]]`
   - Preload templates → `[[Category:Preload templates]]`
   - Formatting helpers → `[[Category:Formatting templates]]`
   - Hatnotes → `[[Category:Hatnote templates]]`
   - Utility templates → `[[Category:Utility templates]]`
   - Card display templates → `[[Category:Card display templates]]`
   - Citation templates → `[[Category:Citation templates]]`
   - Club-specific templates → `[[Category:Club templates]]`
   All valid subcategories are listed at `Category:Templates`. If no existing
   subcategory fits, you may create a new one — but it must be a direct child of
   `Category:Templates`.
   Do **not** categorise templates under project-management categories like
   `Category:Wiki Maintenance` unless they also carry a `Category:Templates`
   subcategory. A template without a `Category:Templates` subcategory will not
   appear in the template category tree and is considered uncategorised.
7. Use `<includeonly>` / `<noinclude>` correctly so docs don't leak into pages.
   Preload templates must wrap form content in `<includeonly>` and put the
   self-category in `<noinclude>`, never leave preload wikitext bare.
8. **Avoid duplicate category links.** Some templates list `[[Category:Infobox
   templates]]` twice consecutively in `<noinclude>`. This is harmless (MediaWiki
   deduplicates) but unnecessary — keep exactly one.

## Never touch without written approval

- Core layout/navigation: `Main Page` and its sub-templates, navbox/tab templates,
  anything in `Category:Main Page templates` or `Category:Navigation templates`.
- Any `Template:` that declares or stores a Cargo table.
- `MediaWiki:` system messages, `Widget:` and `Module:` code.
