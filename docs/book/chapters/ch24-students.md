# Chapter 24 — Students

> **Part:** VI — Administrator's Guide: People & Organization · **Phase:** 8
> **Covers:** P18, D09 AssignLocationDialog *(cross-reference only — owner is [Ch16](ch16-working-with-students.md))*
> **Roles:** admin

## In this chapter
- Viewing the student roster and its columns
- Opening a student's profile (the eye button → [Ch25](ch25-student-profiles-performance.md))
- Assigning locations to students

## Getting here
- **Menu path:** Management ▸ Users ▸ Students
- **URL:** `/dashboard/users/students`
- **Requires:** admin role

<!-- img: ch24-students-list -->

## Walkthrough

1. Open **Students** in the sidebar — the header reads **"Students"** with the subtitle *"View all registered students"*.
2. The table lists every account whose role is `student` (10 rows per page; **Show … per page** selector, *"N total records"*).
3. Click a row's **Name** (a link) or the eye icon in **Actions** to open that student's profile → [Ch25](ch25-student-profiles-performance.md).
4. To set a location, click the pin icon in **Actions** → **"Assign Location"** dialog ([Ch16](ch16-working-with-students.md) documents D09) → choose a non-central location → **Assign** → toast *"Location assigned successfully"*.

> **Note:** your own row (if you also appear here) shows neither the pin nor the eye — the actions are hidden for the signed-in account.

## Data on this screen

### Students table (P18 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number on the current page | client-side index |
| Name | avatar (initials) + `First Last`, **underlined on hover — links to the profile** (`/dashboard/users/students/{id}`) | `GET /api/user/role/student` → `fname`/`lname` |
| Email | email address | `email` |
| Mobile | mobile number | `mobileNumber` |
| Role | blue badge, text **"Student"** — *hard-coded* (the endpoint returns students only) | static render |
| Location | pin icon + `City, State`, or muted **"Not assigned"** | `user.location` |
| Actions | pin (*"Assign location"*) + eye (*"View details"*); both hidden for your own row | — |

> **Tip:** this roster is the **only** nav-reachable door to a student's profile. The equivalent teacher roster ([Ch16](ch16-working-with-students.md)) deliberately has no such link — that limitation (A09) is described there.

## Roles & permissions
- **admin** — only role that can open this roster; assign locations and open profiles.
- **teacher / student** — not permitted (403); teachers reach their students' test attempts through the tests list instead ([Ch19](ch19-designing-managing-tests.md)).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"No data found."* | no student accounts exist yet | have students sign up ([Ch5](ch05-getting-started.md)) |
| *"Not assigned"* in Location | that student has no location | open D09 from the pin button |
| Profile opens with *"Failed to load student details. You might not have permission."* | the details call was refused or the id is wrong | return to the roster and re-open via the eye button ([Ch25](ch25-student-profiles-performance.md)) |
| Banner *"Failed to assign location"* | the PATCH call was rejected | retry; check backend health |
| Your own **Actions** cell is empty | by design — no self-assignment | ask another admin |

## Related
- **Chapters:** [Ch25 — Student Profiles & Performance](ch25-student-profiles-performance.md) · [Ch16 — Working with Students](ch16-working-with-students.md) *(D09 owner)* · [Ch22 — All Users](ch22-all-users.md) · [Ch23 — Teachers](ch23-teachers.md) · [Ch21 — Locations](ch21-locations.md)
- **Screens:** P18 · **Dialogs:** D09 *(cross-ref)*
- **Endpoints:** `GET /api/user/role/student`, `PATCH /api/user/{id}/location` (details: Appendix C)
