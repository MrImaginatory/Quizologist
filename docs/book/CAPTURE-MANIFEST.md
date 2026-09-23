# Capture Manifest — every image slot in the book

> **Phase 2 deliverable (format spec).** Writing phases (3–10) append a row for **each** `<!-- img: … -->` placeholder they add, in the same step as the chapter.
> **Phase11** validates that every `pending` row is reachable in the live UI (after seeding demo data).
> **Phase12** walks this table top-to-bottom with Chrome MCP, captures each shot, and flips Status to `captured`.
> **Phase13** replaces the placeholder in the chapter with the figure and flips Status to `integrated`.

## Format

| Column | Meaning |
|---|---|
| **ID** | equals the placeholder text and the image filename minus `.png` — pattern `chNN-<page-slug>[-<state>]` |
| **Ch** | chapter number (or `appX` for appendices — appendices normally have no images) |
| **Route** | URL to open (e.g. `/dashboard/questions`) |
| **Role** | account role to be logged in as: `admin` \| `teacher` \| `student` \| `anon` |
| **State / preconditions** | exact UI state to stage: which dialog is open, which data must exist, error state after which action |
| **Type** | `page` (default view) · `dialog` (modal open) · `state` (empty/error/success/validation variant) · `flow` (multi-step moment) |
| **Status** | `pending` → `captured` → `integrated` (or `missed` with a note) |

**Status values:** `pending` (registered, not yet reachable-checked) · `ready` (Phase11 verified reachable) · `captured` (PNG on disk) · `integrated` (placeholder replaced in chapter) · `missed` (couldn't capture — note why).

**Capture constants (Phase12):** viewport1440×900 · light theme · frontend `http://localhost:3000` (all API via same-origin `/api` proxy → backend :5001) · demo accounts/dataset from Phase11 · full-viewport screenshots (page area, not full-scroll) unless the row says `fullpage`.

---

## Manifest

| ID | Ch | Route | Role | State / preconditions | Type | Status |
|---|---|---|---|---|---|---|
| `ch17-question-validation-error` |17| `/dashboard/questions` | teacher | Add Question dialog open, Course/Subject/Topic/Question empty so **Save** is disabled | state | pending |
| `ch01-app-overview-dashboard` |1| `/dashboard` | student | Phase11 demo data present: KPI cards + performance charts non-empty | page | pending |
| `ch02-content-hierarchy-cascade` |2| `/dashboard/questions` | admin | Add Question dialog open with Course ▸ Subject ▸ Topic selects visible/cascaded | dialog | pending |
| `ch03-backend-health` |3| `http://localhost:5001/health` | anon | backend running; JSON `{"status":…}` shown in browser | page | pending |
| `ch04-password-policy-enforced` |4| `/signin` (sign-up mode) | anon | short weak password (`Jane@123`) submitted → strength checklist + server validation line visible | state | pending |
| `ch05-signin-default` |5| `/signin` | anon | fresh signed-out browser; default sign-in mode (also the landing view — root redirects anon here) | page | pending |
| `ch05-signin-to-signup` |5| `/signin` | anon | "Sign up" switch clicked → full registration form visible | state | pending |
| `ch05-invalid-credentials` |5| `/signin` | anon | valid-format email + wrong password submitted → "Invalid credentials" banner | state | pending |
| `ch05-rate-limit-429` |5| `/signin` | anon | ⚠ consumes RL1 (5/min):6 consecutive failed sign-ins → "Too many attempts…" banner; capture LAST, wait60s after | state | pending |
| `ch06-student-dashboard` |6| `/dashboard` | student | demo student with ≥2 completed tests so KPIs, trends, subject/topic cards are non-empty; capture below the greeting hero | page | pending |
| `ch06-preassessment-banner` |6| `/dashboard` | student | pre-assessment pending → amber "Mandatory Pre-Assessment Required" banner above KPIs (same banner also tops the Ch8/Ch9 screens) | state | pending |
| `ch07-enrollments-list` |7| `/dashboard/enrollments` | student | ≥2 enrollment rows, one course-wide (Subject/Topic show `-`) | page | pending |
| `ch07-enroll-dialog-open` |7| `/dashboard/enrollments` | student | "Enroll" clicked → D07 open, one Enrollment block, course catalog non-empty, dropdown closed | dialog | pending |
| `ch07-unenroll-confirm` |7| `/dashboard/enrollments` | student | trash icon on a row → "Unenroll" confirm dialog showing the course name | state | pending |
| `ch08-my-tests-history` |8| `/dashboard/my-tests` | student | ≥1 in_progress + ≥1 completed row so Resume/Abandon/View actions are all visible | page | pending |
| `ch08-start-test-dialog` |8| `/dashboard/my-tests` | student | Start Test clicked → D10 open, Standard mode, one selection with course picked + subjects list visible | dialog | pending |
| `ch08-abandon-confirm` |8| `/dashboard/my-tests` | student | red ✕ on an in_progress row → "Abandon Test?" dialog | state | pending |
| `ch09-available-tests` |9| `/dashboard/tests/pending` | student | mix: one available + one scheduled (window box) + one amber pre-assessment-badged test | page | pending |
| `ch09-filter-upcoming` |9| `/dashboard/tests/pending` | student | "Upcoming" stat card clicked → filter applied, "{n} test(s) found" | state | pending |
| `ch10-join-test-card` |10| `/test/join/{token}` | student | Phase11 creates an active predefined test → Copy link → open it signed in: join card with logo, Active badge, duration/questions/difficulty | page | pending |
| `ch10-join-invalid-link` |10| `/test/join/joined` | student | scrubbed URL opened without sessionStorage (fresh tab/incognito) → "Invalid or Expired Link" card | state | pending |
| `ch11-live-test-room` |11| `/live-test?id={attempt}` | student | mid-test: ≥3 answered + ≥1 skipped visible in palette, timer >1 min, connection dot green | page | pending |
| `ch11-submit-confirm` |11| `/live-test?id={attempt}` | student | answer gate met on last question (answered ≥ min(35, ⌈95%·N⌉)) → Submit → "Submit Test?" modal | state | pending |
| `ch11-cancel-confirm` |11| `/live-test?id={attempt}` | student | header Cancel on a non-pre-assessment test → "Cancel Test?" modal | state | pending |
| `ch12-time-based-live` |12| `/tb-live-test?id={session}` | student | session with ≥2 served questions: first answered (locked), latest live; TIME-BASED badge visible | page | pending |
| `ch12-all-correct-banner` |12| `/tb-live-test?id={session}` | student | tiny seeded bank (≈3 Q) answered correctly in sequence → "You're unstoppable!" banner + Submit Test | state | pending |
| `ch13-test-result` |13| `/test-result?id={attempt}` | student | attempt mixing correct/incorrect/skipped; one question with an explanation | page | pending |
| `ch13-download-menu` |13| `/test-result?id={attempt}` | student | header **Download** dropdown open (PDF / Excel items) | state | pending |
| `ch14-teacher-dashboard` |14| `/dashboard` | teacher | Phase11 teacher with ≥2 courses (one course-wide), teaching students, mixed-difficulty bank → 4 KPI cards + 3 widgets non-empty | page | pending |
| `ch14-widget-chart-view` |14| `/dashboard` | teacher | Top Students widget's ViewToggle switched to **Chart** (bar chart of avgScore) | state | pending |
| `ch15-teacher-enrollments` |15| `/dashboard/teacher-enrollments` | teacher | ≥2 course rows, one course-wide showing plain "All Subjects" | page | pending |
| `ch15-enroll-dialog-open` |15| `/dashboard/teacher-enrollments` | teacher | **+ Enroll** clicked → D08 open, course selected, subject checkboxes + Select All + counter visible | dialog | pending |
| `ch16-students-list` |16| `/dashboard/students` | teacher | teaching students across ≥2 courses; one course-wide row → "All Subjects" badge; filters untouched | page | pending |
| `ch16-assign-location-dialog` |16| `/dashboard/users/students` | admin | roster row action → **D09 open with current-location card** (⚠ audience admin, not the teacher route) | dialog | pending |
| `ch17-question-bank` |17| `/dashboard/questions` | teacher | mixed bank: MCQ + Descriptive rows, all five difficulty badges visible | page | pending |
| `ch17-question-delete-confirm` |17| `/dashboard/questions` | teacher | red trash on a row → "Delete Question" confirm ("…undone within 5 seconds") | state | pending |
| `ch18-import-upload` |18| `/dashboard/questions/import` | teacher | Step 1 card + Step 2 with a chosen .xlsx (name + KB + "Click or drop to replace") | state | pending |
| `ch18-import-missing-entities` |18| `/dashboard/questions/import` | admin | ⚠ admin account: sheet references new hierarchy → orange "Missing Entities Detected" card with badges + `├──` tree | state | pending |
| `ch18-import-preview` |18| `/dashboard/questions/import` | teacher | parsed batch mixing Ready + Error rows (≥1 Error with a reason tooltip) and both count badges | state | pending |
| `ch18-import-result` |18| `/dashboard/questions/import` | teacher | import finished → "Import Complete" tiles + "Show Errors (n)" expanded to Detailed Import Errors | state | pending |
| `ch19-tests-list` |19| `/dashboard/tests` | teacher | ≥2 attempts with mixed statuses/scores; one completed row showing **View** | page | pending |
| `ch19-create-wizard-mixed` |19| `/dashboard/tests/create` | teacher | step **Configuration** with Difficulty = Mixed → Difficulty Ratio block visible, Total = 100% (green) | flow | pending |
| `ch19-manage-tests` |19| `/dashboard/tests/manage` | teacher | catalog with a draft row (▶) and an active row (⏸) | page | pending |
| `ch19-test-detail` |19| `/dashboard/tests/{id}` | teacher | draft test with fixed-questions + specific-students ON, ≥1 question selected, share token present → link + Activate visible | page | pending |
| `ch19-question-selector` |19| `/dashboard/tests/{id}` | teacher | **D11 open**: mixed-ratio test, quota tiles visible, some rows selected, one difficulty at quota (disabled rows) | dialog | pending |
| `ch19-student-selector` |19| `/dashboard/tests/{id}` | teacher | **D12 open** with ≥2 students selected (counter + Select All/Clear visible) | dialog | pending |
| `ch19-student-results` |19| `/dashboard/tests/student-results?studentId=…&name=…` | teacher | direct URL for the seeded student with ≥2 completed tests → Test History populated | page | pending |
| `ch20-admin-dashboard` |20| `/dashboard` | admin | seeded stats → all six KPI cards non-zero, Users by Location widget (table view) non-empty with "(N total users)" | page | pending |
| `ch20-users-by-location-chart` |20| `/dashboard` | admin | same as above but the widget's ViewToggle switched to **Chart** (bar chart, "Users" series) | state | pending |
| `ch21-locations-list` |21| `/dashboard/locations` | admin | ≥3 locations incl. the central row (Central badge, empty Actions cell) + ≥1 regular row showing pencil + trash | page | pending |
| `ch21-add-location-dialog` |21| `/dashboard/locations` | admin | **D04 open** in create mode: "Add Location" title, required fields empty (Country prefilled India), Save visible | dialog | pending |
| `ch21-delete-location-confirm` |21| `/dashboard/locations` | admin | trash on a regular row → **D13 open**: "Delete Location" ("…undone within 5 seconds"), Delete button red | state | pending |
| `ch22-all-users` |22| `/dashboard/users` | admin | mixed roles (blue Student / green Teacher / purple Admin badges), ≥1 "Not assigned" location, pin action visible, own row's Actions empty | page | pending |
| `ch23-teachers-list` |23| `/dashboard/users/teachers` | admin | ≥2 teachers, mixed assigned/"Not assigned" locations, hard-coded green Teacher badges | page | pending |
| `ch24-students-list` |24| `/dashboard/users/students` | admin | ≥2 students, Name links + eye "View details" visible, hard-coded blue Student badges, pin action present | page | pending |
| `ch25-student-details` |25| `/dashboard/users/students/{studentId}` | admin | seeded student: profile card w/ location, 3 KPI cards non-zero, Enrollments & Teachers with ≥1 course + teacher chip, Strong + Weak topics listed, Test History ≥2 rows with View Results | page | pending |

*(real rows are appended above as chapters are written — do not edit the header/columns)*
