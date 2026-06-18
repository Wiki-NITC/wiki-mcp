---
name: magazine-submission
description: Submit entries to the NITC Wiki Magazine (2026:Magazine). Covers single submissions and bulk/batch uploads, Template:Magazine Submission usage, disclaimer patterns for archived works, and fixing common pitfalls that cause entries to not appear.
---

# Magazine Submission

A skill for publishing content to the
[NITC Wiki Magazine](https://wiki.fosscell.org/2026:Magazine) — a
Cargo‑backed aggregator at `2026:Magazine` that auto‑lists pages tagged
with the `Template:Magazine Submission` template.

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

1. **Find the magazine page:** `get-page` on `2026:Magazine` to confirm
   the Cargo query for your type. Currently the queries use:
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
   `Bot: Creating magazine entry "Title" — <agent-name>`

7. **Verify** on `2026:Magazine` — the entry card appears under the
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

### Per‑entry creation steps

1. Read the source file.
2. Construct the full wikitext:
   - `{{Magazine Submission}}` template block
   - Optional: disclaimer box (see below)
   - Source content
   - `[[Category:Magazine]]`
3. Call `create-page` with title
   `User:YourName/Magazine/<Slugified-Title>`.
4. Edit summary: `Bot: Creating magazine entry "Title" — <agent-name>`

### Disclaimer patterns

When the entry is **not your own work** (archived collection, submitted
by someone else), add a visible box after the template.

#### English disclaimer

```html
<div style="padding: 0.8em 1em; border-radius: 8px; background: #fff3cd; border: 1px solid #ffc107; font-size: 0.9em; margin-bottom: 1.5em;">
<strong>📦 Collected submission</strong> — This submission is from the
Magazine Committee's (MagCom) collection of past unpublished works. It is
<strong>not my own creation</strong>. All rights belong to the original
author. Collected and submitted by: Vysakh Premkumar.
</div>
```

#### Malayalam disclaimer (വൈശാഖ് — note the spelling)

```html
<div style="padding: 0.8em 1em; border-radius: 8px; background: #fff3cd; border: 1px solid #ffc107; font-size: 0.9em; margin-bottom: 1.5em;">
<strong>📦 ശേഖരിച്ച സമർപ്പണം</strong> — ഈ രചന മാഗസിൻ കമ്മിറ്റിയുടെ (MagCom)
മുൻവർഷങ്ങളിലെ പ്രസിദ്ധീകരിക്കപ്പെടാത്ത രചനകളുടെ ശേഖരത്തിൽ നിന്നുള്ളതാണ്.
ഇത് <strong>എന്റെ സ്വന്തം സൃഷ്ടിയല്ല</strong>. എല്ലാ അവകാശങ്ങളും
യഥാർത്ഥ രചയിതാവിന് നിക്ഷിപ്തമാണ്. ശേഖരിച്ച് സമർപ്പിച്ചത്:
വൈശാഖ് പ്രേംകുമാർ.
</div>
```

> **കുറിപ്പ്:** "വൈശാഖ്" ആണ് ശരിയായ പേര് — "വിശാഖ്" അല്ല.
> Double‑check this spelling; it is the #1 copy‑paste error.

#### Anonymous submitter

If the submitter's identity cannot be disclosed, adjust the English
disclaimer:

```html
<div style="padding: 0.8em 1em; border-radius: 8px; background: #fff3cd; border: 1px solid #ffc107; font-size: 0.9em; margin-bottom: 1.5em;">
<strong>📦 Collected submission</strong> — This submission is from the
Magazine Committee's (MagCom) collection of past unpublished works. It is
<strong>not my own creation</strong>. Submitted to me by an anonymous member
whose identity cannot be disclosed. All rights belong to the original author.
Collected and submitted by: Vysakh Premkumar.
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

**Fix:** Always check `2026:Magazine` source to see the exact
`WHERE type="X"` for each section. Current types: `Poetry`,
`Fiction`, `Essay`, `Photography`, `Art`, **`Comics`** (plural),
`Interview`, `Memoir`.

### 2. Slug collision (underscore = space)

MediaWiki treats `_` (underscore) and ` ` (space) identically in
page titles. If two source files produce slugs that differ only in
spaces vs underscores, they resolve to the same wiki page.

**Fix:** When one slug is a substring of another (e.g. `theerasure`
vs `theerasure-suzanne`), suffix the conflicting one distinctly.

### 3. Malayalam name spelling

The most common copy‑paste error in the Malayalam disclaimer is
writing **വിശാഖ്** instead of **വൈശാഖ്**.

**Diff:**
- ❌ `വിശാഖ്` (vi-śākh)
- ✅ `വൈശാഖ്` (vai-śākh)

The first character is different: `വി` vs `വൈ`. Always verify before
saving.

### 4. Entries not showing after creation

Troubleshoot in this order:
1. Is the template at the very **top** of the page? (Before any content
   or HTML divs.)
2. Does `|type=` exactly match the Cargo query on `2026:Magazine`?
3. Is `[[Category:Magazine]]` present?
4. Does the page exist at the expected title? (Run `get-page`.)
5. Check the `MagazineSubmissions` Cargo table directly via
   `cargo-query` to see if the row was stored.

If the Cargo table has the row but the magazine page doesn't show it,
the issue is the type → query mismatch (pitfall #1).

---

## Verification

After creating or bulk‑submitting entries, verify on
`2026:Magazine` that:

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
  human review (see `Agents.md` §4).
- **Non‑magazine page types** — for events, clubs, people, etc., load
  the `nitc-wiki-editing` skill instead.
