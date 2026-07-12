---
name: nitc-wiki-editing
description: Read, create, or edit pages on the NITC Wiki (wiki.fosscell.org) correctly. Use when working with FOSSCell/NIT Calicut wiki content — events (FOSSMeet, Ragam, Tathva), clubs, people, faculty, courses, campus places, hostels — or any MediaWiki page on this wiki. Covers its namespaces, real categories, infobox/Cargo templates, Page Forms, and naming conventions so structured data and queries don't break.
---

# Editing the NITC Wiki

Use this skill whenever you act on **wiki.fosscell.org** (the NIT Calicut /
FOSSCell wiki) through the MediaWiki MCP server or its API. It exists because this
wiki is a **structured-data wiki** (MediaWiki + Cargo + Semantic MediaWiki +
Page Forms) — naive edits silently break queries, dashboards, and the Main Page.

## Golden rules

1. **Match existing pages.** Before creating anything, fetch a sibling page of the
   same type (`get-page` / `search-page`) and copy its structure, templates, and
   categories. Don't invent patterns.
2. **Use the structured template** for the page type — never hand-format an event,
   club, person, or course as free prose. The matching `Form:X` / `Template:X` is
   the source of truth for field names; read it, don't guess parameters.
3. **Real names only.** Use category and template names that actually exist —
   verify with a prefix search rather than guessing.
4. **Never break structured data.** Don't edit a Cargo-declaring template
   (`{{#cargo_declare}}` / `{{#cargo_store}}`), or `Module:` / `Widget:` /
   `GeoJson:` / `smw/schema:` / `MediaWiki:` pages, without human review.
5. **Uploads are off** — don't attempt file uploads (see `rules/uploads.md`).
6. **Preview before saving.** Render risky wikitext with `parse-wikitext` and
   iterate there — one saved revision per logical change, never a string of
   styling experiments (`rules/agent-conventions.md` §2).
7. **Identify edits** with a clear, non-empty summary, e.g.
   `Bot: Create 2026:Tathva - <agent>`. The edit tools expose a `bot` flag and
   `latestId` conflict detection; pass `latestId` on every `update-page`. They
   don't expose `minor`/`maxlag`.
8. **On write errors**, follow the required responses in
   `rules/agent-conventions.md` §3 — never silently retry or swallow them.

## Naming conventions (memorize)

- **Events/editions:** `YYYY:EventName` (year namespace) — `2026:FOSSMeet`,
  `2025:Ragam`. Add a main-namespace **redirect** from the common name.
- **Event subpages:** `/Schedule`, `/Speakers`, `/Team`, `/Gallery`, `/Coverage`.
- **People:** `Firstname Lastname`. **Clubs:** the common name (`FOSSCell`).
- Stylised titles use `{{DISPLAYTITLE:...}}`; the real title still follows the rule.

## Page-type cheat sheet

| Type | Namespace | Form → Template | Key categories |
|---|---|---|---|---|
| Event | `YYYY:` | `Form:Event` → `{{Event}}` + `{{Infobox Event}}`/`{{Infobox FOSSMeet}}` | `Events`, `FOSSMeet`, `FOSSMeet 2026` |
| Organisation (club) | Main | `Form:Organization` → `{{Infobox Organization}}` (type=Professional/Non-Technical/Technical) | Auto: `Clubs` + type-specific |
| Organisation (home team) | Main | `Form:Organization` → `{{Infobox Organization}}` (type=Cultural/Sports) | Auto: `Home Teams` / `Sports` |
| Organisation (legacy) | Main | `Form:Club` → `{{Infobox Club}}` (no Cargo) | `Clubs and Organizations` (deprecated) |
| Person | Main | `Form:Person` → `{{Infobox Person}}` | `People` |
| Faculty | Main | `Form:Faculty` → `{{Infobox Faculty}}` | `Faculty` |
| Course | Main | `Form:Course` → `{{Infobox Course}}` | `Courses`, `Theory Courses`/`Lab Courses` |
| Building | Main | `Form:Campus Location` → `{{Infobox Building}}` | `Campus`, `Academic Buildings` |
| Hostel | Main | `Form:Hostel` → `{{Infobox Hostel}}` | `Hostels` |
| HowTo | `HowTo:` | — | `HowTo` |

Events **must** include `{{Event|year=|month=|day=|description=|type=|organizer=}}`
or they won't appear in date-based Cargo queries / "This day in history."

## Categories

Title Case, plural, spelled-out "and": `Clubs and Organizations`,
`Food and Eateries`, `Home Teams`. Add the **specific** category plus its
umbrella(s); every page needs at least one. Verify a category exists before using
it. Mark thin pages with `{{Stub}}` (adds `Category:Stubs`).

## Authoritative references (read these in the repo)

This skill is a summary. The full, verified rules live in the `wiki-mcp` repo —
read them when you need detail:

- `AGENTS.md` — master rulebook (identity, read/write rules, what's enforced).
- `rules/agent-conventions.md` — edit summaries, error handling, preview
  discipline, known server failure modes.
- `rules/namespaces.md` — full namespace map + naming conventions.
- `rules/categories.md` — real category names and the Title-Case-plural convention.
- `rules/templates.md` — the templates that actually exist (and which don't, e.g.
  citation templates aren't imported yet).
- `rules/structured-data.md` — Cargo / SMW / Page Forms; how not to break data.
- `rules/page-types.md` — step-by-step recipe per page type.
- `rules/editing.md` — wikitext style (prose stays plain; styling lives in
  templates using theme CSS variables; `{{#mermaid:}}`, `{{DISPLAYTITLE}}`).
## Workflow for a new page

1. Identify the page type and read its `Form:` / `Template:` for exact fields.
2. Fetch a similar existing page; copy its skeleton.
3. Put it in the right namespace with a conventional title (+ redirect for events).
4. Fill the infobox/Cargo template, write a bold lead sentence, add sections.
5. Add real categories (specific + umbrella).
6. Save with a clear edit summary. For new pages or anything risky, show the
   proposed wikitext to the human first.
