# Quizologist Ebook — Master Inventory

> **Phase 1 deliverable** of the13-phase documentation plan.
> **Purpose:** single source of truth for every screen, dialog, form, endpoint, data entity and known quirk in the application. Later chapters cite the IDs in this file.
> **Verified against:** working tree as of this date (`frontendJkShah`, `backend-mono`), after the security/UX remediation commits.
> **Status:** ✅ complete — pending review.

## How to read this file (ID scheme)

| Prefix | Meaning | Range |
|---|---|---|
| `P##` | Page (route) | P01–P29 |
| `D##` | Dialog component | D01–D13 |
| `F##` | Standalone form / wizard | F01–F04 |
| `M##` | Database model (table) | M01–M15 |
| `RL#` | Rate limiter | RL1–RL2 |
| `A##` | Known anomaly / open question | A01–A14 |
| API paths | shown relative to their mount prefix (all under `/api`) | — |

**Stack at a glance:** Next.js16 / React19 frontend (`frontendJkShah`, port :3000, `/api/*` proxied to backend) · Express monolith (`backend-mono`, port :5001) · PostgreSQL (Sequelize,15 tables) · Redis (sessions/caches) · Socket.IO (tests, same port as API). Three roles: **admin, teacher, student**. Auth via HttpOnly cookies (`access_token`15-min JWT + `refresh_token` opaque7-day, silent refresh, revocation in Redis).

---

##1. Access control model

Two layers guard the app:

1. **`RouteGuard`** (`components/auth/route-guard.tsx`) — unauthenticated on protected route → `/signin`; authenticated on a public route (`/signin`, `/signup` declared) → `/dashboard`; **role mismatch renders404 (`<NotFound/>`), not a redirect.**
2. **`ROLE_ROUTES`** (`app/(dashboard)/layout.tsx`) — exact match first, then longest prefix; default = any authenticated user. Layout also force-redirects students with an incomplete pre-assessment to `/live-test?id=…` (blocks **all** dashboard pages for them — see A13).

| Route prefix | Allowed roles |
|---|---|
| `/dashboard/tests/pending`, `/dashboard/enrollments`, `/dashboard/my-tests` | student |
| `/dashboard/questions`, `/dashboard/tests` (+ children), `/dashboard/teacher-enrollments`, `/dashboard/students` | admin + teacher |
| `/dashboard/courses`, `/dashboard/subjects`, `/dashboard/topics`, `/dashboard/users` (+ children), `/dashboard/analytics`, `/dashboard/locations` | admin |
| everything else under `/dashboard` (home, …) | any authenticated |

**Backend:** gateway middleware on `/api` (`src/config/routes.ts`) matches the **first** rule by prefix; matched rule → `authenticate` (Bearer **or** `access_token` cookie, Redis revocation check fail-open) + optional `authorize(...roles)` (401/403). **Unmatched path = no auth at all (fail-open)** — see A06.

### Role × page matrix

| Page | admin | teacher | student | Notes |
|---|:-:|:-:|:-:|---|
| P01 `/` | ✓ | ✓ | ✓ | redirect shell (public) |
| P02 `/signin` | ✓ | ✓ | ✓ | public; sign-in ⇄ sign-up modes |
| P03 `/dashboard` | ✓ | ✓ | ✓ | role-branched home |
| P04 `/dashboard/enrollments` | — | — | ✓ | |
| P05 `/dashboard/my-tests` | — | — | ✓ | |
| P06 `/dashboard/tests/pending` | — | — | ✓ | "Available Tests" |
| P07 `/dashboard/teacher-enrollments` | ✓* | ✓ | — | *admin route allowed but data hook yields empty — A07 |
| P08 `/dashboard/students` | ✓ | ✓ | — | nav shows Students only to teacher |
| P09 `/dashboard/questions` | ✓ | ✓ | — | |
| P10 `/dashboard/questions/import` | ✓ | ✓ | — | |
| P11 `/dashboard/tests` | ✓ | ✓ | — | |
| P12 `/dashboard/tests/create` | ✓ | ✓ | — | prefix rule only |
| P13 `/dashboard/tests/manage` | ✓ | ✓ | — | prefix rule only |
| P14 `/dashboard/tests/[id]` | ✓ | ✓ | — | prefix rule only |
| P15 `/dashboard/tests/student-results` | ✓ | ✓ | — | prefix rule only |
| P16 `/dashboard/users` | ✓ | — | — | |
| P17 `/dashboard/users/teachers` | ✓ | — | — | |
| P18 `/dashboard/users/students` | ✓ | — | — | |
| P19 `/dashboard/users/students/[studentId]` | ✓ | —* | — | *admin rosters only link here; direct teacher URL → 404 — A09 |
| P20 `/dashboard/courses` | ✓ | — | — | |
| P21 `/dashboard/subjects` | ✓ | — | — | |
| P22 `/dashboard/topics` | ✓ | — | — | |
| P23 `/dashboard/locations` | ✓ | — | — | |
| P24 `/dashboard/analytics` | ✓ | — | — | |
| P25 `/join/[token]` | ✓ | ✓ | ✓ | group `RouteGuard`; legacy variant — A01 |
| P26 `/test/join/[token]` | ✓ | ✓ | ✓ | canonical (own auth redirect) |
| P27 `/live-test` | — | — | ✓ | `(test)` group = `RouteGuard requireAuth` only (no role filter — attempts are student-scoped server-side) |
| P28 `/tb-live-test` | — | — | ✓ | |
| P29 `/test-result` | ✓† | ✓† | ✓ | †with `?studentId=` (admin/teacher viewing) |

---

##2. Navigation

**Sidebar** (`app-sidebar.tsx`, selected by `user.role`); **Header** (`dashboard-shell.tsx`): live date/time, notification bell (unread dot), avatar dropdown with Logout. Sidebar footer: logo → `/dashboard`, user name + role, logout icon.

| Role | Section | Label → href |
|---|---|---|
| **Student** | Main | Dashboard → `/dashboard` · My Enrollments → `/dashboard/enrollments` · My Tests → `/dashboard/my-tests` · Available Tests → `/dashboard/tests/pending` |
| **Teacher** | Main | Dashboard → `/dashboard` · My Enrollments → `/dashboard/teacher-enrollments` · Students → `/dashboard/students` |
| | Management | Tests ▸ View Tests → `/dashboard/tests` · Tests ▸ Manage Tests → `/dashboard/tests/manage` · Questions ▸ All Questions → `/dashboard/questions` · Questions ▸ Import Excel → `/dashboard/questions/import` |
| **Admin** | Main | Dashboard → `/dashboard` |
| | Management | Users ▸ All Users → `/dashboard/users` · Users ▸ Students → `/dashboard/users/students` · Users ▸ Teachers → `/dashboard/users/teachers` · Courses ▸ Courses → `/dashboard/courses` · Courses ▸ Subjects → `/dashboard/subjects` · Courses ▸ Topics → `/dashboard/topics` · Questions ▸ All Questions → `/dashboard/questions` · Questions ▸ Import Excel → `/dashboard/questions/import` · Tests ▸ View Tests → `/dashboard/tests` · Tests ▸ Manage Tests → `/dashboard/tests/manage` · Locations → `/dashboard/locations` · Analytics → `/dashboard/analytics` |

Not in nav (reached in-context): `tests/create`, `tests/[id]`, `users/students/[studentId]`, both join pages, `live-test`, `tb-live-test`, `test-result`. (`tests/student-results` is **not linked from anywhere** — A16.)

---

##3. Page inventory (P01–P29)

> All data paths are prefixed with the backend origin; since `next.config.ts` rewrites, the browser calls **same-origin `/api/…`** (HttpOnly cookies ride along). Empty tables render "No data found."; fetch failures render the error string (`components/data-table.tsx`), unless noted.

### Auth & root

#### P01 — `/` · `app/page.tsx`
- **Roles:** anyone · **Purpose:** resolves session (silent refresh / `/me`) then forwards to `/dashboard` (authenticated) or `/signin` (not); renders spinner meanwhile.
- **Data:** via auth context (`POST /api/user/refresh`, `GET /api/user/me`). **Dialogs/actions:** none.

#### P02 — `/signin` · `app/(auth)/signin/page.tsx`
- **Roles:** public · **Purpose:** the only auth screen — hosts `AuthPage` which toggles **SignInForm ⇄ SignUpForm** (desktop two-panel, mobile stacked).
- **Forms:** F01 (sign-in), F02 (sign-up). **Data:** none fetched. Authenticated users landing here bounce to `/dashboard`.
- **No standalone `/signup` route exists** (see A02).

### Dashboard — student

#### P03 — `/dashboard` · `app/(dashboard)/dashboard/page.tsx`
- **Roles:** any authenticated · **Purpose:** role-branched home: gradient hero (time-based "Good morning/afternoon/evening" + `Welcome back, {fname}!` + "Here's an overview of your activity and performance.") + **student-only** `PreAssessmentBanner` + role body `StudentDashboard` / `AdminDashboard` / `TeacherDashboard`.
- **Data:** student → `GET /api/dashboard/stats`, `/api/dashboard/student/{topic-performance, subject-performance, performance-trends, strengths-weaknesses, repeated-questions}` (fetched by `use-student-dashboard`; strengths-weaknesses is fetched but not rendered; `difficulty-breakdown`/`time-analysis`/`skill-rating` exist in `lib/api/dashboard.ts` but P03 never calls them), `/api/test/pre-assessment/status`; teacher → `GET /api/dashboard/stats` + `/api/teacher/teaching/{top-students, weakness-summary, question-coverage}` (limit 10 each — ⚠ `/api/dashboard/teacher/{teacherId}` is `TEACHER_ANALYTICS`, **unused by P03**); admin → `GET /api/dashboard/stats` **only** (the `/api/dashboard/analytics/{teacher-student-ratio, top-students-by-location, least-questions, subjects-needing-attention}` endpoints belong to P24's `AnalyticsDashboard`, not P03).
- **Tables:** none (KPI cards/charts). **Dialogs:** none. **Actions:** none on the admin body — KPI cards and the Users-by-Location widget are **not links** (no `onClick`/`href` anywhere in `statistics-card.tsx`/`admin-dashboard.tsx`); the only P03 body with a navigation action is the student body's push to `/dashboard/tests/pending`.

#### P04 — `/dashboard/enrollments` · `…/dashboard/enrollments/page.tsx`
- **Roles:** student · **Purpose:** list of the student's enrollments scoped Course → Subject → Topic (empty level = the row covers everything below it).
- **Data:** `GET /api/enrollment` (whole list; count rendered as card title "Enrollments (n)" — **no pagination**, **no `/api/user/location` call**).
- **Table columns:** # · Course (purple badge) · Subject (blue badge, `-` if course-wide) · Topic (green badge, `-` if subject-wide) · trash-icon action cell (no header label).
- **Dialogs:** D07 `EnrollDialog`, D13 `ConfirmDialog` (title **"Unenroll"**, "Are you sure you want to unenroll from {course}?"). **Actions:** header **"+ Enroll"** → D07; per-row trash → D13 → `DELETE /api/enrollment/{id}` → toast "Unenrolled successfully" (failure toast "Failed to unenroll"). Empty state: "No enrollments yet" / "Click "Enroll" to get started". *(Columns + non-paginated shape corrected after source verification; no "/learn" flow exists.)*

#### P05 — `/dashboard/my-tests` · `…/dashboard/my-tests/page.tsx`
- **Roles:** student · **Purpose:** personal test history + KPIs; launching new ad-hoc tests (gated by pre-assessment).
- **Data:** `GET /api/test/history`, `GET /api/test/pre-assessment/status`; mutations `POST /api/test/abandon/{id}`.
- **Table columns:** # · Test ID · Status · Score · Correct · Date · Actions.
- **KPI cards:** Total Tests · Completed · Average Score (⚠ Total shows completedCount — A10).
- **Dialogs:** D10 `StartTestDialog`, D13 `ConfirmDialog` ("Abandon Test?"). **Actions:** Start Test (disabled while pre-assessment pending → `/live-test?id=` / `/tb-live-test?id=`), Resume, Abandon, View → `/test-result?id=`, pagination.

#### P06 — `/dashboard/tests/pending` ("Available Tests") · `…/dashboard/tests/pending/page.tsx`
- **Roles:** student · **Purpose:** predefined tests available/upcoming/expired for this student.
- **Data:** `GET /api/test/predefined/pending`, `GET /api/test/pre-assessment/status`; mutation `POST /api/test/predefined/{id}/start`.
- **Layout:** card grid (title, description, duration, questions, difficulty, schedule window, status badge, optional "Pre-Assessment" badge) — no table. Status stat-cards double as filters (Available/Upcoming/Expired) + `CustomSelect` filter.
- **Actions:** Start Test → `/live-test?id=`; count "{n} test(s) found". **States:** spinner; error card; empty card ("No tests available yet").

### Dashboard — teacher

#### P07 — `/dashboard/teacher-enrollments` · `…/dashboard/teacher-enrollments/page.tsx`
- **Roles:** admin+teacher · **Purpose:** courses/subjects the current teacher is enrolled to teach — grouped **one row per course** with a search box; no pagination, no drill-down.
- **Data:** `GET /api/teacher/teacher-enrollment?teacher_id={self}&limit=100` **only** (⚠ `/api/user/location` is not used; rows are client-grouped by course). ⚠ For admin the data hook yields a null URL → renders the empty state *No enrollments yet* (A07 — not a crash).
- **Table columns:** `#` · Course · Subjects · unlabeled trash cell. **Dialogs:** D08 (header **Enroll**), D13 (row trash → *Unenroll from Course*, loops `assignmentIds` → `DELETE /api/teacher/unenroll/{id}`).
- **Actions:** search ("Search courses or subjects..."; matches course or subject names); unenroll with confirm + toasts.

#### P08 — `/dashboard/students` · `…/dashboard/students/page.tsx`
- **Roles:** admin+teacher · **Purpose:** *My Students* — students in the current teacher's courses/subjects (not the global directory).
- **Data:** `GET /api/teacher/teaching/students?page&limit&course_id&subject_id`; filter lookups: teaching courses/subjects for teacher, all (`?limit=100`) for admin.
- **Table columns:** # · Name (**plain text — no detail link**) · Email · Course (badge) · Subject (badge / *All Subjects* when `subject_id` null).
- **Dialogs:** **none** — D09 is not opened here. **Actions:** `StudentFilters` (course → subject cascade, Clear) + DataTable pagination. ⚠ The student-detail page stays admin-only (A09); teachers have no drill-down.

#### P09 — `/dashboard/questions` · `…/dashboard/questions/page.tsx`
- **Roles:** admin+teacher · **Purpose:** question-bank management (MCQ/descriptive).
- **Data:** `GET /api/question/filter?page&limit&course_id&subject_id&topic_id&difficulty`; lookups `GET /api/question/active-filters`; mutations `POST/PUT/DELETE /api/question[/{id}]`.
- **Table columns:** # · Type · Question · Difficulty · Actions.
- **Dialogs:** D05 `AddQuestionDialog`, D06 `EditQuestionDialog`, D13 (delete w/ undo — ⚠ undo copy wired to "topic" type, A11); inline `QuestionFilters` bar (course/subject/topic/difficulty — change resets page).
- **Actions:** Add Question, edit/delete, pagination.

#### P10 — `/dashboard/questions/import` · `…/dashboard/questions/import/page.tsx`
- **Roles:** admin+teacher · **Purpose:**4-step Excel bulk-import wizard (`upload → confirm_missing → preview → result`).
- **Data:** `GET /api/content/{course,subject,topic}?limit=10000` (name→UUID resolution); `GET /api/question/import-template`; mutations `POST /api/content/bulk-hierarchy`, `POST /api/question/bulk` (batches of500).
- **Preview table columns:** # · Course · Subject · Topic · Question · Difficulty · Status · (remove).
- **Forms:** F04 (this wizard). **States:** Missing-Entities card (Create/Cancel), result card (Total/Imported/Failed + expandable error list), progress bar.

### Dashboard — tests (admin+teacher)

#### P11 — `/dashboard/tests` · `…/dashboard/tests/page.tsx`
- **Roles:** admin+teacher · **Purpose:** all test attempts, filterable, per-student drill-down.
- **Data:** admin `GET /api/test/all?page&limit&status&subjectId&studentId&dateFrom&dateTo` (camelCase params — hook `use-all-tests.ts`); teacher `GET /api/teacher/teaching/tests?page&limit&status&course_id&subject_id&student_id` (⚠ no date params — the From/To pickers render for teachers but are **not sent**); student lists: teacher `GET /api/teacher/teaching/students?limit=100`, admin `GET /api/user/role/student?limit=100` (⚠ `/api/student/list` is **not used**); filter lookups `GET /api/content/{course,subject}?limit=100` (admin) or `GET /api/teacher/teaching/courses-and-subjects` (teacher).
- **Table columns:** # · Test ID · Student · Status · Score · Correct · Date · Actions. **Table title:** teacher *Teaching Tests* / admin *Tests*.
- ⚠ **Admin sees the Actions (View) column only while a student filter is selected** (`...(isTeacher || hasStudentSelected ? [...] : [])`); without one, no Actions column renders for admins. *(verified in source)*
- **Dialogs/forms:** filter bar only (status, date range, student, course, subject + Clear). Admin sees status/date/student; teacher additionally sees course/subject (`showCourseFilter={isTeacher}`).
- **Actions:** the **Actions column** renders only when the user is a teacher or a specific student is selected; within it only **completed** rows get **View** → `/test-result?id={attempt}&studentId={student}`; in-progress/pending rows leave an **empty cell** (⚠ nothing links to P15 — A16); DataTable pagination.

#### P12 — `/dashboard/tests/create` · `…/dashboard/tests/create/page.tsx`
- **Roles:** admin+teacher (prefix) · **Purpose:**5-step wizard to author a predefined test: Basic Info → Configuration → Scope → Schedule → Questions. State persisted to `localStorage["create-predefined-test-form"]`.
- **Data:** admin `GET /api/content/{course,subject,topic}?limit=100`; teacher `GET /api/teacher/teaching/courses-and-subjects` (+ client topic filter); mutation `POST /api/test/predefined`. *(verified: the wizard fetches **no** student list — the "Specific Students" toggle only says selection happens after creating the test; `selectedStudentIds` is only ever reset to `[]`)*
- **Forms:** F03 (full field table). **Dialogs:** D13 ("Clear Form").
- **Actions:** step gating (Next/Create disabled until valid), Create → redirect P14, Clear.

#### P13 — `/dashboard/tests/manage` · `…/dashboard/tests/manage/page.tsx`
- **Roles:** admin+teacher · **Purpose:** predefined-test roster with activate/deactivate.
- **Data:** `GET /api/test/predefined`; mutations `POST /api/test/predefined/{id}/{activate|deactivate}`.
- **Table columns (hand-rolled, ⚠ A12):** # · Title · Status · Duration · Questions · Created · Actions.
- **Actions:** "Create Test" → P12; row → P14; Play (activate, drafts) / Pause (deactivate, active) → toast + **full page reload** (`window.location.reload()`); "Showing X to Y of Z" pagination; empty cell "No tests found. Create your first test!" ⚠ Hand-rolled table, not the shared DataTable (A12).

#### P14 — `/dashboard/tests/[id]` · `…/dashboard/tests/[id]/page.tsx`
- **Roles:** admin+teacher (prefix) · **Purpose:** predefined-test detail — configuration, schedule, content scope, fixed questions, student roster, share link.
- **Data:** `GET /api/test/predefined/{id}`; lookups `GET /api/question/filter?limit=1000`, `/api/content/{course,subject,topic}?limit=1000`, `GET /api/user/{id}` per student; mutations activate/deactivate, `PUT /api/test/predefined/{id}` (`fixed_question_ids`, `student_ids`).
- **Cards:** Test Configuration (Duration, Questions, Difficulty, Max Attempts, Fixed Questions, Specific Students) · Schedule (Scheduled, Start/End, Timezone) · Content Selection tree · Fixed Questions preview (5 + "N more") · Student Assignment preview · Test Link.
- **Dialogs:** D11 `QuestionSelectorDialog`, D12 `StudentSelectorDialog`.
- **Actions:** back → P13; Copy link (format `{origin}/test/join/{slug}_{start|noschedule}_{end|noschedule}_{token}`); Activate (disabled until fixed questions chosen if `use_fixed_questions`) / Deactivate; warning "You must add questions before activating."

#### P15 — `/dashboard/tests/student-results` · `…/dashboard/tests/student-results/page.tsx`
- **Roles:** admin+teacher (prefix) · **Purpose:** one student's results, driven by `?studentId=` (+`&name=`).
- **Data:** `GET /api/test/student/{id}/results` (paginated).
- **Table columns ("Test History"):** # · Test ID · Status · Score · Correct · Date · Actions.
- **Actions:** back → P11; row **View** → `/test-result?id={attempt}` **only** (⚠ omits `&studentId=`). **States:** "No student selected" card, spinner, "No results found". ⚠ **Orphaned (A16):** no nav entry, menu item, or frontend link references this route — direct URL with `?studentId=` only.

### Dashboard — users (admin)

#### P16 — `/dashboard/users` · `…/dashboard/users/page.tsx`
- **Roles:** admin · **Purpose:** all users (any role) with location assignment.
- **Data:** `GET /api/user`; mutation `PATCH /api/user/{id}/location`.
- **Table columns:** # · Name · Email · Role · Mobile · Location · Actions. **Dialogs:** D09.

#### P17 — `/dashboard/users/teachers` · `…/dashboard/users/teachers/page.tsx`
- **Roles:** admin · **Purpose:** teacher roster. **Data:** `GET /api/user/role/teacher`.
- **Table columns:** # · Name · Email · Mobile · Role (hard-coded "Teacher") · Location · Actions. **Dialogs:** D09.

#### P18 — `/dashboard/users/students` · `…/dashboard/users/students/page.tsx`
- **Roles:** admin · **Purpose:** student roster → detail. **Data:** `GET /api/user/role/student`.
- **Table columns:** # · Name · Email · Mobile · Role (hard-coded "Student") · Location · Actions. **Dialogs:** D09.

#### P19 — `/dashboard/users/students/[studentId]` · `…/users/students/[studentId]/page.tsx`
- **Roles:** admin (guard prefix; API itself allows admin+teacher — A09) · **Purpose:** one student's profile + performance.
- **Data:** `GET /api/dashboard/admin/student/{id}/details` (payload: student, enrollments, teachers, testHistory, performance).
- **Table columns (Test History):** Test Name · Date · Status · Score · Correct · Incorrect · Total · Actions.
- **Actions:** back; KPI cards; row "View Results" → `/test-result?id={testId}&studentId=`. **States:** "Loading student details…", error "…You might not have permission."

### Dashboard — content (admin)

#### P20 — `/dashboard/courses` · `…/dashboard/courses/page.tsx`
- **Roles:** admin · **Data:** `GET /api/content/course?search`; mutations `POST/PUT/DELETE /api/content/course[/{id}]`.
- **Table columns:** # · Name · Description · Actions. **Dialogs:** D01, D13 (delete-with-undo).
- **Actions:** debounced search, Add Course, edit/delete, pagination.

#### P21 — `/dashboard/subjects` · `…/dashboard/subjects/page.tsx`
- **Roles:** admin · **Data:** `GET /api/content/subject?search`, `GET /api/content/course` (filter dropdown).
- **Table columns:** # · Name · Description · Course (purple badge) · Actions. **Dialogs:** D02, D13 (title "Delete Subject", `type: "subject"`). **Controls:** debounced search ("Search subjects...") + "Filter by Course" SearchableSelect. *(columns corrected after source verification — there is no "Class" column.)*

#### P22 — `/dashboard/topics` · `…/dashboard/topics/page.tsx`
- **Roles:** admin · **Data:** `GET /api/content/topic?search`, course + subject filter lookups.
- **Table columns:** # · Name · Description · Subject (blue badge) · Course (green badge) · Actions. **Dialogs:** D03, D13 (title "Delete Topic", `type: "topic"`). **Controls:** debounced search ("Search topics...") + "Filter by Course" (changing it resets subject) + "Filter by Subject". *(columns corrected after source verification — there is no "Class" column; order is Subject then Course.)*

#### P23 — `/dashboard/locations` · `…/dashboard/locations/page.tsx`
- **Roles:** admin · **Purpose:** branch CRUD; central location protected from edit/delete.
- **Data:** `GET /api/user/location`; mutations `POST/PUT/DELETE /api/user/location[/{id}]`.
- **Table columns:** # · Address · City · State · Pincode · Country · Type · Actions. **Dialogs:** D04, D13 (undo).

#### P24 — `/dashboard/analytics` · `…/dashboard/analytics/page.tsx`
- **Roles:** admin · **Purpose:** thin wrapper "Analytics Dashboard" + `<AnalyticsDashboard/>`.
- **Data:** `GET /api/dashboard/analytics/{teacher-student-ratio, top-students-by-location, least-questions, subjects-needing-attention}` + `GET /api/dashboard/location/{id}/performance` (only while a location filter is set). *(corrected after source verification: P24 does **not** call `GET /api/dashboard/stats`.)*
- **Tables:** none (charts/KPI). Filters (date/class/location) live inside the component.

### Test-taking (exam runner)

#### P25 — `/join/[token]` · `app/(test)/join/[token]/page.tsx`
- **Roles:** `(test)` group guard · **Purpose:** legacy/simpler join-by-token page; scrubs URL to `/join/joined` after join.
- **Data:** `GET /api/test/predefined/join/{token}`; `POST /api/test/predefined/{id}/start`. Minimal UI (no logo/status badge) and its Start button is **not** gated by active status/schedule (P26 gates both); scrubs to `/join/joined`. ⚠ Nothing generates `/join/…` links today — A01.

#### P26 — `/test/join/[token]` · `app/test/join/[token]/page.tsx` — **canonical share-link target**
- **Roles:** own auth redirect (unauthenticated → `/signin` with return) · **Purpose:** join a predefined test by share token; scrubs URL to `/test/join/joined`.
- **Data:** `GET /api/test/predefined/join/{token}`; `POST /api/test/predefined/{id}/start`.
- **UI:** `AppLogo` header, "Joining as {user}" line, status badge (Active/Upcoming/Scheduled/Expired), schedule gating (Start disabled before `start_time`, blocked after `end_time`).
- **Actions:** Start → `/live-test?id={attemptId}`; invalid/expired token → error state with back link.

#### P27 — `/live-test` · `app/(test)/live-test/page.tsx`
- **Roles:** student · **Purpose:** standard timed exam runner (`?id=` attempt).
- **Data:** `GET /api/test/{id}`; mutations `POST /api/test/{id}/submit`, `POST /api/test/abandon/{id}`; socket via `GET /api/user/socket-ticket` → `SOCKET_URL`.
- **UI:** header (logo tile + **connection dot** green/red · mono `test_id` badge · theme toggle · countdown pill — red ≤60s · **Cancel** — *hidden for pre-assessment tests*) · MCQ choices A–D only (**no** descriptive textarea / mark-for-review controls exist) · `test_id` watermark (8% opacity) · palette (desktop sidebar w/ progress bar + legend, mobile collapsible) · Previous / **Clear** (local only — A15) / **Skip** / Next · submit gate `answered ≥ min(35, ⌈95%·total⌉)` + "Submit Test?" modal · "Cancel Test?" modal → abandon API · in-page "Test Completed!" results screen · `localStorage test_state_{id}` recovery + `beforeunload` guard.
- **Actions:** palette/next/prev navigation; auto-save per choice click (socket `answer`); Submit (socket `submit_test`) → in-page results → "View Test History" (formal review reached via Ch8 **View** → `/test-result?id=`); Cancel → `POST /api/test/abandon/{id}`; server timeout auto-submit (`reason:"timeout"`). **States:** `(test)/loading.tsx`, `(test)/error.tsx`, room error card ("already completed" special-case).

#### P28 — `/tb-live-test` · `app/(test)/tb-live-test/page.tsx`
- **Roles:** student · **Purpose:** time-based test variant (`?id=`), started from "time_based" history entries.
- **Data:** `POST /api/test/time-based/start`, `GET /api/test/{id}`, `POST /api/test/{id}/submit`, `GET /api/user/socket-ticket`.
- Same interaction shape as P27 with time-based timing rules (`tb:*` socket events).

#### P29 — `/test-result` · `app/(test)/test-result/page.tsx`
- **Roles:** student; admin/teacher with `?studentId=` · **Purpose:** score summary of a submitted attempt.
- **Data:** `GET /api/test/result/{id}/` (score, correct/incorrect, per-question review); with studentId also `GET /api/dashboard/admin/student/{id}/details`.
- **Content:** header (back → `/dashboard/my-tests` student / `/dashboard/tests` staff · mono `test_id` · **Download PDF/Excel** — client-side, header on `sm+` and duplicated in the mobile bottom bar · `x.x%` score badge green/amber/red) · `lg+` left navigator: `{correct}/{totalQuestions}` + progress bar, **5-col tiles** — correct emerald / incorrect red / skipped amber / unanswered muted, current ringed — plus legend · per-question review: status badge (Correct / Skipped / Incorrect), graded choices (emerald = correct answer, red = your wrong pick, plain = neither), **Explanation** / **Video Explanation** cards, "Time taken: n seconds" · `test_id` watermark · Previous/Next bar.
- **Actions:** sidebar/bottom-nav question navigation; PDF/Excel export; back. Staff with `?studentId=` fetch the student's result **list** and select this attempt (`Test result not found` if absent); without `studentId` the plain result fetch runs.

---

##4. Dialogs (D01–D13)

> No zod/yup/react-hook-form anywhere in the frontend — plain controlled state + HTML `required`/`min`/`max`/`maxLength` or submit-button gating. Errors show as a banner (`text-destructive`) and/or `toast.error`; almost never per-field.

| ID | Component | Opened from | Purpose |
|---|---|---|---|
| D01 | AddCourseDialog | P20 | create/edit course |
| D02 | AddSubjectDialog | P21 | create/edit subject |
| D03 | AddTopicDialog | P22 | create/edit topic |
| D04 | AddLocationDialog | P23 | create/edit location |
| D05 | AddQuestionDialog | P09 | create MCQ question |
| D06 | EditQuestionDialog | P09 | edit answer/difficulty/explanation (text read-only) |
| D07 | EnrollDialog | P04 | student enrolls course/subject/topic rows (≤50) |
| D08 | TeacherEnrollDialog | P07 | teacher self-enrolls course + subjects |
| D09 | AssignLocationDialog | P16, P17, P18 (**not** P08) | assign/change/remove user's location |
| D10 | StartTestDialog | P05 | configure + start ad-hoc standard/time-based test |
| D11 | QuestionSelectorDialog | P14 | pick fixed questions with per-difficulty quotas |
| D12 | StudentSelectorDialog | P14 | multi-select students for a test |
| D13 | ConfirmDialog | P04,P05,P07,P09,P12,P20,P21,P22,P23 (+P10 cancel) | generic confirm/destructive prompt (no fields) |

### Field tables

**D01 AddCourseDialog** — submit `POST /api/content/course` (edit: `PUT …/{id}`) → toast + refetch.
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| name | Name * | text | ✓ | required, trim; placeholder "e.g., Computer Science" |
| description | Description | textarea(3) | — | ≤1024 chars + counter |

**D02 AddSubjectDialog** — submit `POST /api/content/subject` (edit: `PUT`).
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| courseId | Course * | CustomSelect | ✓ | all courses; disabled until loaded; placeholder "Select course"/"Loading..." |
| name | Name * | text | ✓ | trim; placeholder "e.g., Data Structures" |
| description | Description | textarea(3) | — | ≤1024 chars + counter; placeholder "Optional description" |

**D03 AddTopicDialog** — submit `POST /api/content/topic` (edit: `PUT`).
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| subjectId | Subject * | CustomSelect | ✓ | all subjects |
| name | Name * | text | ✓ | trim; placeholder "e.g., Binary Trees" |
| description | Description | textarea(3) | — | ≤1024 + counter |

**D04 AddLocationDialog** — submit `POST /api/user/location` (edit: `PUT …/{id}`).
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| address_line_1 | Address Line 1 * | text | ✓ | required; "e.g., 123 Main Street" |
| address_line_2 | Address Line 2 | text | — | "e.g., Suite 100" |
| landmark | Landmark | text | — | "e.g., Near City Mall" |
| city | City * | text | ✓ | "e.g., Mumbai" |
| pincode | Pincode * | text | ✓ | required (no client pattern) |
| state | State * | text | ✓ | "e.g., Maharashtra" |
| country | Country * | text | ✓ | default **India** |

**D05 AddQuestionDialog** — submit `POST /api/question` → toast + refetch (MCQ only; `type` hard-coded `"mcq"`).
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| courseId | Course * | CustomSelect | ✓ | admin: all; teacher: teaching courses only; resets subject+topic |
| subjectId | Subject * | CustomSelect | ✓ | cascaded from course |
| topicId | Topic * | CustomSelect | ✓ | cascaded from subject |
| difficulty | Difficulty | CustomSelect | — | beginner/normal/mid/hard/expert; default normal |
| question | Question * | textarea(3) | ✓ | ≤1000 + counter |
| choices[2–5] | Choices * | radio + text | ✓ | radio = correct (disabled while empty); blanks stripped |
| explanation | Explanation | textarea(2) | — | ≤2000 + counter |
| videoUrl | Video URL | `type=url` | — | "https://youtube.com/watch?v=..." |

Save disabled unless course+subject+topic+question+correctAnswer.

**D06 EditQuestionDialog** — submit `PUT /api/question/{id}` (question text read-only; re-sends type/topic/subject/course/addedBy).
Same fields as D05 minus course/subject/topic (read-only display), plus read-only Question. Update disabled while `!correctAnswer`.

**D07 EnrollDialog** — submit `POST /api/enrollment` `{enrollments:[{course_id, subject_id?, topic_id?}]}` → "Enrolled in N" + "N skipped" toasts.
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| rows ×≤50 | Enrollment N | repeatable card | ≥1 course | Add Another / remove |
| courseId | Course * | Select | ✓ | changing resets subject+topic |
| subjectId | Subject | Select | — | sentinel `__all__` = "All Subjects" (omitted from payload) |
| topicId | Topic | Select | — | sentinel `__all__` = "All Topics" |

**D08 TeacherEnrollDialog** — submit `POST /api/teacher/assign/bulk-subjects` `{teacher_id, course_id, subject_ids?}`.
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| selectedCourseId | Course * | Select | ✓ | all courses; guard "Please select a course" |
| selectedSubjectIds | Subjects | checkbox list + Select All | — | filtered to course; empty → all subjects |

**D09 AssignLocationDialog** — submit `PATCH /api/user/{id}/location` `{location_id}` (remove button sends `null`).
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| currentLocation | (info card + ✕) | display | — | ✕ removes location immediately |
| selectedLocationId | Change/Select Location | Select | ✓ (assign) | non-central locations only; label "address, city, state"; default = current |

**D10 StartTestDialog** — submit standard `POST /api/test/start` `{duration_minutes, question_limit, selections, adaptive:true}`; time-based `POST /api/test/time-based/start` `{duration_minutes, selections}` → parent navigates P27/P28.
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| testMode | Test Type | toggle buttons | ✓ | `standard` (default) \| `time_based` |
| duration | Duration (min) * | select (standard) / number (tb) | ✓ | standard:15/20/25/30/40/45 (each with min/max question bounds); tb: ≥1, default30 |
| questionLimit | Questions * (standard) | text numeric | ✓ | default45; strips non-digits; clamps to duration bounds; helper "Min: x \| Max: y" |
| selections[≤3] | Test Selections * | repeatable rows | ≥1 course | Course* (enrolled only) + Subjects/Topics checkbox groups (`/api/enrollment/{subjects,topics}`); single-selects collapse to scalar ids |

Gating: submit disabled unless course selected && duration >0.

**D11 QuestionSelectorDialog** — no API in dialog → `onSelect(ids)` → parent `PUT /api/test/predefined/{id}` `{fixed_question_ids}`.
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| search | 🔍 | text | — | filters question text |
| filterDifficulty | difficulty | Select | — | all/beginner/normal/mid/hard/expert |
| filterCourse / filterFilterSubject | course/subject | Select | — | course change refetches via **GET** `/api/question/filter`; over-quota toast `Cannot select more than N X questions` |
| question checkboxes | list | checkbox list | — | total cap = `questionLimit`; per-difficulty caps from `difficultyRatio`; live "x/required" counters; at-limit rows disabled |

Quota breach → `toast.error("Cannot select more than N X questions")`.

**D12 StudentSelectorDialog** — no API in dialog → parent `PUT …/{id}` `{student_ids}`.
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| search | 🔍 | text | — | filters fname/lname/email |
| student checkboxes | list | checkbox list | — | `GET /api/user/role/student?page=1&limit=100` (**first100 only**); Select All acts on the **filtered list**; Deselect / Clear; `Select N Students` enabled at 0 → empty roster saves |

**D13 ConfirmDialog** — no fields; props `title/description/confirmText(default "Delete")/cancelText/variant(destructive)/isLoading`. Parent performs the action: DELETE course/subject/topic/location/question, `DELETE /api/enrollment/{id}` (unenroll), `DELETE /api/teacher/unenroll/{id}`, `POST /api/test/abandon/{id}` (P05), or client-only "Clear Form" (P12).

---

##5. Standalone forms & wizards (F01–F04)

### F01 — SignInForm (`components/auth/sign-in-form.tsx`, mode of P02)
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| email | Email | `type=email` | ✓ | placeholder "name@example.com" |
| password | Password | `type=password` + eye toggle | ✓ | "Forgot password?" button exists but has **no handler** (A14) |

- **Submit:** `POST /api/user/login` → auth context (cookies set server-side) → `sessionStorage.redirectAfterLogin` or `/dashboard`.
- **Errors:** banner with server `message` (generic "Invalid credentials" by design).

### F02 — SignUpForm (`components/auth/sign-up-form.tsx`, mode of P02) — **the only user-creation form in the app**
| Field | Label | Type | Required | Constraints |
|---|---|---|---|---|
| fname | First Name | text | ✓ | "John" |
| lname | Last Name | text | ✓ | "Doe" |
| role | I am a | CustomSelect | ✓ | **Student / Teacher only** (default Student; API also accepts admin) |
| email | Email | `type=email` | ✓ | |
| mobileNumber | Mobile Number | `type=tel` | ✓ | digits only, max10, counter "x/10 digits" |
| password | Password | `type=password` + toggle | ✓ | `PasswordStrength` meter (display only); server:12–100 chars + zxcvbn score ≥3 |
| confirmPassword | Confirm Password | `type=password` | ✓ | client check must match |

- **Submit:** `POST /api/user/signup` (confirm stripped) → server sets both session cookies (auto-login) → `window.location.href = "/signin"` → RouteGuard bounces authenticated user to `/dashboard`.
- **Errors:** banner; explicit client "Passwords do not match"; server validation messages (policy messages shown, type internals hidden in production).

### F03 — Create Predefined Test wizard (P12) —5-step stepper, `localStorage` persistence
| Field | Label | Step | Required | Constraints / default |
|---|---|---|---|---|
| title | Title * | 1 | ✓ (gate) | "e.g., Midterm Exam - Direct Tax Laws" |
| description | Description | 1 | — | textarea(4) |
| duration | Duration (min) * | 2 | ✓ | `min1 max300`, default **30** |
| questionLimit | Question Limit * | 2 | ✓ | `min1 max200`, default **30** |
| difficulty | Difficulty * | 2 | ✓ | beginner/normal/mid/hard/expert/**mixed**, default normal |
| maxAttempts | Max Attempts | 2 | — | `min1 max10`, default **1** |
| difficultyRatio[5] | Difficulty Ratio (%) | 2 | only if mixed | each `0–100`, clamped so total ≤100 |
| selectedCourseIds | Courses * | 3 | ✓ ≥1 (gate) | checkbox grid + Select All; teacher = teaching courses |
| selectedSubjectIds | Subjects (optional) | 3 | — | filtered by courses; Select All/Clear |
| selectedTopicIds | Topics (optional) | 3 | — | shown only when subjects chosen |
| isScheduled | Scheduled Test | 4 | — | toggle, default Off |
| startTime / endTime | Start/End * | 4 | if scheduled | `DateTimePicker`; End min = start + duration +1min; ISO payload |
| timezone | Timezone | 4 | — | default `"UTC"` |
| useFixedQuestions | Fixed Questions | 5 | — | toggle; selection deferred to P14 |
| useSpecificStudents | Specific Students | 5 | — | toggle; roster chosen post-create (D12) |

- **Submit:** `POST /api/test/predefined` → clear storage + toast → redirect P14. **Errors:** toast only; step gates disable Next/Create.

### F04 — Excel Import wizard (P10) —4 steps
| Element | Details |
|---|---|
| Template | `GET /api/question/import-template` → downloads `question_import_template.xlsx` |
| File input | drop zone / browse, `accept=".xlsx,.xls"`, parsed client-side (SheetJS) |
| **Excel columns** | Course Name · Subject Name · Topic Name · Question · Option1–5 · Correct Answer · Difficulty · Explanation · Video URL · Question Added By |
| Row validation | Question required; hierarchy resolved by normalized name; invalid difficulty → `normal`; ≥2 options; correctAnswer must equal an option; rows with embedded **images rejected** |
| Missing entities | "Create Missing Entities" (admin) → `POST /api/content/bulk-hierarchy` → refetch + re-resolve |
| Preview table | # · Course · Subject · Topic · Question · Difficulty · Status (Ready/Error badge + tooltip) · remove-row |
| Import | `POST /api/question/bulk` batches of500 `{questions:[…]}` with progress bar |
| Result | Total Rows / Imported / Failed + expandable "Detailed Import Errors" (`Row n: reason`); actions Import More / View Questions → P09 |

---

##6. API surface (all under `/api`)

> Envelope: `{ statusCode, success, message, data }`. Auth column = gateway rule (`config/routes.ts`): `public`, `auth` (any role), `admin`, `admin+teacher`, `student`, etc. Validation = Zod schema summary (server-side; production returns grouped field messages, hides type internals).

### user — prefix `/user`
| Method | Path | Auth | Validation / notes |
|---|---|---|---|
| POST | `/signup` | public (**RL2**3/min) | fname1–50, lname1–50, role enum admin\|student\|teacher, email regex, mobileNumber10–15, password12–100 + zxcvbn≥3 → sets cookies, `201 {user}` |
| POST | `/login` | public (**RL1**5/min) | email regex, password ≥1 → sets cookies, `200 {user}`; wrong →401 generic |
| POST | `/refresh` | public | reads `refresh_token` cookie; fail-closed rotate → sets both cookies |
| POST | `/logout` | public | blocklists access `bl:{jti}` + deletes refresh `rt:{id}`; clears cookies |
| POST | `/logout-all` | public | `INCR rev:{userId}` (fail-closed500 if Redis down); clears cookies |
| POST | `/socket-ticket` | auth | returns `data:{ticket}` — JWT `typ:"socket"`,5-min, no cookies changed |
| GET | `/me` | auth | current user |
| GET | `/` | admin | page ≥1, limit1–100 |
| GET | `/role/:role` | admin | role enum + page/limit |
| GET | `/:id` | admin | id uuid |
| PATCH | `/:id/location` | admin | `location_id` uuid **nullable** |

### location — prefix `/user/location`
| Method | Path | Auth | Validation |
|---|---|---|---|
| POST | `/` | admin | address_line_1 1–255 ✓, address_line_2 ≤255, landmark ≤255, city1–100 ✓, pincode1–10 ✓, state1–100 ✓, country default "India" |
| GET | `/` · `/:id` | admin | page/limit; id uuid |
| PUT | `/:id` | admin | all optional (same lengths) |
| DELETE | `/:id` | admin | id uuid |

### content — course `/content/course`, subject `/content/subject`, topic `/content/topic`
| Method | Path | Auth | Validation |
|---|---|---|---|
| POST | `/content/course` | **admin** | name1–500 ✓, description ≤1024 |
| GET | `/content/course` | admin+teacher+student | page ≥1, limit1–**10000**, search |
| GET | `/content/course/:id` | all roles | id uuid |
| PUT/DELETE | `/content/course/:id` | **admin** | id uuid; body optional |
| POST | `/content/subject` | **admin** | name1–500 ✓, description ≤1024, **course_id uuid ✓** |
| GET | `/content/subject` · `/course/:courseId` · `/:id` | all roles | page/limit ≤10000/search |
| PUT/DELETE | `/content/subject/:id` | **admin** | |
| POST | `/content/topic` | **admin** | name1–500 ✓, description ≤1024, **subject_id uuid ✓** |
| GET | `/content/topic` · `/subject/:subjectId` · `/:id` | all roles | + optional course_id |
| PUT/DELETE | `/content/topic/:id` | **admin** | |
| POST | `/content/bulk-hierarchy` | **admin** | `courses[]`: name ✓ + nested `subjects[]` + nested `topics[]` (string or `{name,description}`) |

### question — prefix `/question` (questionImport nested inside)
| Method | Path | Auth | Validation |
|---|---|---|---|
| GET | `/import-template` | admin+teacher | — |
| POST | `/bulk` | admin+teacher | `questions`1–10000; each: type literal `mcq`, question ≥1, choices2–5, correctAnswer ∈ choices, difficulty enum (case-insensitive) opt, topic/subject/course uuid ✓ |
| POST | `/` | admin+teacher | type mcq\|descriptive; mcq →2–5 choices + correctAnswer ∈ choices; descriptive → no choices; difficulty default normal; topic/subject/course uuid ✓ |
| GET | `/` | all roles | page, limit ≤100 |
| GET | `/active-filters` · `/search` · `/filter` · `/topic/:topicId` · `/:id` | all roles | filter: course/subject/topic uuid opt, difficulty enum, limit ≤10000 |
| PUT/DELETE | `/:id` | admin+teacher | mcq refinement on PUT |

### student — prefix `/student`
| Method | Path | Auth | Validation |
|---|---|---|---|
| GET | `/list` | admin | **no Zod** (raw page/limit/course_id/…) |
| GET | `/:studentId/enrollments` | admin | **no Zod** |

### enrollment — prefix `/enrollment`
| Method | Path | Auth | Validation |
|---|---|---|---|
| POST | `/` | student | `enrollments`1–50 of `{course_id ✓, subject_id? uuid, topic_id? uuid}` |
| GET | `/` · `/courses` · `/subjects` · `/topics` · `/student/:studentId` · `/:id` | student (⚠ see A05) | subjects: course_id ✓; topics: subject_id plain string |
| DELETE | `/:id` | student | id uuid (service scopes to own) |

### testSession — prefix `/test`
| Method | Path | Auth | Validation / notes |
|---|---|---|---|
| POST | `/start` | student | duration ∈ {15,20,25,30,40,45}; question_limit cross-checked (15→15-30, 20→20-40, 25→25-50, 30→30-60, 40→30-80, 45→40-120); selections1–200; adaptive default true |
| POST | `/submit/:testId` · `/abandon/:testId` | student | testId ≥1 |
| GET | `/history` | student | page/limit |
| GET | `/student/:studentId` · `/results` · `/summary` · `/performance` | student+admin+teacher | service enforces ownership ("own results only") |
| GET | `/detail/:testId` | admin+teacher | service checks requester |
| GET | `/all` | admin | status enum pending\|in_progress\|completed\|abandoned, studentId/subjectId uuid, dateFrom/To |
| GET | `/result/:testId` | student | own only |
| GET | `/:testId` (catch-all, last) | student | ownership-checked |

### predefinedTest — prefix `/test/predefined`
| Method | Path | Auth | Validation / notes |
|---|---|---|---|
| GET | `/pending` | student | declared before generic rules |
| GET | `/join/:token` | student | token ≥1 |
| POST | `/` | admin+teacher+**student** (⚠ A04) | title1–255 ✓, description ≤1000, is_scheduled, start/end (refine: scheduled ⇒ both & start<end), timezone default UTC, duration15–120, question_limit1–200, difficulty + mixed, difficulty_ratio sum=100\|0, use_fixed/use_specific bools, max_attempts1–10, **course_ids ≥1 ✓**, subject/topic/fixed_question/student_ids opt |
| GET | `/` | admin+teacher | page/limit, status enum draft\|active\|inactive\|archived, course_id |
| GET | `/:id` | admin+teacher (⚠ A03) | teacher ⇒ own only in service |
| PUT/DELETE `/:id` | admin+teacher | body optional; teacher ⇒ own only |
| POST | `/:id/activate` | gateway allows all (⚠ A04) | **service: creator-only**, status draft/inactive, fixed questions must exist |
| POST | `/:id/deactivate` | gateway allows all (⚠ A04) | **service: creator-only**, active, no activity, not within `PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES` of start |
| POST | `/:id/start` | gateway allows all | service takes userId as studentId |

### timeBased — `/test/time-based` · preAssessment — `/test/pre-assessment`
| Method | Path | Auth | Validation |
|---|---|---|---|
| POST | `/test/time-based/start` | student | duration1–90; selections1–200 |
| GET | `/test/pre-assessment/status` | student | — |
| POST | `/test/pre-assessment/start` | student | — |

### teacher — prefix `/teacher`
| Method | Path | Auth | Validation / notes |
|---|---|---|---|
| GET | `/list` | admin | — |
| POST | `/assign/course` | admin | teacher_id + course_id ✓ |
| POST | `/assign/subject` | admin | + subject_id ✓ |
| POST | `/assign/bulk-subjects` | admin+teacher | teacher_id, course_id, subject_ids[] opt |
| DELETE | `/unenroll/:id` | admin+teacher (⚠ comment says admin-only) | — |
| GET | `/teacher-enrollment` | admin+teacher (⚠ comment says admin-only) | teacher_id/course_id opt, page/limit |
| GET | `/teacher/:teacherId` | admin+teacher | — |
| GET | `/teaching/courses-and-subjects` | admin+teacher | — |
| GET | `/teaching/students` · `/teaching/tests` | admin+teacher | course/subject/student_id uuid opt, search, page/limit, status enum (tests) |
| GET | `/teaching/top-students` · `/weakness-summary` · `/question-coverage` | admin+teacher | limit1–50; threshold0–100 def50 |

### dashboard — prefix `/dashboard` (**no Zod — raw query parsing**)
| Method | Path | Auth |
|---|---|---|
| GET | `/stats` | all roles (locationId opt) |
| GET | `/student/{topic-performance, subject-performance, difficulty-breakdown, time-analysis, performance-trends, strengths-weaknesses, skill-rating, repeated-questions}` | student |
| GET | `/location/:locationId/performance` | admin |
| GET | `/analytics/{teacher-student-ratio, top-students-by-location, least-questions, subjects-needing-attention}` | admin |
| GET | `/admin/student/:studentId/details` | admin+teacher |

---

##7. Rate limits & auth/session mechanics

| ID | Limiter | Path | Max / window |
|---|---|---|---|
| RL1 | loginLimiter | `POST /api/user/login` | **5 /60s** per IP |
| RL2 | signupLimiter | `POST /api/user/signup` | **3 /60s** per IP |

- `express-rate-limit` v8, standard Draft-6 headers;429 body: `"Too many attempts. Please wait a minute and try again."` Only these two endpoints are limited (`/refresh`, `/logout-all` unlimited — noted in audit follow-ups). `trust proxy:1` (assumes reverse proxy/tunnel).
- **Cookies** (`src/utils/authCookies.ts`): `access_token` — HttpOnly, SameSite=Strict, path `/`, **15-min** JWT (`typ:"access"`, `jti`+`tv`); `refresh_token` — HttpOnly, SameSite=Strict, **path `/api/user`**, opaque7-day sliding. `secure` follows `req.secure`.
- Frontend: cookies only; `localStorage` holds non-secret `user` profile + `has_session` hint; silent refresh on401 (`lib/api/client.ts`, SWR fetcher retry). Never reintroduce `NEXT_PUBLIC_BACKEND_URL` (bypasses proxy → breaks cookies).

---

##8. Real-time contract (Socket.IO)

- **Server:** same HTTP server as API (`src/socket/socketServer.ts`), CORS = `CORS_ALLOWED_ORIGINS`, pingTimeout60s / pingInterval25s.
- **Handshake:** `handshake.auth.token` (or query) must be a **socket ticket** (`typ:"socket"`,5-min, from `POST /api/user/socket-ticket`); HTTP access tokens rejected and vice-versa; Redis blocklist `bl:{jti}` + revision `rev:{userId}` (fail-open). Sets `socket.userId/userEmail/userRole`.
- **Rooms:** `test:{testId}`, `tb_test:{testId}`. Heartbeat check every30s → **no heartbeat for60s ⇒ session `abandoned`, socket disconnected**.

| Client → server | Payload | Server → client | Meaning |
|---|---|---|---|
| `join_test` | {testId} | `test_joined` | join standard test room |
| `answer` | {testId, questionIndex, questionId, answer, timeTaken} | `answer_recorded` | auto-save answer |
| `skip` | {testId, questionIndex, questionId, timeTaken} | — | skip question |
| `heartbeat` | {testId, questionIndex?} | `time_update` | liveness + timer sync |
| `submit_test` | {testId} | `test_submitted` (incl. `reason:"timeout"` auto-submit) | finish |
| `tb:join` | {testId} | `tb:test_joined` | time-based join |
| `tb:answer` | {testId, questionId, answer, timeTaken} | `tb:next_question`, `tb:all_correct` | tb answering |
| `tb:skip` | {testId, questionId, timeTaken} | — | |
| `tb:heartbeat` | {testId} | `tb:time_update` | |
| `tb:submit` | {testId} | `tb:test_submitted` | |
| `disconnect` | — | `error` (on heartbeat fail) | increments disconnect_count, saves last_question_index |

---

##9. Data model (M01–M15)

Global defaults (`config/database.ts`): `timestamps:true, paranoid:true, underscored:true` → every table has `created_at/updated_at/deleted_at`. Sync: `alter` only if `DB_ALTER_TABLES=true`, `force` only if `DB_DROP_TABLES=true` (both env-gated). All associations live in `config/associations.ts` (39 statements), imported before connect. `config/seed.ts` seeds one admin + central location.

| ID | Table | Purpose |
|---|---|---|
| M01 | `users` | accounts (3 roles) |
| M02 | `locations` | branches |
| M03 | `courses` · M04 `subjects` · M05 `topics` | content hierarchy |
| M06 | `questions` | question bank |
| M07 | `enrollments` | student course scope |
| M08 | `predefined_tests` | authored tests | 
| M09 | `predefined_test_questions` | fixed-question junction (+order) |
| M10 | `predefined_test_students` | roster junction (assigned→started→completed) |
| M11 | `test_sessions` | test attempts |
| M12 | `test_answers` | per-question attempts |
| M13 | `test_selections` | practice-test content scope |
| M14 | `user_skill_ratings` | per-user skill score/streaks |
| M15 | `teacher_assignments` | teacher→course(+subject) |

### Field detail

**M01 `users`** (`user.model.ts`)
| Field | Type | Null | Notes |
|---|---|---|---|
| id | UUID | ✗ | PK |
| fname / lname | VARCHAR(50) | ✗ | setter: sanitizeText + lowercase (MED-04) |
| role | ENUM | ✗ | admin \| student \| teacher |
| email | VARCHAR | ✗ | unique partial index (`deleted_at IS NULL`), setter sanitizeIdentifier |
| mobileNumber | VARCHAR(15) | ✗ | setter sanitizeIdentifier |
| password | VARCHAR | ✗ | bcrypt hash |
| location_id | UUID | ✓ | FK → locations |

**M02 `locations`** — id; address_line_1 (255) ✗; address_line_2, landmark (255) ✓; city (100) ✗; pincode (10) ✗; state (100) ✗; country (100) ✗ default India; **is_central** bool default false. → hasMany users.

**M03 `courses`** — id; name (500) ✗; description TEXT ✓. → hasMany subjects, teacher_assignments.
**M04 `subjects`** — id; name (500) ✗; description ✓; **course_id** ✗ FK. → hasMany topics.
**M05 `topics`** — id; name (500) ✗; description ✓; **subject_id** ✗ FK. → hasMany questions.

**M06 `questions`**
| Field | Type | Null | Notes |
|---|---|---|---|
| id | UUID | ✗ | PK |
| type | ENUM | ✗ | mcq \| descriptive |
| question | TEXT | ✗ | unique per topic (service rule) |
| choices | JSONB | ✓ |2–5 strings (MCQ) |
| correctAnswer | TEXT | ✗ | must ∈ choices for MCQ |
| explanation / videoUrl | TEXT / VARCHAR(500) | ✓ | |
| difficulty | ENUM | ✗ | beginner/normal/mid/hard/expert, default normal |
| topic_id / subject_id / course_id | UUID | ✗ | FKs (denormalized hierarchy) |
| questionAddedBy | UUID | ✓ | user id, **no FK declared** |

**M07 `enrollments`** — id; student_id ✗ (logical); course_id ✗ FK; subject_id, topic_id ✓ FK.

**M08 `predefined_tests`**
| Field | Type | Null | Notes |
|---|---|---|---|
| id, title(255), created_by(UUID, no FK) | ✗ | | |
| description | TEXT | ✓ | |
| status | ENUM | ✗ | draft/active/inactive/archived, default draft |
| is_scheduled | BOOL | ✗ | false |
| start_time / end_time | DATE | ✓ | window |
| timezone | VARCHAR(50) | ✗ | default UTC |
| duration_minutes / question_limit | INT | ✗ | |
| difficulty | ENUM | ✗ | + `mixed`, default normal |
| difficulty_ratio | JSONB | ✓ | per-difficulty weights |
| use_fixed_questions / use_specific_students | BOOL | ✗ | false |
| max_attempts | INT | ✗ |1 |
| course_ids | JSONB | ✗ | array |
| subject_ids / topic_ids | JSONB | ✓ | arrays |
| test_link_token | VARCHAR(100) | ✓ | unique share token |
| is_pre_assessment | BOOL | ✗ | false — pre-assessment flag |

**M09 `predefined_test_questions`** — predefined_test_id ✗, question_id ✗, order INT ✗ (paranoid inherited).
**M10 `predefined_test_students`** — predefined_test_id ✗, student_id ✗ (logical), status ENUM assigned/started/completed default assigned, test_session_id ✓.
**M11 `test_sessions`**
| Field | Type | Null | Notes |
|---|---|---|---|
| id, test_id VARCHAR(100) unique, student_id, started_at | ✗ | | test_id = business id (`TEST_…`) |
| status | ENUM | ✗ | pending/in_progress/completed/abandoned |
| subject_id, topic_id | UUID | ✓ | optional scope |
| duration_minutes / question_limit | INT | ✗ | default30 |
| ends_at | DATE | ✓ | server timer |
| total_questions, attempted, skipped, correct, incorrect | INT | ~ | defaults0 |
| score | DECIMAL(5,2) | ~ | default0 |
| disconnect_count, last_question_index | INT | ~ | default0 (resume point) |
| skill_score_snapshot | FLOAT | ✓ | captured at completion |
| completed_at | DATE | ✓ | |
| *predefined_test_id, test_type, tb_state* | — | | **not in `init()`** — association-injected / drift risk (A08) |

**M12 `test_answers`** — test_session_id ✗, question_id ✗, selected_answer TEXT ✓, is_correct BOOL ✓ (null until graded), is_skipped default false, time_taken INT (seconds), submitted_at ✓.
**M13 `test_selections`** — test_session_id ✗, course_id ✗, subject_id, topic_id ✓.
**M14 `user_skill_ratings`** — user_id ✗ unique (**no association registered**); skill_score FLOAT default1; total_answers/correct_answers/current_streak/best_streak INT default0; last_answered_at ✓.
**M15 `teacher_assignments`** — teacher_id ✗ FK, course_id ✗ FK, subject_id ✓ FK (null = whole course); unique `(teacher_id, course_id, subject_id)` where not deleted.

### Entity relationships

```
locations ─1:N─ users(role: admin|teacher| student)
                  ├─1:N─ enrollments ─N:1─ courses/subjects/topics   (student scope)
                  └─1:N─ teacher_assignments ─N:1─ courses (─subjects)

courses ─1:N─ subjects ─1:N─ topics ─1:N─ questions
  (questions also carry subject_id + course_id denormalized; questionAddedBy→users)

test_sessions (student_id→users, status, timer, score)
  ├─1:N─ test_selections ─N:1─ courses/subjects/topics
  ├─1:N─ test_answers ─N:1─ questions
  └─N:1─ predefined_tests (predefined_test_id)

predefined_tests (status, schedule, course_ids, token, is_pre_assessment)
  ├─1:N─ predefined_test_questions ─N:1─ questions   (fixed set + order)
  └─1:N─ predefined_test_students ─N:1─ users        (assigned→started→completed)
                └── test_session_id → test_sessions

users ─1:1─ user_skill_ratings          [no registered association]
```

---

##10. Redis keys

| Key pattern | Value | TTL | Policy |
|---|---|---|---|
| `rt:{refreshToken}` | `{userId,email,role,tv}` |7d sliding (renewed on refresh) | refresh issuance — **fail-closed** |
| `bl:{jti}` | `1` | access exp − now +60s | logout blocklist — **fail-open** (bounded by15-min TTL) |
| `rev:{userId}` | counter | none | logout-all revision bump — issuance **fail-closed**, checks fail-open |
| `admin_stats_{loc\|all}`, `teacher_stats_{id}`, `student_stats_{id}`, `location_perf_{id}`, `topic_perf_{id}`, `perf_trends_{id}` | JSON | **300s** | dashboard/analytics caches |
| `subject_perf_{id}` | — | — | ⚠ read but never written (A12) |

---

##11. Existing documentation mined

| Source | Status | Reusable for ebook |
|---|---|---|
| `README.md` (root) | stale architecture (microservices), **roles matrix accurate** | Ch.1 overview & roles; tech-stack table (fix backend row) |
| `frontendJkShah/README.md` | current (caveat: old socket topology) | Installation chapter, feature list, project layout |
| `frontendJkShah/PRD.md` (= `frontend/PRD.md`) | stale (claims8 microservices/ports) | §2 role feature matrix (verify unimplemented items), socket vocabulary |
| `frontendJkShah/DESIGN.md` | current | "Look & Feel / theming" chapter + token appendix |
| `JKSHAHDESIGN.md` (root = frontendJkShah copy) | **current brand spec** | Brand & design language chapter (colors, type, components, dark mode) |
| `frontendJkShah/RULES.md` | partly stale (env examples) | contributor appendix only (not end-user) |
| `docs/SECURITY_AUDIT_REPORT.md` (**in `docs/`, not root**) | current, partially remediated | Security chapter; re-verify each finding's status |
| `NGINX_CONFIG.md` | stale topology, reusable directives | Deployment chapter (update upstream → mono) |
| `backend/*/API.md` ×8 | **stale** (old ports/auth headers) | payload shapes only — rewrite URLs/auth for `backend-mono` |
| `backend/questionService/EXCEL_IMPORT_DOCS.md` | mostly current | Ch. import — add **Difficulty** column, pnpm, teacher scoping |
| `api_collections/*.openapi.json` (6 files) | machine-readable | Appendix C seed (re-verify vs gateway) |

⚠ Repo README links point to non-existent `BACKEND_AUDIT.md` and a root-level `SECURITY_AUDIT_REPORT.md` — real file is `docs/SECURITY_AUDIT_REPORT.md`.

---

##12. Anomalies & open questions (A01–A16)

> Docs-writing implications. Items marked 🔒 are potential **security/behavior findings outside the docs scope** — surfaced for the user, not to be silently documented as "normal".

| ID | Severity | Finding | Docs handling |
|---|---|---|---|
| A01 | medium | **Two join pages**: P26 `/test/join/{token}` (canonical — all share links point here) vs P25 `/join/{token}` (legacy, richer guard but nothing links to it; different post-join scrub target) | Document **P26 only**; footnote P25 as legacy |
| A02 | low | `RouteGuard` declares `/signup` public but **no `/signup` route exists**; signup = mode inside `/signin` | Document F02 under P02 |
| A03 | low | Gateway rule `GET /test/predefined` (admin,teacher,student — "by ID") is **dead**: identical earlier rule wins → `GET /:id` effectively admin+teacher | Document actual behavior (students:403) |
| A04 | 🔒 | `POST /test/predefined` gateway roles include **student** and service does no role check → **students can create predefined tests**; activate/deactivate/start reachable by any role (service enforces creator-only for activate/deactivate) | **Report to user**; do not document as intended |
| A05 | 🔒 | `GET /enrollment/student/:studentId` rule dead (earlier `GET /enrollment` prefix match wins) → **admin/teacher403**, and enrollment read is scoped to "student" role without ownership check → **any student can read any student's enrollments** | **Report to user** |
| A06 | 🔒 | Gateway is **fail-open**: any `/api` path without a `routes.ts` rule gets **no authentication** | **Report to user** (future-route footgun) |
| A07 | low | `/dashboard/teacher-enrollments` allows admin, but hook builds null URL for admin → renders the empty state *No enrollments yet* (not a crash) | Document as teacher page; footnote admin sees the empty state |
| A08 | medium | `test_sessions.test_type`, `tb_state` written by time-based service but **not declared in model `init()`** → `sync()` won't create them (relies on pre-existing DB columns; drift risk) | Ops/troubleshooting footnote |
| A09 | medium | Student-detail page `/dashboard/users/students/{studentId}` is **admin-only by guard** while the API would allow teacher (guard/API mismatch). P08 no longer links to it (Name is plain text); only admin rosters (P16/P17/P18) link — a teacher opening the URL directly gets **404** | Detail page = admin-only (Ch25); teacher limitation noted in **Ch16** |
| A10 | low | P05 KPI quirks: "Total Tests" shows completedCount (identical to "Completed"; hook `total` unused) and "Average Score" averages only the completed tests on the *current page* | Don't copy labels blindly — describe actual behavior |
| A11 | low | P09 question delete wires `useDeleteWithUndo({type:"topic"})` — **user-visible copy is correct** (confirm: *…undone within 5 seconds*; toast `«question text» will be deleted` → **Undo** (5s) → `«text» deleted successfully`). The `type` tag is only a console label (`Failed to delete topic:`) + the `localStorage` flush matcher: pending **question** deletions sit in the shared `topic` bucket, so the Topics page's mount-flush can commit them against the topic delete API and vice versa (failed flush drops the entry) | **Ch17** documents the undo flow + the shared-tag flush quirk as a limitation; screenshots unaffected |
| A12 | low | P13 `tests/manage` + P10 import hand-roll tables (no shared DataTable empty state); `subject_perf_{id}` Redis key read but never written (dead cache) | Descriptive only |
| A13 | medium | Layout-level **pre-assessment redirect blocks every dashboard page** for students until pre-assessment completed — hidden precondition on all student chapters | State the precondition up-front in Student part |
| A14 | low | "Forgot password?" button has **no handler** | Don't document as working; footnote "not yet functional" |
| A15 | low | Live-test **Clear** clears the selection only locally — no event is sent, so the previously saved answer stays server-side until another choice is clicked | Note in Ch11: after Clear, pick a new option to change the graded answer |
| A16 | low | `/dashboard/tests/student-results` (P15) is **orphaned**: grep finds no nav entry, menu item, or frontend link to it — reachable only by direct URL with `?studentId=`. Its **View** action also omits `&studentId=` (opens the plain result fetch) | **Ch19** documents it as a direct-URL screen; staff use P11 **View** instead |

**Code-hygiene notes (not user-facing):** duplicate `AuthRequest`×3 in `types/index.ts`; duplicated logger under `shared/logger` vs `utils/logger` (index uses utils); comment/role mismatches on `/teacher/unenroll` + `/teacher/teacher-enrollment` (comments say "admin only", roles admin+teacher); pagination caps inconsistent (100 vs10000 by schema).

---

##13. Coverage checklist (Phase1 exit criteria)

- [x]29 pages identified with route, file, roles, data, tables, dialogs, actions, states
- [x] Role × page matrix + route-guard/gateway behavior documented
- [x] Nav per role (sidebar + header)
- [x]13 dialogs with complete field tables, submit endpoints, error mechanisms
- [x]4 standalone forms/wizards (sign-in, sign-up, test-create, Excel import)
- [x] Full API surface by module (auth levels + validation summaries)
- [x] Rate limits (RL1/RL2), cookie/session mechanics
- [x] Socket contract (handshake, events both directions, rooms, heartbeat policy)
- [x]15 data models with fields + ER diagram; sync/seed behavior
- [x] Redis key inventory
- [x] Existing docs mined with per-chapter reuse recommendations
- [x]16 anomalies logged (3 security-surfaced 🔒 for separate reporting)

**Unmapped/unknown:** none — every file-level entity found in the sweep carries an ID above.
