# Chapter 15 — Teaching Enrollments

> **Part:** V — The Teacher Handbook · **Phase:** 7
> **Covers:** P07 `/dashboard/teacher-enrollments`, **D08 TeacherEnrollDialog (owner)**, D13 "Unenroll from Course"
> **Roles:** teacher

## In this chapter
- Seeing which courses and subjects you teach
- Enrolling yourself in a course (all subjects or a hand-picked subset) — the **Enroll to Teach** dialog
- Removing an enrollment with the row's trash button
- Why the page looks empty if an admin opens it

## Getting here
- **Menu path:** Management ▸ My Enrollments
- **URL:** `/dashboard/teacher-enrollments`
- **Requires:** teacher role (see the admin note under Roles)

<!-- img: ch15-teacher-enrollments -->

## The page
Header: **"My Teaching Enrollments"** with the subtitle *"Manage your course and subject enrollments for teaching"* and a **+ Enroll** button on the right.

The single card is titled **"Enrolled Courses ({n})"** — the number is the *filtered* count — with a search box (placeholder *"Search courses or subjects..."*) inside its header. Filtering is instant as you type; there is **no pagination** (the hook loads up to 100 rows).

### Enrolled Courses table (P07 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number of the filtered list | client-side index |
| Course | the course you're enrolled to — purple outline badge | `GET /api/teacher/teacher-enrollment?teacher_id={you}&limit=100` → `course.name` (capitalized) |
| Subjects | one blue badge per enrolled subject; if the enrollment is course-wide (no subjects), plain muted text **"All Subjects"** | `subject.name` per assignment |
| *(unlabeled)* | destructive trash icon → opens the **Unenroll from Course** confirm | click handler |

Rows are **grouped by course on the client**: one row per course, even if you hold several subject-level assignment rows for it.

**Empty states** (the card always shows one of these when there are no rows):
| You see | Because |
|---|---|
| Book icon + *"No enrollments yet"* / *"Click "Enroll" to start teaching courses and subjects"* | you have no assignments and the search box is empty |
| Book icon + *"No enrollments match your search"* / *"Try a different search term"* | your search text matches nothing |
| Red centered text (the error message) | the enrollment request failed |

<!-- img: ch15-enroll-dialog-open -->

## Enroll to Teach — D08 field table *(this chapter owns D08)*

Opened by **+ Enroll**. Submit posts `POST /api/teacher/assign/bulk-subjects` with `{ teacher_id, course_id, subject_ids? }`.

| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 1 | `course_id` | **Course \*** | Select (single) | ✓ | all courses (loaded with `limit=100`); placeholder *"Loading..."* while loading; **choosing a course resets any subject selection** |
| 2 | `subject_ids` | **Subjects** | Checkbox list + **Select All** | — | appears only after a course is chosen; empty list shows *"No subjects available for this course"*; when ≥1 is selected a counter shows *"{n} of {m} subjects selected"*; **leaving the list empty means "all subjects in the course"** (the field is omitted from the payload) |

- **Dialog copy:** title *"Enroll to Teach"*; description *"Select a course and the subjects you want to teach. You can select multiple subjects or all subjects in the course."*
- **Guard:** submitting without a course is blocked — the footer button stays disabled (`Enroll to Teach` requires a selected course); the validation message is *"Please select a course"*.
- **Footer:** **Cancel** · **Enroll to Teach** (spinner while saving).
- **Toasts on success:** `Enrolled in {n} subject(s)` (green) and, if some were already enrolled, `{m} subject(s) skipped (already enrolled)` (info). The dialog then closes and the card refreshes.

## Unenroll — D13 (row trash)
| Element | Value |
|---|---|
| Title | **"Unenroll from Course"** |
| Description | *"Are you sure you want to unenroll from {course name}? You will no longer be able to teach this course and its subjects."* |
| Confirm button | **Unenroll** |
| What happens | loops over every assignment id behind that course row → `DELETE /api/teacher/unenroll/{id}` for each → toast `Unenrolled from {name} successfully` and the card refreshes |

> **Warning:** unenrolling removes **all** subjects of that course at once — the confirm text says so; there is no per-subject removal on this screen.

## Roles & permissions
- **Teacher** — full view: your assignments, the Enroll dialog, and the trash action.
- **Admin** — the route is allowed, but the data hook only fetches for a signed-in *teacher*, so an admin always sees the **"No enrollments yet" empty state**. That's a known quirk (inventory **A07**), not a broken page — admins manage teacher assignments from the admin rosters instead (Ch23).
- **Student** — the nav item doesn't exist; the route is staff-scoped.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"No enrollments yet"* right after signing in | you genuinely have none yet (or an admin opened the page — A07) | click **+ Enroll**, pick a course, submit |
| *"No subjects available for this course"* | the chosen course has no subjects defined | create the subjects first (admin: Ch26), then retry |
| `{m} subject(s) skipped (already enrolled)` toast | those subjects were already in your list — the server skips duplicates | nothing to do; only new subjects were added |
| Red error text inside the dialog | server rejected the request (e.g. course id invalid) | close and reopen, reselect the course; if it persists ask your admin |
| *"Failed to unenroll"* toast | a `DELETE` call failed mid-loop — some subjects may remain | reopen the row's trash and confirm again to remove the rest |

## Related
- **Chapters:** [Ch14 — The Teaching Dashboard](ch14-teaching-dashboard.md) · [Ch16 — Working with Students](ch16-working-with-students.md) · [Ch5 — Getting Started](ch05-getting-started.md) · Ch23 (admin: Teachers) · Ch26 (admin: hierarchy)
- **Screens:** P07 · **Dialogs:** D08 *(owner)*, D13
- **Endpoints:** `GET /api/teacher/teacher-enrollment`, `POST /api/teacher/assign/bulk-subjects`, `DELETE /api/teacher/unenroll/{id}` (details: Appendix C)
