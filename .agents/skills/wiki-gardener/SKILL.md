---
name: wiki-gardener
description: Sweep the NITC Wiki for uncategorized and orphan pages and mass-categorize them against the real category taxonomy. Use when asked to categorize pages, clean up the uncategorized backlog, connect orphan pages, or run a content-hygiene sweep.
---

# Wiki Gardener

Use this skill to drain the wiki's **uncategorized and orphan page backlog**
(hundreds of pages at last count). Uncategorized pages never surface in
navigation; orphan pages are unreachable except by search.

This is a **multi-session job**: work in approved batches, keep progress
notes, never rush the whole backlog in one pass.

---

## Finding work

MediaWiki's maintenance reports are includable special pages, and rendering
them through `parse-wikitext` is explicitly permitted (`AGENTS.md` §3):

```
parse-wikitext(wikitext="{{Special:UncategorizedPages/100}}")
parse-wikitext(wikitext="{{Special:LonelyPages/100}}")
parse-wikitext(wikitext="{{Special:UncategorizedCategories}}")
```

Parse the page links out of the rendered HTML. If a report renders empty
(some are cached or disabled), fall back to sampling: prefix-list a
namespace (`search-page-by-prefix`) and check each page's categories via
`get-page`.

---

## Categorizing a page

Per page, in order:

1. **Read the page** (`get-page`, `metadata=true` — keep the revision ID).
2. **Infer the page type** — event, club/organisation, person, course,
   building, hostel, etc. (`rules/page-types.md` is the type catalogue).
3. **Prefer the structural fix**: if the type has an infobox that
   auto-categorizes (see `rules/templates.md`), a page missing categories is
   usually missing its infobox — adding `{{Infobox Organization}}` (etc.)
   fixes categories AND Cargo in one move. Fill it from the template's
   documented fields; don't guess.
4. Otherwise **pick categories from `rules/categories.md` only** — the most
   specific real category plus its umbrella(s). Verify each with
   `search-page-by-prefix(prefix="<name>", namespace=14)` before use.
   Never invent category names; if no real category fits, flag the page in
   the report instead of creating one (new categories follow the procedure
   in `rules/categories.md`, with human approval).
5. Place category links at the bottom of the page
   (`rules/categories.md` § How to categorise).

## Connecting an orphan

For each orphan (no incoming links):

- Add a link from its natural hub — the club list for a club, the parent
  event page for an edition, the department page for a course.
- Or add a `== See also ==` entry on 1–2 sibling pages.
- If a page looks like abandoned test content rather than real content,
  don't link it — flag it for a human decision (never delete).

---

## Batching workflow

1. Gather candidates from the reports above.
2. **Cluster by proposed category/type** (all uncategorized hostels
   together, etc.).
3. Present each cluster to the human: page list + proposed fix per page.
   Get approval **per cluster**.
4. Apply fixes: one revision per page, `latestId` passed, preview any
   non-trivial wikitext with `parse-wikitext` first
   (`rules/agent-conventions.md` §2).
   Edit summary: `Bot: Categorize page - <agent>` or
   `Bot: Add infobox and categories - <agent>`.
5. **Pause every ~20 pages** and confirm with the human that the results
   look right before continuing.
6. Keep a progress note on the relevant task-board task (if one tracks this
   backlog) so the next session knows where to resume.

## Guardrails

- Never create new categories without the `rules/categories.md` procedure
  and human approval.
- Never touch `Template:` or other users' `User:` pages during sweeps
  unless explicitly asked.
- Report-first: no edit before the cluster is approved.
- On write errors, follow `rules/agent-conventions.md` §3.
- Categorizing is judgment work — when the right category is genuinely
  unclear, flag the page for a human instead of guessing.

## Authoritative references

- `rules/categories.md` — the single authority for category names.
- `rules/page-types.md` — page-type recipes and their infoboxes.
- `rules/templates.md` — which infoboxes auto-categorize.
- `.agents/skills/wiki-diagnostics` — the structural-problems counterpart.
