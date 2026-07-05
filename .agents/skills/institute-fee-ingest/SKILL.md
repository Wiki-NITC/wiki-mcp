---
name: institute-fee-ingest
description: Parse institute fee structure PDFs from NITC (Senate/GCR fee notifications, tuition fees, special fees, lab fees) using markitdown and add structured data to the wiki.
---

# Institute Fee Structure Ingest

Use this skill when asked to **parse a PDF containing institute-wide fee notifications** (tuition fees, special fees, lab fees, gym fees, etc.) from NITC and add structured data to the wiki.

## Prerequisites

- `pipx install markitdown` (already available in this environment)
- On the wiki: `Template:Institute Fee Structure` must exist (see [template setup](#wiki-template-setup) below)

---

## Typical PDF format

Institute fee notification PDFs from the Senate/GCR typically contain:

| Category | Examples |
|---|---|
| Tuition | Tuition fee per semester, Tuition for repeaters |
| Special Fees | Registration, Sports, Library, Medical, ID card |
| Lab Fees | Department-specific lab fees per semester |
| Other | Gym fee, Swimming pool fee, Hostel (refer to hostel-fee-ingest) |
| One-time | Admission fee, Recognition fee, Equivalence fee |

---

## Workflow

### 1. Convert PDF to markdown

```bash
markitdown /path/to/institute-fee-2026-27.pdf -o /tmp/institute-fee.md
```

Read the output. Fee tables will be rendered as markdown tables; sections are typically organized by fee category.

### 2. Classify each line item

From the markdown, identify each fee item and classify it:

| Category | When to use |
|---|---|
| `Tuition` | Per-semester/year tuition charges |
| `Special Fee` | Library, sports, medical, registration, etc. |
| `Lab Fee` | Department-specific lab/drawing fees |
| `Admission` | One-time fees at the time of admission |
| `Hostel` | Hostel-related charges (use hostel-fee-ingest instead) |
| `Other` | Gym, swimming pool, fine, etc. |

### 3. Create the wiki page

Create a page at:

```
Institute Fee Structure <Academic Year>
```

e.g. `Institute Fee Structure 2026-27`

### 4. Page structure

```wikitext
= Institute Fee Structure 2026-27 =

Fee structure for UG and PG programmes as approved by the Senate.

Source: Senate Meeting No. ..., dated DD-MM-YYYY.

== B.Tech (General Category) ==

=== Tuition ===
{{Institute Fee Structure
|fee_name=Tuition Fee
|category=Tuition
|amount=40000
|period=Per Semester
|applicable_to=General Category B.Tech
|academic_year=2026-27
|source=Senate Resolution 2026/XX
|notes=
}}

=== Special Fees ===
{{Institute Fee Structure
|fee_name=Sports Fee
|category=Special Fee
|amount=500
|period=Per Semester
|applicable_to=All Students
|academic_year=2026-27
|notes=Non-refundable
}}

{{Institute Fee Structure
|fee_name=Library Fee
|category=Special Fee
|amount=1000
|period=Per Semester
|applicable_to=All Students
|academic_year=2026-27
|notes=
}}

=== One-time Fees ===
{{Institute Fee Structure
|fee_name=Admission Fee
|category=Admission
|amount=2500
|period=One-time
|applicable_to=New Students
|academic_year=2026-27
|notes=At time of admission
}}
```

### 5. Multiple categories per page

If the PDF covers multiple student categories (General, SC/ST, OBC, different programmes), create separate sections:

```wikitext
== B.Tech ==
=== General Category ===
...
=== SC/ST Category ===
...
== M.Tech ==
=== General Category ===
...
```

### 6. Categories

Always add:
- `[[Category:Fee Structures]]`
- `[[Category:Academic]]`

---

## Wiki template setup

If `Template:Institute Fee Structure` does not yet exist, create it on the wiki.

### 1. Recommended: Use the template-creator skill
Load the `template-creator` skill and ask it to create `Template:Institute Fee Structure` — it will generate the template, cargo table, form, preload, and helper page automatically.

### 2. Fallback: Manual creation
If template-creator is not available, paste the following at `https://wiki.fosscell.org/Template:Institute_Fee_Structure?action=edit`:

```wikitext
<noinclude>{{#cargo_declare:_table=InstituteFees
|fee_name=String
|category=String
|amount=Integer
|period=String
|applicable_to=String
|academic_year=String
|source=String
|notes=Text
}}</noinclude><includeonly>{{#cargo_store:_table=InstituteFees
|fee_name={{{fee_name|}}}
|category={{{category|}}}
|amount={{{amount|}}}
|period={{{period|}}}
|applicable_to={{{applicable_to|}}}
|academic_year={{{academic_year|}}}
|source={{{source|}}}
|notes={{{notes|}}}
}}</includeonly><noinclude>
== Institute Fee Structure Template ==
Stores institute fee items into the InstituteFees Cargo table.

=== Usage ===
<pre>
{{Institute Fee Structure
|fee_name=Tuition Fee
|category=Tuition
|amount=40000
|period=Per Semester
|applicable_to=General B.Tech
|academic_year=2026-27
|source=Senate Resolution 2026/XX
|notes=
}}
</pre>

=== Parameters ===
* fee_name — Name of the fee
* category — Tuition, Special Fee, Lab Fee, Admission, Other
* amount — Amount in ₹
* period — Per Semester, Per Year, One-time
* applicable_to — Who this applies to
* academic_year — e.g. 2026-27
* source — Issuing authority
* notes — Additional notes

=== Query example ===
<pre>
{{#cargo_query: tables=InstituteFees
|fields=fee_name, category, amount, period
|where=academic_year="2026-27" AND category="Tuition"
|order by=amount DESC
}}
</pre>

[[Category:Data templates]]
</noinclude>
```

Also create `Template:Institute Fee Structure/preload` with:

```wikitext
{{Institute Fee Structure
|fee_name = 
|category = 
|amount = 
|period = 
|applicable_to = 
|academic_year = 
|source = 
|notes = 
}}
```

And `Form:Institute Fee Structure` using the same pattern as `Form:Hostel Fee Structure`.

---

## Quality checklist

- [ ] Each fee line item is a separate `{{Institute Fee Structure}}` call
- [ ] Categories match the controlled list (Tuition / Special Fee / Lab Fee / Admission / Other)
- [ ] Amounts match the PDF exactly
- [ ] `applicable_to` clearly states who the fee applies to
- [ ] Page is in main namespace
- [ ] Categories: `Fee Structures` and `Academic`
- [ ] Human confirms before saving
