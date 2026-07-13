---
name: bus-timings-ingest
description: Parse bus/transport PDFs (NITC college bus routes, KSRTC schedules, shuttle timings) using markitdown and add structured route data to the wiki.
---

# Bus Timings Ingest

Use this skill when asked to **parse a PDF containing bus timings, transport schedules, or route information** related to NIT Calicut and add the data to the wiki.

## Prerequisites

- `pipx install markitdown` (already available in this environment)
- On the wiki: `Template:Bus Route` must exist (see [Template creation](#wiki-template-setup) below)

---

## Workflow

### 1. Classify the PDF

Determine what type of bus/transport data the PDF contains:

| Type | Example | Wiki target |
|---|---|---|
| College bus route schedule | "Medical College Route" with stops and timings | One `{{Bus Route}}` per route |
| KSRTC shuttle timetable | Multiple routes in one document | One page per PDF, multiple `{{Bus Route}}` invocations |
| Bus stop list with timings | Schedules organized by stop | One page per year/semester |

### 2. Convert PDF to markdown

```bash
markitdown /path/to/bus-schedule.pdf -o /tmp/bus-schedule.md
```

Read the output with a file reader. Tables will be rendered as markdown tables.

### 3. Parse the structured data

From the markdown output, identify:
- **Route name / number** — e.g. "Medical College Route", "Route 1A"
- **Stops** — sequence of stops along the route
- **Timings** — morning pickup times (→ campus), evening drop times (← campus)
- **Days of operation** — Mon–Sat, All days, etc.
- **Bus type** — Staff bus, Student bus, Ladies special, General
- **Validity period** — academic year, semester, or notification date

### 4. Create/update the wiki page

If the PDF is for a **single route**, create a page:

```
Bus Route <Route Name>
```

If the PDF covers **multiple routes** (e.g. the full NITC bus schedule), create one page per academic year:

```
Bus Schedule <Academic Year>
```

with each route as a section containing its `{{Bus Route}}` template call.

### 5. Page structure

```wikitext
= Bus Schedule 2026-27 =

Bus route and timing schedule for NIT Calicut.

Source: Transport Office Notification No. ..., dated DD-MM-YYYY.

== Medical College Route ==

{{Bus Route
|route_name=Medical College Route
|route_number=1
|stops=Medical College, Kunnamangalam, Diwan Road, NIT Campus
|campus_arrival=8:45 AM
|campus_departure=5:15 PM
|frequency=Daily
|days_operating=Mon–Sat
|bus_type=Student
|operator=College Bus
|status=Active
|notes=Morning pickup from Medical College at 7:30 AM
}}

== Kunnamangalam Route ==
...
```

### 6. Categories

Always add at least:
- `[[Category:Transport]]`
- `[[Category:Bus Schedules]]`

---

## Wiki template setup

Verify `Template:Bus Route` exists before writing any route data:
`get-page("Template:Bus Route")`.

If it does not exist: **do not create it yourself, and do not route it through
the template-creator skill** — it declares a Cargo table (`{{#cargo_declare}}`),
which agents never create (`rules/agent-conventions.md` §8; template-creator
refuses Cargo templates by design). Instead, hand the exact wikitext below to
a wiki admin and stop until it exists:

```wikitext
<noinclude>{{#cargo_declare:_table=BusRoutes
|route_name=String
|route_number=String
|stops=Text
|campus_arrival=String
|campus_departure=String
|frequency=String
|days_operating=String
|bus_type=String
|operator=String
|status=String
|notes=Text
}}</noinclude><includeonly>{{#cargo_store:_table=BusRoutes
|route_name={{{route_name|}}}
|route_number={{{route_number|}}}
|stops={{{stops|}}}
|campus_arrival={{{campus_arrival|}}}
|campus_departure={{{campus_departure|}}}
|frequency={{{frequency|}}}
|days_operating={{{days_operating|}}}
|bus_type={{{bus_type|}}}
|operator={{{operator|}}}
|status={{{status|Active}}}
|notes={{{notes|}}}
}}{| class="wikitable" style="float:right; margin-left:1em; width:320px;"
! colspan="2" style="background:#2C3E50; color:white; text-align:center;" | 🚌 {{{route_name}}}
{{#if:{{{route_number|}}}|
{{!}}-
! Route No.
{{!}} {{{route_number}}}
}}
|-
! Stops
| {{{stops}}}
{{#if:{{{campus_arrival|}}}|
{{!}}-
! → Campus arrival
{{!}} {{{campus_arrival}}}
}}
{{#if:{{{campus_departure|}}}|
{{!}}-
! ← Campus departure
{{!}} {{{campus_departure}}}
}}
{{#if:{{{frequency|}}}|
{{!}}-
! Frequency
{{!}} {{{frequency}}}
}}
{{#if:{{{days_operating|}}}|
{{!}}-
! Days
{{!}} {{{days_operating}}}
}}
{{#if:{{{bus_type|}}}|
{{!}}-
! Type
{{!}} {{{bus_type}}}
}}
{{#if:{{{operator|}}}|
{{!}}-
! Operator
{{!}} {{{operator}}}
}}
{{#if:{{{status|}}}|
{{!}}-
! Status
{{!}} {{{status}}}
}}
|}
{{#if:{{{notes|}}}|<div style="font-size:0.85em; color:#555; margin-top:0.5em;">'''Notes:''' {{{notes}}}</div>}}
</includeonly><noinclude>
== Bus Route Template ==
Stores bus route data into the BusRoutes Cargo table.

=== Usage ===
<pre>
{{Bus Route
|route_name=Medical College Route
|route_number=1
|stops=Medical College, Kunnamangalam, NIT Campus
|campus_arrival=8:45 AM
|campus_departure=5:15 PM
|frequency=Daily
|days_operating=Mon–Sat
|bus_type=Student
|operator=College Bus
|status=Active
|notes=
}}
</pre>

[[Category:Data templates]]
</noinclude>
```

The admin should also create `Template:Bus Route/preload` with a blank
template call prefilled (wrapped per `rules/templates.md` § Preload templates).

---

## Quality checklist

- [ ] PDF is from an official NITC source
- [ ] Target page checked for existence first (`get-page`) — use
      `update-page` with `latestId` if it already exists
- [ ] Stops are ordered correctly in the `stops` field
- [ ] Timings use a consistent format (e.g. `8:45 AM`)
- [ ] Days of operation are explicit
- [ ] Rendered once through `parse-wikitext` before saving
- [ ] Page has `[[Category:Transport]]` and `[[Category:Bus Schedules]]`
- [ ] Human operator confirms before saving

**On write errors**: follow `rules/agent-conventions.md` §3.
