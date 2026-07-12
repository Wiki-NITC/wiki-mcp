---
name: magazine-submission
description: Submit or archive entries to the NITC Wiki Magazine (the current year's Magazine page). Covers single submissions, bulk/batch archiving of MagCom collections, Template:Magazine Submission usage, slug rules, disclaimer patterns for archived works, and fixing common pitfalls that cause entries to not appear.
---

# Magazine Submission

A skill for publishing content to the NITC Wiki Magazine — a Cargo‑backed
aggregator at `<YYYY>:Magazine` (e.g. `2026:Magazine`; use the current
year's page) that auto‑lists pages tagged with the
`Template:Magazine Submission` template.

This skill also covers **bulk archiving** of MagCom collections (it replaced
the old magazine-archiver skill, whose plain-prose format never reached the
Cargo table and used invalid type values).

---

## How it works

1. Any page created under `User:YourName/Magazine/` transcluding
   `{{Magazine Submission}}` is automatically listed on the magazine page.
2. The template stores structured fields into a Cargo table
   (`MagazineSubmissions`) which the magazine page queries by type.
3. No manual curation, no gatekeeping — if the template is there and
   the type matches the query, the entry appears.

---

## Template reference

`Template:Magazine Submission` — transclude at the **top** of the page.

### All parameters

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `title` | String | `{{SUBPAGENAME}}` | Display title for the entry |
| `author` | String | `{{ROOTPAGENAME}}` | Author display name |
| `author_page` | String | `User:<author>` | Wiki user page link |
| `type` | String | *(required)* | One of: `Poetry`, `Fiction`, `Essay`, `Photography`, `Art`, `Comics`, `Interview`, `Memoir` |
| `language` | String | `English` | Any language name (`Malayalam`, `Hindi`, etc.) |
| `year` | Integer | *(required)* | Publication year (e.g. `2026`) |
| `academic_year` | String | — | e.g. `2025-26` |
| `excerpt` | Text | — | 1–2‑sentence teaser shown on the magazine page |
| `image` | String | — | Uploaded filename (no `File:` prefix) |
| `medium` | String | — | For visual art: `Digital`, `Watercolour`, etc. |
| `word_count` | Integer | — | Approximate word count |
| `date` | Date | `{{#time:Y-m-d}}` | Submission date (ISO 8601) |

### `original_work` — hardcoded

The template stores `|original_work=Yes` unconditionally in
`{{#cargo_store}}`. It cannot be overridden. If you are submitting
someone else's work (archived MagCom collection, etc.), add a visible
**disclaimer box** on the page (see [Disclaimer patterns](#disclaimer-patterns)).

### Cargo table: `MagazineSubmissions`

All stored fields from `{{#cargo_store}}`. The magazine page queries this
table per type. A mismatch between `|type=` and the Cargo query's `WHERE`
clause is the #1 reason an entry silently doesn't appear.

---

## Single‑entry (non‑bulk) workflow

Use when submitting one piece of your own work.

1. **Find the magazine page:** `get-page` on the current year's
   `<YYYY>:Magazine` to confirm the Cargo query for your type. Currently
   the queries use:
   - `Poetry`, `Fiction`, `Essay` — with `type="Poetry"` etc.
   - **`Comics`** — **not** `Comic`
   - `Art`, `Photography`, `Interview`, `Memoir`

2. **Create the page:** `create-page` with title
   `User:YourName/Magazine/Your-Title`.

3. **Add the template at top:**
   ```wikitext
   {{Magazine Submission
   |title=Your Title
   |type=Poetry
   |language=English
   |year=2026
   |academic_year=2025-26
   |excerpt=A brief teaser...
   }}
   ```

4. **Write your piece** below the template (prose, poetry, or image
   embed).

5. **Add categories** at the bottom:
   ```wikitext
   [[Category:Magazine]]
   ```

6. **Save** with edit summary:
   `Bot: Create magazine entry "Title" - <agent-name>`

7. **Verify** on the magazine page — the entry card appears under the
   matching type section.

---

## Bulk workflow (multiple entries from source files)

Use when submitting an archive of works (e.g. MagCom unpublished
collection) where each entry has its own source file.

### Source file layout convention

```
wiki-magazine/
  <slug1>             # English entry 1
  <slug2>             # English entry 2
  malayalam/
    <ml-slug1>        # Malayalam entry 1
    <ml-slug2>        # Malayalam entry 2
```

Each source file contains the raw creative content only (no template).
The agent constructs the full wikitext programmatically.

### Slug rules

Page titles use a title-cased hyphenated slug derived from the entry title:

1. Title-case each word (capitalise the first letter of every word).
2. Replace spaces with hyphens.
3. Remove or replace special characters: `'` → omit, `&` → `and`, `,` → omit.
4. Keep it under ~50 characters; truncate at a word boundary if needed.

Examples:
- "Crap, I like the Girl Now" → `Crap-I-Like-The-Girl-Now`
- "Marichittum Mazhayathu Nilkunnavar" → `Marichittum-Mazhayathu-Nilkunnavar`
- "Who Does Art Belong To?" → `Who-Does-Art-Belong-To`

### Per‑entry creation steps

1. `whoami` — confirm the editor username the pages will live under.
2. Read the source file.
3. Construct the full wikitext. **Every archived entry MUST start with
   `{{Magazine Submission}}`** — a plain-prose page never reaches the
   `MagazineSubmissions` Cargo table and will not appear on the magazine
   page. The `type` must be one of the accepted values (note `Comics` not
   `Comic`, `Art` not `Artwork`):
   - `{{Magazine Submission}}` template block
   - Optional: disclaimer box (see below)
   - Source content
   - `[[Category:Magazine]]`
4. `get-page` the target title first — if it exists, resolve the slug
   collision (see pitfalls) instead of overwriting.
5. Call `create-page` with title
   `User:YourName/Magazine/<Slugified-Title>`.
6. Edit summary: `Bot: Create magazine entry "Title" - <agent-name>`

Never batch more than ~20 pages without pausing to confirm with the human
that the format looks correct.

### Formatting notes for archived content

- **Poetry**: preserve line breaks with blank lines between stanzas (no `<br>`).
- **Fiction / Essay / Memoir**: paragraph breaks as blank lines.
- **Comics / Art**: describe the work in prose if the image can't be uploaded
  (uploads are disabled — see `rules/uploads.md`); note `<!-- image pending upload -->`.
- **Malayalam / non-Latin text**: paste UTF-8 directly; do not transliterate.

### Index page (optional, after a bulk run)

Create or update `User:<editor>/Magazine` listing all entries:

```wikitext
== Magazine Archive ==
Submissions archived from MagCom.

{| class="wikitable sortable"
! Title !! Author !! Type !! Issue
|-
| [[User:<editor>/Magazine/<Slug>|<Title>]] || <Author> || <Type> || <Year>
|}

[[Category:Magazine]]
```

### Disclaimer patterns

When the entry is **not your own work** (archived collection, submitted
by someone else), add a visible box after the template.

#### English disclaimer

```html
<div style="padding: 0.8em 1em; border-radius: 8px; background: #fff3cd; border: 1px solid #ffc107; font-size: 0.9em; margin-bottom: 1.5em;">
<strong>📦 Collected submission</strong> — This submission is from the
Magazine Committee's (MagCom) collection of past unpublished works. It is
<strong>not my own creation</strong>. All rights belong to the original
author. Collected and submitted by: <collector's full name>.
</div>
```

Replace `<collector's full name>` with the actual collector (the person
running the archive), confirmed with them — do not guess.

#### Malayalam disclaimer (verify name spelling with the collector)

```html
<div style="padding: 0.8em 1em; border-radius: 8px; background: #fff3cd; border: 1px solid #ffc107; font-size: 0.9em; margin-bottom: 1.5em;">
<strong>📦 ശേഖരിച്ച സമർപ്പണം</strong> — ഈ രചന മാഗസിൻ കമ്മിറ്റിയുടെ (MagCom)
മുൻവർഷങ്ങളിലെ പ്രസിദ്ധീകരിക്കപ്പെടാത്ത രചനകളുടെ ശേഖരത്തിൽ നിന്നുള്ളതാണ്.
ഇത് <strong>എന്റെ സ്വന്തം സൃഷ്ടിയല്ല</strong>. എല്ലാ അവകാശങ്ങളും
യഥാർത്ഥ രചയിതാവിന് നിക്ഷിപ്തമാണ്. ശേഖരിച്ച് സമർപ്പിച്ചത്:
<collector's name in Malayalam>.
</div>
```

> **Note:** Malayalam name spellings are the #1 copy‑paste error (a real
> past case: വിശാഖ് written instead of the correct വൈശാഖ് — one character
> different). Confirm the collector's Malayalam spelling with them and
> double-check character by character before saving.

#### Anonymous submitter

If the submitter's identity cannot be disclosed, adjust the English
disclaimer:

```html
<div style="padding: 0.8em 1em; border-radius: 8px; background: #fff3cd; border: 1px solid #ffc107; font-size: 0.9em; margin-bottom: 1.5em;">
<strong>📦 Collected submission</strong> — This submission is from the
Magazine Committee's (MagCom) collection of past unpublished works. It is
<strong>not my own creation</strong>. Submitted to me by an anonymous member
whose identity cannot be disclosed. All rights belong to the original author.
Collected and submitted by: <collector's full name>.
</div>
```

### Handling anonymous original authors

Set `|author=Anonymous` in the template. The contributor note goes in
the disclaimer box instead.

---

## Common pitfalls

### 1. Type mismatch → entry doesn't appear

The magazine page queries by exact type string. If you set
`|type=Comic` but the Cargo query says `type="Comics"`, the entry
is stored with `Comic` and never matched.

**Fix:** Always check the current magazine page's source to see the exact
`WHERE type="X"` for each section. Current types: `Poetry`,
`Fiction`, `Essay`, `Photography`, **`Art`** (not `Artwork`),
**`Comics`** (plural, not `Comic`), `Interview`, `Memoir`.

### 2. Slug collision (underscore = space)

MediaWiki treats `_` (underscore) and ` ` (space) identically in
page titles. If two source files produce slugs that differ only in
spaces vs underscores, they resolve to the same wiki page.

**Fix:** When one slug is a substring of another (e.g. `theerasure`
vs `theerasure-suzanne`), suffix the conflicting one distinctly.

### 3. Malayalam name spelling

Malayalam names in disclaimers are easy to mis-spell by one character
(e.g. `വി` vs `വൈ` as the first glyph). Confirm the spelling with the
person named and verify character by character before saving.

### 4. Entries not showing after creation

Troubleshoot in this order:
1. Is the template at the very **top** of the page? (Before any content
   or HTML divs.)
2. Does `|type=` exactly match the Cargo query on the magazine page?
3. Is `[[Category:Magazine]]` present?
4. Does the page exist at the expected title? (Run `get-page`.)
5. Check the `MagazineSubmissions` Cargo table directly via
   `cargo-query` to see if the row was stored.

If the Cargo table has the row but the magazine page doesn't show it,
the issue is the type → query mismatch (pitfall #1).

---

## Verification

After creating or bulk‑submitting entries, verify on the current year's
magazine page that:

- Each entry card appears under the correct type section heading.
- The title, author, and language display correctly.
- No duplicate or missing entries.

For a bulk run of N entries, spot‑check at least 3 across different
types (including one Malayalam entry for disclaimer spelling).

---

## What this skill does NOT cover

- **File uploads** — disabled in the current beta; use the wiki's
  manual upload interface.
- **Editing `Template:Magazine Submission`** — the template declares
  and stores Cargo data. Changing it requires a table rebuild and
  human review (see `AGENTS.md` §4).
- **Non‑magazine page types** — for events, clubs, people, etc., load
  the `nitc-wiki-editing` skill instead.
