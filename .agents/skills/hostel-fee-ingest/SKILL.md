---
name: hostel-fee-ingest
description: Parse hostel fee structure PDFs from the NITC Hostel Office using markitdown and add structured fee data to the wiki.
---

# Hostel Fee Structure Ingest

Use this skill when asked to **parse a PDF containing hostel fee notifications** from the NITC Hostel Office and add structured data to the wiki.

## Prerequisites

- `pipx install markitdown` (already available in this environment)
- On the wiki: `Template:Hostel Fee Structure` must exist (created via the [template setup](#wiki-templates) below)

---

## Typical PDF format

Hostel fee notification PDFs from the Hostel Office contain two sections:

| Section | Description | Student categories |
|---|---|---|
| A. One-time fees | Admission processing fee, amenities fund, caution deposit | UG, PG & PhD |
| B. Mess & Hostel charges | Establishment charges, seat rent, mess advance per semester | Two columns: SC/ST vs General |

The template `{{Hostel Fee Structure}}` stores one complete fee notification (one student category per call).

---

## Workflow

### 1. Convert PDF to markdown

```bash
markitdown /path/to/hostel-fee-2026-27.pdf -o /tmp/hostel-fee.md
```

Read the output. Tables will be rendered as markdown tables. Note that multi-column tables (SC/ST vs General) appear as merged columns.

### 2. Extract the values

Identify the following from the markdown:

```
Section A (one-time):
  A1. Hostel Admission Processing Fee
  A2. Hostel Amenities Fund
  A3. Caution and Furniture Deposit
  A4. Total (A1 + A2 + A3)

Section B (per semester):
  B1. Hostel establishment charges
  B2. Hostel seat rent
  B3. Mess advance (1st semester shown separately)
  B4. Total semester charges
  B5. Grand Total (A4 + B4)
```

Each student category (UG, PG, PhD) has its own set of values.

### 3. Create the wiki page

Create a page at:

```
Hostel Fee Structure <Academic Year>
```

e.g. `Hostel Fee Structure 2026-27`

### 4. Page structure

```wikitext
= Hostel Fee Structure 2026-27 =

Hostel fee notification for the academic year 2026-27 issued by the NITC Hostel Office.

Source: Hostel Office Notification No. ..., dated DD-MM-YYYY.

== UG (B.Tech) Students ==

{{Hostel Fee Structure
|academic_year=2026-27
|student_category=UG
|admission_fee=500
|amenities_fund=10000
|caution_deposit=15000
|total_one_time=25500
|establishment_charges=13000
|seat_rent=12000
|semester_total_scst=25000
|semester_total_general=50000
|grand_total_scst=50500
|grand_total_general=75500
|notification_date=2026-06-01
|notes=Mess charge waived for SC/ST students availing E-Grantz Scholarship (max ₹3,500/month). Mess advance of ₹20,000 must be in credit each semester.
}}

== PG & PhD Students ==

{{Hostel Fee Structure
|academic_year=2026-27
|student_category=PG
|admission_fee=500
|amenities_fund=6500
|caution_deposit=15000
|total_one_time=22000
|establishment_charges=13000
|seat_rent=12000
|semester_total_scst=50000
|semester_total_general=50000
|grand_total_scst=72000
|grand_total_general=72000
|notification_date=2026-06-01
|notes=Mess advance of ₹20,000 must be in credit each semester.
}}
```

### 5. Handle common PDF patterns

**Single amount across columns** — When SC/ST and General amounts are the same (e.g. establishment charges), use the same value in both fields.

**Mess advance omitted** — For PG/PhD where advance isn't listed, leave `mess_advance` empty.

**Notes** — Always include the note about E-Grantz scholarship from the original notification.

### 6. Categories

Always add:
- `[[Category:Fee Structures]]`
- `[[Category:Hostels]]`

---

## Wiki templates

### Template:Hostel Fee Structure

Verify it exists and check its current field list with:

```
get-page("Template:Hostel Fee Structure")
```

If it is ever missing, do not create it — it declares a Cargo table, which
agents never create (`rules/agent-conventions.md` §8). Hand the request to a
wiki admin.

Parameters:

| Field | Description |
|---|---|
| `academic_year` | e.g. 2026-27 |
| `student_category` | UG, PG, or PhD |
| `admission_fee` | A1: Admission processing fee (₹) |
| `amenities_fund` | A2: Hostel amenities fund (₹) |
| `caution_deposit` | A3: Caution & furniture deposit (₹) |
| `total_one_time` | A4: Sum of one-time fees (₹) |
| `establishment_charges` | B1: Establishment charges per semester (₹) |
| `seat_rent` | B2: Hostel seat rent per semester (₹) |
| `mess_advance` | B3: Mess advance (₹) |
| `semester_total_scst` | B4 total for SC/ST (₹) |
| `semester_total_general` | B4 total for General (₹) |
| `grand_total_scst` | Grand total for SC/ST (₹) |
| `grand_total_general` | Grand total for General (₹) |
| `notification_date` | Date of notification (YYYY-MM-DD) |
| `notes` | Additional notes |

---

## Quality checklist

- [ ] Values match the PDF exactly (verify each line item)
- [ ] SC/ST and General totals are in the correct fields
- [ ] Notes from the original notification preserved
- [ ] Target page checked for existence first (`get-page`) — use
      `update-page` with `latestId` if it already exists
- [ ] Rendered once through `parse-wikitext` before saving
- [ ] Page is in main namespace, not Project namespace
- [ ] Two categories: `Fee Structures` and `Hostels`
- [ ] Human confirms before saving

**On write errors**: follow `rules/agent-conventions.md` §3.
