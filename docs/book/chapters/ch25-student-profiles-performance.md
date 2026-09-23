# Chapter 25 — Student Profiles & Performance

> **Part:** VI — Administrator's Guide: People & Organization · **Phase:** 8
> **Covers:** P19, details payload, test-history table; limitation A09 *(owned by [Ch16](ch16-working-with-students.md))*
> **Roles:** admin (page guard); the underlying API also allows teacher, but the guard blocks it — see A09 below

## In this chapter
- Opening a student's profile from the roster
- Reading the profile card, KPI cards, and **"Enrollments & Teachers"** block
- Interpreting **Strong Topics** / **Weak Topics**
- Using the **Test History** table and its **View Results** action

## Getting here
- **Menu path:** Management ▸ Users ▸ Students → click a **Name** or the eye icon *(no direct sidebar entry)*
- **URL:** `/dashboard/users/students/{studentId}`
- **Requires:** admin role (the route guard is admin-only — see limitation A09)

While loading you see *"Loading student details..."*; on failure the page shows red text: the API's message, or *"Failed to load student details. You might not have permission."*

<!-- img: ch25-student-details -->

## Walkthrough

1. From the **Students** roster ([Ch24](ch24-students.md)), click a student's name or eye button.
2. The header shows a back arrow (returns to the previous page), **"Student Details"**, and the subtitle *"View detailed information and performance"*.
3. Read the **Profile** card (left): avatar, full name, **Student** badge, email, mobile (when set), and location.
4. Read the three KPI cards: **Total Tests**, **Topics Attempted**, **Overall Accuracy** (percentage, highlighted in the primary color).
5. Scroll to **"Enrollments & Teachers"** — one block per course, each listing its subjects and assigned teachers.
6. Check **Strong Topics** and **Weak Topics** for at-a-glance strengths and gaps.
7. In **Test History**, click **"View Results"** on any row → opens `/test-result?id={testId}&studentId={studentId}` ([Ch13](ch13-results-analytics.md)).

## Data on this screen

The page makes a single call: `GET /api/dashboard/admin/student/{id}/details`, whose payload has five parts — `student`, `enrollments`, `teachers`, `testHistory`, `performance`.

### Profile card
| Row | Meaning | Source |
|---|---|---|
| Avatar + name | initials on a color tile; `First Last` capitalized | `student.fname`/`lname` |
| Badge | **Student** (outline) | static |
| ✉ email | email address | `student.email` |
| ☎ mobile | shown only when present | `student.mobile_number` |
| 📍 location | `City, State` capitalized, or **"Location not set"** | `student.city`/`state` |

### KPI cards
| Card | Value | Source |
|---|---|---|
| Total Tests | count (0 when none) | `performance.totalTests` |
| Topics Attempted | count of distinct topics touched | `performance.totalTopicsAttempted` |
| Overall Accuracy | `{n}%` in primary color | `performance.overallAccuracy` |

### Enrollments & Teachers
| Element | Meaning | Source |
|---|---|---|
| Course name | capitalized, primary-colored heading | `enrollments[].name` |
| Subject badges | secondary badges with a book icon — one per subject in that course | `enrollments[].subjects[]` |
| Assigned Teachers | stacked chips of teacher names for that course, or italic *"None assigned"* | `teachers` filtered by `course_name` |
| Empty state | *"Not enrolled in any courses yet."* | when `enrollments` is empty |

### Strong Topics / Weak Topics
| Card | Subtitle (exact) | Threshold | Row content |
|---|---|---|---|
| **Strong Topics** (green) | *"Topics where accuracy is >= 80%"* | accuracy ≥ 80 % | topic name, subject below it, green badge `{accuracy}% Acc` |
| **Weak Topics** (red) | *"Topics where accuracy is < 50%"* | accuracy < 50 % | topic name, subject below it, red badge `{accuracy}% Acc` |

Empty texts: *"No strong topics identified yet."* / *"No weak topics identified."* Topics between the two thresholds appear in neither list.

### Test History table
| Column | Meaning | Source |
|---|---|---|
| Test Name | capitalized test name; falls back to **"Unknown"** | `testHistory[].test_name` |
| Date | localized date of completion | `completed_at` |
| Status | badge — solid for `completed`, muted otherwise, text capitalized | `status` |
| Score | `{score}%` | `score` |
| Correct | green count | `correct` |
| Incorrect | red count | `incorrect` |
| Total | total questions in the test | `total_questions` |
| Actions | **"View Results"** button (eye icon) → `/test-result?id={t.id}&studentId={studentId}` | row link |

Table title: **"Test History"**, description *"Recent tests completed by the student"*. It is not paginated by this screen — the whole history array renders (the shared table virtualizes past 50 rows).

> **Note (limitation A09):** this page's URL is guarded **admin-only**, even though the details API would accept a teacher too. A teacher who types the URL directly gets the 404/not-permitted result — that limitation is owned and described in [Ch16](ch16-working-with-students.md). Only the admin rosters ([Ch22](ch22-all-users.md)/[Ch24](ch24-students.md)) link here.

## Roles & permissions
- **admin** — intended audience; reaches this page from the Students roster.
- **teacher** — blocked by the route guard (A09); use the tests list to see attempts ([Ch19](ch19-designing-managing-tests.md)).
- **student** — route not permitted; students see their own results in [Ch13](ch13-results-analytics.md).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"Loading student details..."* | the details call is in flight (or slow) | wait; retry by reloading |
| *"Failed to load student details. You might not have permission."* | wrong/unknown id, non-admin session, or API error | go back and re-open from the roster; sign in as admin |
| *"Not enrolled in any courses yet."* | the student has no enrollments | the student enrolls themselves ([Ch7](ch07-my-enrollments.md)) |
| *"No strong topics identified yet."* / *"No weak topics identified."* | too little data, or all accuracies sit between 50 % and 80 % | have the student complete more tests |
| **Test History** shows *"No data found."* | no completed attempts yet | the student takes a test ([Ch10](ch10-joining-a-test.md)) |
| **View Results** shows *"Test result not found"* | the attempt/result id no longer resolves | pick another row or check the history on the student's side ([Ch8](ch08-my-tests.md)) |

## Related
- **Chapters:** [Ch24 — Students](ch24-students.md) *(entry point)* · [Ch16 — Working with Students](ch16-working-with-students.md) *(A09 owner)* · [Ch13 — Results & Review](ch13-results-analytics.md) · [Ch20 — The Admin Dashboard](ch20-admin-dashboard.md) · [Ch22 — All Users](ch22-all-users.md)
- **Screens:** P19
- **Endpoints:** `GET /api/dashboard/admin/student/{id}/details`, `GET /api/test/result/{id}/` (details: Appendix C)
