---
name: first-contribution
description: Guide a new NITC Wiki user through their first contribution. Covers creating a user profile page with Template:User Profile, choosing a first post (magazine submission, blog post, or page edit), and picking a starter task from the task board. Use when a new user asks how to get started, set up their profile, or make their first post.
---

# First Contribution

Use this skill when helping a **new contributor** get started on
`wiki.fosscell.org`. The goal is to get them from zero to one saved edit,
correctly placed, in one sitting.

---

## Step 0: account and identity

- Accounts require an `@nitc.ac.in` email (stated on the Main Page; alumni
  should use the contact listed there).
- Run `whoami` to confirm which account the agent is acting as. Everything
  below that writes to a user namespace must use that username, not the
  human's display name.

---

## Step 1: the user profile page

The standard first edit. User pages use `{{User Profile}}`, which stores a
row in the `UserProfiles` Cargo table, so a filled profile shows up in
member listings.

Page title: `User:<username>` (exact username from `whoami`).

Template skeleton (mirrors `Template:User Profile/preload`; read
`Template:User Profile` for current fields before writing):

```wikitext
{{User Profile
|name=
|batch=
|passing_out=
|department=
|quote=
|about=
|interests=
|clubs=
|image=
|links=
|scrapbook=No
}}
```

Field notes:

- `name` - display name, defaults sensibly but fill it anyway.
- `batch` - cohort code such as `B23`.
- `passing_out` - graduation year, plain integer.
- `interests`, `clubs` - comma-separated.
- `image` - leave blank; uploads are disabled (see `rules/uploads.md`), do
  not attempt one.
- `scrapbook` - `Yes` or `No`.

Check whether `User:<username>` already exists with `get-page` first
(`metadata=true`). If it exists, update rather than overwrite, passing
`latestId`. On write errors (`permission_denied`, `authentication`, etc.),
follow `rules/agent-conventions.md` §3 — a brand-new account frequently hits
these, so report them clearly instead of retrying.

---

## Step 2: pick a first post

Offer the human three routes, in rough order of effort:

### a. Improve an existing page

Lowest friction. Good targets: their own hostel, department, club, or team
page. Fetch the page, propose a concrete addition (a missing section, a
fixed fact, an added category), show the diff, save with a clear edit
summary.

### b. Magazine submission

For creative writing (poetry, fiction, essays, art writeups). Use the
`magazine-submission` skill; submissions are tagged with
`Template:Magazine Submission` and surface automatically on the magazine
page. Malayalam and other non-Latin text is fine as-is.

### c. Blog post

The wiki runs the BlogPage extension with a `Blog:` namespace (ID 500).
Humans create posts through the form linked from the `Write Blogs Here`
page (`Special:CreateBlogPost`). Agents cannot drive Special pages: if
asked to post on someone's behalf, fetch an existing `Blog:` page first and
copy its exact structure, since BlogPage expects specific markup. If no
reference post exists yet, send the human to the form instead of guessing.

---

## Step 3: point at the task board

For contributors who want ongoing work, query the open, unassigned tasks
and present the low-effort ones (see the `wiki-task-board` skill). Content
tasks like categorizing pages are ideal first tasks; admin-flagged tasks
are not.

---

## Etiquette to teach along the way

- Always write an edit summary saying what changed and why.
- Preview risky wikitext with `parse-wikitext` before saving.
- Add at least one `[[Category:...]]` to any new page.
- New pages about people, clubs, or events have structured templates; check
  `rules/page-types.md` before hand-writing prose so the page lands in the
  right namespace with the right infobox.
- It is a wiki: imperfect-but-saved beats perfect-but-unwritten, and
  everything can be reverted.

## Authoritative references

- `Welcome` and `Main Page` on the live wiki - onboarding framing and
  account requirements.
- `Template:User Profile` and `Template:User Profile/preload` - profile
  fields.
- `rules/page-types.md`, `rules/editing.md`, `rules/categories.md` - where
  things go and how to format them.
- `.agents/skills/magazine-submission`, `.agents/skills/wiki-task-board` -
  the two deeper first-post routes.
