# Chapter 16 — Working with Students

> **Part:** V — The Teacher Handbook · **Phase:** 7
> **Covers:** P08 `/dashboard/students`, **D09 AssignLocationDialog (owner)**, limitation A09
> **Roles:** teacher (page) · admin (D09 is only opened from the admin rosters — see below)

## In this chapter
- Listing the students enrolled in your courses and filtering them by course/subject
- What the Course and Subject badges mean (including "All Subjects")
- The **Assign Location** dialog — documented here as its owner, but note *where it actually opens from*
- The stated limitation: teachers have no student-detail drill-down (A09)

## Getting here
- **Menu path:** Management ▸ Students *(teacher nav — labeled just "Students")*
- **URL:** `/dashboard/students`
- **Requires:** teacher role

<!-- img: ch16-students-list -->

## The page
Header: a Users icon + **"My Students"** with the subtitle *"Students enrolled in your courses and subjects"*. Below sits the filter bar, then a DataTable titled **"Students"** with pagination (default 10 rows per page).

### Filters (no field labels — placeholders only)
| Control | Placeholder | Behavior |
|---|---|---|
| Course select | *"All Courses"* (*"Loading courses..."* while loading) | choosing a course enables subject filtering |
| Subject select | *"Select course first"* until a course is chosen, then *"All Subjects"* | options are limited to subjects **of the chosen course** |
| **Clear** (ghost button) | — | appears only when a filter is active; resets both and returns to page 1 |

### Students table (P08 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number on the current page | client-side index |
| Name | `First Last` (capitalized), plain bold text — **not a link** | `GET /api/teacher/teaching/students?page&limit&course_id&subject_id` → `fname`/`lname` |
| Email | muted email address | `email` |
| Course | purple badge with the course name; `-` if the course isn't in your loaded course list | `course_id` resolved client-side |
| Subject | blue badge: the subject name — or **"All Subjects"** when the row has no `subject_id` (course-wide enrollment); `-` if the id doesn't resolve | `subject_id` |

> **Note:** there is **no Actions column** on this screen. A teacher cannot open a student's detail/profile page — the student-detail route stays admin-only (inventory **A09**, a stated limitation). Use the tests list ([Ch19](ch19-designing-managing-tests.md)) to see a student's attempts.

<!-- img: ch16-assign-location-dialog -->

## Assign Location — D09 field table *(this chapter owns D09)*

> **Where it opens from:** despite being documented here, this dialog is **never opened from `/dashboard/students`**. It appears only on the three admin rosters — **All Users** (P16), **Teachers** (P17) and **Students** (P18) — each row's Actions column. The screenshot for this slot is therefore taken as an **admin** on `/dashboard/users/students`.

Submit: `PATCH /api/user/{id}/location` with `{ location_id }`.

| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 1 | *(display)* | current-location card | read-only | — | shown only when the user already has a location: MapPin + `{address_line_1}` and *"{City}, {State}"*; a destructive **✕** button on the right **removes** it (sends `location_id: null`) |
| 2 | `location_id` | **"Change Location"** (or **"Select Location"** when none is set) | Select (single) | ✓ to save | options exclude central locations (`is_central` filtered out); each option reads *"{address}, {City}, {State}"*; trigger shows *"{address}, {City}"* for the picked location, *"Loading locations..."* while loading, *"Choose a location"* when nothing is picked |

- **Dialog copy:** title *"Assign Location"*; description *"Assign a location to {First} {Last}"*.
- **Footer:** **Cancel** · **Assign** (disabled while loading or with no location selected — to *remove* a location use the ✕, not Assign).
- **Toasts:** `Location assigned successfully` / `Location removed successfully`.

**Admin-side actions that open it** (cross-reference only — full tables in Ch22/Ch23/Ch24): the roster row's location/assign button.

## Roles & permissions
- **Teacher** — sees only students of your teaching courses/subjects, filtered server-side; no dialogs on this page.
- **Admin** — does not use this screen (their student list is P18, with the D09 dialog); they may open `/dashboard/students` directly but the endpoint is teacher-scoped.
- **Student** — route not in nav; staff-scoped.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Empty table | no students match the current course/subject filter | press **Clear**, or pick a broader course |
| `-` in the Course column | that row's course id isn't among your loaded courses | informational only; reload the page |
| *"Loading students..."* stuck / red error in the table | `GET /api/teacher/teaching/students` failed (expired token, backend down) | reload; re-sign-in if needed ([Ch5](ch05-getting-started.md)) |
| Opening `/dashboard/users/students/{id}` as a teacher → 404 | the student-detail page has an admin-only guard | **limitation (A09):** teachers have no drill-down — use the tests list instead |
| D09 dropdown only shows *"Loading locations..."* | locations request in flight or failing | wait; if it persists, ask an admin to check the locations data (Ch21) |

## Related
- **Chapters:** [Ch14 — The Teaching Dashboard](ch14-teaching-dashboard.md) · [Ch15 — Teaching Enrollments](ch15-teaching-enrollments.md) · [Ch19 — Designing & Managing Tests](ch19-designing-managing-tests.md) · Ch22 / Ch23 / Ch24 (admin rosters that open D09) · Ch25 (admin student profile)
- **Screens:** P08 · **Dialogs:** D09 *(owner — opened from P16/P17/P18)*
- **Endpoints:** `GET /api/teacher/teaching/students`, `PATCH /api/user/{id}/location` (details: Appendix C)
