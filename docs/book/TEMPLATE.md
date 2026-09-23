# Chapter Template & Writing Style Guide

> **Phase 2 deliverable.** Every chapter in `chapters/` follows this template. The style rules below are binding for all prose.

---

##1. Chapter file naming

- Files: `chapters/chNN-<slug>.md` — zero-padded number matching the TOC (`ch07-my-enrollments.md`).
- Appendices: `chapters/appA-forms-dictionary.md` … `appG-security-model.md`.
- One chapter per file; never combine chapters.

##2. Chapter template (copy this skeleton)

```markdown
# Chapter NN — <Title as in TOC>

> **Part:** <Roman numeral — Part name> · **Phase:** <N>
> **Covers:** P04, D07 *(entity IDs from00-INVENTORY.md)*
> **Roles:** student

## In this chapter
- <bullet outcomes,3–6 max>

## Getting here
- **Menu path:** Dashboard ▸ My Enrollments
- **URL:** `/dashboard/enrollments`
- **Requires:** student role; signed-in session

<!-- img: chNN-slug-primary -->
<!-- img: chNN-slug-secondary -->

## <Walkthrough section(s)>
<numbered steps; one action per step>

## <Forms and fields>            ← only if this chapter OWNS a form (see README owner table)
| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
|1| courseId | Course * | Select | ✓ | all courses; changing resets subject+topic |

## <Data on this screen>         ← every table/card gets one
### <Table/card name>
| Column | Meaning | Source |
|---|---|---|
| Class | The course+section label of the enrollment | `GET /api/enrollment` → `class_label` |

## Roles & permissions
- <who sees this page, who doesn't, role differences (one line per role)>

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| "No data found." | no rows match (empty state) | enroll via <button> … |

## Related
- **Chapters:** [Ch NN — …](chNN-slug.md)
- **Screens:** P04 · **Dialogs:** D07
- **Endpoints:** `GET /api/enrollment` (details: Appendix C)
```

**Section rules**

| Section | Required? | Notes |
|---|---|---|
| Header block (Part/Phase/Covers/Roles) | always | IDs must exist in `00-INVENTORY.md` |
| In this chapter | always |3–6 bullets |
| Getting here | always (skip only for appendices) | menu path + URL + role precondition |
| Image placeholders | ≥1 per screen section | register each in `CAPTURE-MANIFEST.md` same step |
| Walkthrough | always | numbered steps, one action each |
| Forms and fields | only for the **owner** chapter | table format above, exact field names from source |
| Data on this screen | always if page shows tables/cards | Column → Meaning → Source (endpoint) |
| Roles & permissions | always | even if single-role ("student only") |
| When things go wrong | always | ≥2 rows; use real messages from Appendix E sources |
| Related | always | cross-refs by chapter number + IDs |

---

##3. Image placeholders & naming

- **Placeholder syntax (exact):** `<!-- img: chNN-slug -->` on its own line, immediately above where the figure belongs.
- **Slug rules:** lowercase, hyphens, page or subject first, state second: `ch07-enrollments-list`, `ch07-enroll-dialog-open`, `ch17-question-delete-confirm`.
- **Final image file:** `images/<same-id>.png` — ID equals filename minus `.png`. Phase13 replaces the placeholder with:
  `![<alt describing the view>](../images/chNN-slug.png)`
- **Every placeholder must have a row in [`CAPTURE-MANIFEST.md`](CAPTURE-MANIFEST.md)** (same step as writing the chapter). A chapter with unregistered placeholders fails QA in Phase13.
- **Capture consistency (Phase12 will obey):** viewport1440×900, light theme, backend :5001 + frontend :3000 via `/api` proxy, demo data from Phase11, dialogs captured open, validation states captured after one failed submit.

##4. Style guide

**Voice & tense**
- Second person, present tense: "You enroll in a course…" / "The table lists…".
- Active voice; short sentences; address the reader as the role of the chapter ("as a teacher, you see…").

**Terminology (binding)**
- Use UI labels **exactly as rendered**, in bold-quote first mention: **"Available Tests"**; afterwards plain.
- Use inventory names for entities: *course → subject → topic → question*; *predefined test*, *test session/attempt*, *enrollment*, *pre-assessment*.
- Routes/fields/endpoints/snippets in `code font`; never invent friendly renames (`/dashboard/tests/pending` stays code).
- Roles lowercase in prose (admin, teacher, student), capitalized only in UI badges.

**Structure**
- H1 = chapter title only; H2 = template sections; H3 = sub-items (per table/dialog/chart).
- Prefer tables over prose for fields, columns, options, errors.
- Numbered steps: exactly one UI action per step; include the expected result when non-obvious ("the dialog closes and a success toast appears").
- Callouts: `> **Tip:** …` / `> **Note:** …` / `> **Warning:** …` — max one per section.
- Cross-references: `[Ch19 — Designing & Managing Tests](ch19-designing-managing-tests.md)`; to an ID: "see P14 (inventory)".

**Accuracy rules**
1. Every factual claim must be verifiable in `00-INVENTORY.md` or the source file it cites. When citing code, use `path:line` in a Note, not in main prose.
2. **Never** describe anomalies (inventory §12) as intended behavior:
   - A01 legacy `/join/{token}` → one-line footnote in Ch10 only.
   - A09 teacher → student-detail404 → explicit "limitation" row in Ch16.
   - A14 "Forgot password?" → "(not yet functional)" the first time the button appears (Ch5).
   - 🔒 A04/A05/A06 → not mentioned in user chapters at all (reported separately).
3. Don't document internals users can't see (Redis keys, gateway rules) outside Ch3/Ch4/Appendix G.
4. Don't quote stale sources (`backend/*/API.md`, old ports `:3000/:3011–3017`, microservice wording). Canonical: inventory §6.
5. Password policy claims: min **12** chars + strength score ≥3 — from inventory (F02/Appendix E), not old docs.
6. Screenshots-in-progress: if a chapter ships before images exist, placeholders only — never link a non-existent file.

**Length guide**
- Student chapters (6–13):400–900 words each.
- Workflow chapters (14–28):700–1500 words.
- Reference chapters/appendices: unlimited; tables preferred.

**Front matter of each file**
- No YAML front-matter. The header block in the template is the metadata.
- First line is always the H1 title; second line blank; third line the header blockquote.

##5. Definition of done (per chapter)

- [ ] Correct filename + H1 matching TOC title
- [ ] Header block: Part, Phase, Covers (valid IDs), Roles
- [ ] "In this chapter"3–6 bullets
- [ ] "Getting here" with menu path + URL + role
- [ ] ≥1 image placeholder **and** matching `CAPTURE-MANIFEST.md` row
- [ ] Walkthrough steps numbered, one action each
- [ ] Owner-only: Forms-and-fields table in template format
- [ ] Data tables documented (Column → Meaning → Source)
- [ ] Roles & permissions stated
- [ ] ≥2 "When things go wrong" rows with real messages
- [ ] Related section with working relative links
- [ ] Anomaly handling per Style rule #2 (A-list respected)
- [ ] No claims not traceable to inventory/source
- [ ] Status flipped to ✅ in `README.md` TOC
