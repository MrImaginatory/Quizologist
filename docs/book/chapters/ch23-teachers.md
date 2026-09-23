# Chapter 23 — Teachers

> **Part:** VI — Administrator's Guide: People & Organization · **Phase:** 8
> **Covers:** P17, D09 AssignLocationDialog *(cross-reference only — owner is [Ch16](ch16-working-with-students.md))*
> **Roles:** admin

## In this chapter
- Viewing the teacher roster and its columns
- Why the **Role** column always reads **Teacher**
- Assigning locations to teachers

## Getting here
- **Menu path:** Management ▸ Users ▸ Teachers
- **URL:** `/dashboard/users/teachers`
- **Requires:** admin role

<!-- img: ch23-teachers-list -->

## Walkthrough

1. Open **Teachers** in the sidebar — the header reads **"Teachers"** with the subtitle *"View all registered teachers"*.
2. The table lists every account whose role is `teacher` (fetched once for the page; 10 rows per page with the standard **Show … per page** selector).
3. To set or change a teacher's location, click the pin icon in **Actions** → the **"Assign Location"** dialog opens ([Ch16](ch16-working-with-students.md) documents D09 in full).
4. Choose a non-central location → **Assign** → toast *"Location assigned successfully"*. Use the ✕ on the current-location card to remove it instead.

> **Note:** your own row has an empty **Actions** cell — you cannot assign a location to yourself.

## Data on this screen

### Teachers table (P17 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number on the current page | client-side index |
| Name | avatar (initials) + `First Last` — **plain text, not a link** | `GET /api/user/role/teacher` → `fname`/`lname` |
| Email | email address | `email` |
| Mobile | mobile number | `mobileNumber` |
| Role | green badge, text **"Teacher"** — *hard-coded*, not read from the record (the endpoint returns teachers only) | static render |
| Location | pin icon + `City, State`, or muted **"Not assigned"** | `user.location` |
| Actions | pin icon button, tooltip *"Assign location"*; empty for your own row | rendered only when `user.id !== current user` |

> **Tip:** there is no teacher-detail page and no link out of this roster — for a teacher's courses and students, use their own enrollments view ([Ch15](ch15-teaching-enrollments.md)) as the teacher, or the student profile ([Ch25](ch25-student-profiles-performance.md)) for student progress.

## Roles & permissions
- **admin** — only role that can open this roster; assign/remove locations (D09).
- **teacher / student** — not permitted (403).
- Role badges elsewhere in the app are colored by role; here the color is decorative since every row is a teacher.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"No data found."* | no teacher accounts exist yet | have a teacher sign up ([Ch5](ch05-getting-started.md)) |
| *"Not assigned"* in Location | that teacher has no location | open D09 from the pin button |
| Banner *"Failed to assign location"* | the PATCH call was rejected | retry; verify backend health |
| **Assign** stays disabled | no option chosen in the picker | select a location first |
| Your own **Actions** cell is empty | by design — no self-assignment | ask another admin |

## Related
- **Chapters:** [Ch16 — Working with Students](ch16-working-with-students.md) *(D09 owner)* · [Ch22 — All Users](ch22-all-users.md) · [Ch24 — Students](ch24-students.md) · [Ch15 — Teaching Enrollments](ch15-teaching-enrollments.md)
- **Screens:** P17 · **Dialogs:** D09 *(cross-ref)*
- **Endpoints:** `GET /api/user/role/teacher`, `PATCH /api/user/{id}/location` (details: Appendix C)
