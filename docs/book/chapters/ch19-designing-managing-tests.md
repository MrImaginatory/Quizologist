# Chapter 19 — Designing & Managing Tests

> **Part:** V — The Teacher Handbook · **Phase:** 7
> **Covers:** P11 `/dashboard/tests`, P12 `/dashboard/tests/create` + **F03 wizard (owner)**, P13 `/dashboard/tests/manage`, P14 `/dashboard/tests/[id]` + **D11/D12 selectors (owners)**, P15 `/dashboard/tests/student-results` (orphaned, A16)
> **Roles:** teacher, admin (student sees these tests from [Ch9](ch09-available-tests-pre-assessment.md))

## In this chapter
- Reading the tests/results list and its filters (P11)
- Creating a predefined test in the 5-step wizard (F03 — field tables below)
- Managing the catalog: activate/deactivate with the hand-rolled table (P13, A12)
- The test detail page: configuration, content, fixed questions, roster, share link (P14)
- The two selectors — **Select Questions** (D11) and **Select Students** (D12)
- The direct-URL-only student results screen (P15, A16)

## Getting here
- **Menu path:** Tests ▸ View Tests (`/dashboard/tests`) · Tests ▸ Manage Tests (`/dashboard/tests/manage`)
- **URLs:** `/dashboard/tests` · `/dashboard/tests/create` · `/dashboard/tests/manage` · `/dashboard/tests/{id}` · `/dashboard/tests/student-results`
- **Requires:** teacher or admin role

<!-- img: ch19-tests-list -->

## The tests list — P11
Header: **"Tests"** / *"View test results for students"* / **⚙ Manage Tests** button (visible to teacher and admin) → `/dashboard/tests/manage`.

### Filters (`TestFilters`)
| Control | Options / placeholder | Notes |
|---|---|---|
| Status | **All Status** · Pending · In Progress · Completed · Abandoned | |
| Dates | *"From date"* `to` *"To date"* | **admin only in effect** — a teacher sees these pickers but they are *not sent* to the teaching endpoint (date filtering works for admins) |
| Student | *"All Students"* (*"Loading students..."*) | teacher: your teaching students (`?limit=100`); admin: all students (`?limit=100`) |
| Course | *"All Courses"* | teacher only |
| Subject | *"Select course first"* → *"All Subjects"* | teacher only; follows the course choice |
| **Clear** (ghost) | — | appears only when any filter is active |

### Results table (P11 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number | client index |
| Test ID | the attempt's public test id | `GET /api/test/all?…` (admin) or `GET /api/teacher/teaching/tests?…` (teacher) |
| Student | name plus email underneath | `student.fname/lname/email` |
| Status | badges: completed **green** · in_progress **blue** · abandoned **red** · pending **yellow** | `status` |
| Score | green ≥70 · yellow ≥50 · otherwise red; one decimal + `%`, or `-` when 0 | `score` |
| Correct | `{correct} / {total_questions}` | same row |
| Date | start date, locale format; `-` if none | `started_at` |
| Actions | renders **only** for a teacher or when a specific student is selected; within it only **completed** rows get **View** → `/test-result?id={attempt}&studentId={student}` | conditional column |

> **Note (A16):** in-progress/pending rows leave the Actions cell **empty** — nothing here links to the student-results screen (P15); staff use **View** on completed rows instead.

<!-- img: ch19-create-wizard-mixed -->

## Creating a test — F03 field tables *(this chapter owns F03)*

**URL:** `/dashboard/tests/create` · submit `POST /api/test/predefined` · success → toast *"Predefined test created successfully!"* → navigates to the detail page.

The **Stepper** shows five steps; your answers persist to `localStorage` under `create-predefined-test-form` after every change (reopening the page restores them).

| Step | Title | Subtitle | Advance requires |
|--:|---|---|---|
| 1 | Basic Info | Name & description | non-empty **Title** |
| 2 | Configuration | Duration & questions | duration > 0 **and** question limit > 0 |
| 3 | Scope | Course & topics | at least one course selected |
| 4 | Schedule | Time window | always allowed |
| 5 | Questions | Selection type | always allowed |

Top-right **Clear** button (disabled when the form is already at defaults) → D13 *"Clear Form"* / *"Are you sure you want to clear all form data? This action cannot be undone."* / **Clear** → toast *"Form cleared"*. Footer buttons: **Cancel** (step 1) / **Back** · **Next** (disabled until the step's gate passes) · **Create Test** (last step).

### Step 1 — Basic Information
*"Set the test name and description"*
| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 1 | `title` | **Title \*** | text | ✓ | placeholder *"e.g., Midterm Exam - Direct Tax Laws"*; the step's advance gate |
| 2 | `description` | **Description** | textarea | — | placeholder *"Optional description for the test"* |

### Step 2 — Test Configuration
*"Set duration, questions, and difficulty"* — defaults: duration **30**, question limit **30**, max attempts **1**.
| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 3 | `duration_minutes` | **Duration (minutes) \*** | number | ✓ | min 1 · max 300 · placeholder *"e.g., 30"* (default 30) |
| 4 | `question_limit` | **Question Limit \*** | number | ✓ | min 1 · max 200 · placeholder *"e.g., 30"* (default 30) |
| 5 | `difficulty` | **Difficulty \*** | select | ✓ | Beginner · Normal · Mid · Hard · Expert · **Mixed** (default *Normal*) |
| 6 | `max_attempts` | **Max Attempts** | number | — | min 1 · max 10 · placeholder *"e.g., 1"* (default 1) |
| 7 | `difficulty_ratio` | **Difficulty Ratio (%)** | 5 number inputs | conditionally | **only shown when Difficulty = Mixed** — see below |

**Difficulty Ratio block** — helper: *"Set the percentage of questions for each difficulty level. Must sum to 100%."* One input per level (beginner/normal/mid/hard/expert, placeholder *"0"*), each with a *"{max}%"* cap caption showing what's still available; a **Total:** line shows the sum — green at exactly 100%, destructive above, plus the inline error *"Total cannot exceed 100%"*.

### Step 3 — Course & Topic Scope
*"Select courses, subjects, and topics for the test"* — a summary line under the pickers reads **Selected:** with badges *"{n} courses"*, *"{n} subjects"*, *"{n} topics"*.
| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 8 | `course_ids` | **Courses \*** | checkbox grid (2 cols) + **Select All** | ✓ | hint *"Select at least one course"*; unchecking Select All clears subjects and topics too |
| 9 | `subject_ids` | **Subjects (Optional)** | checkbox grid + **Select All** / **Clear** | — | hint *"Filter by specific subjects"*; only subjects of the chosen courses |
| 10 | `topic_ids` | **Topics (Optional)** | checkbox grid + **Select All** / **Clear** | — | hint *"Filter by specific topics"*; appears only after ≥1 subject is selected |

### Step 4 — Scheduling
*"Optional: Set a time window for the test"*
| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 11 | `is_scheduled` | **Scheduled Test** | On/Off button toggle | — | helper *"Limit when students can take this test"* (default Off) |
| 12 | `start_time` | **Start Time \*** | date-time picker | ✓ when scheduled | |
| 13 | `end_time` | **End Time \*** | date-time picker | ✓ when scheduled | disabled until a start time exists; minimum = start + duration + 1 minute |
| 14 | `timezone` | **Timezone** | select | — | placeholder *"Select timezone"*; payload falls back to `"UTC"` |

### Step 5 — Question Selection
*"Choose between fixed or dynamic questions"*
| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 15 | `use_fixed_questions` | **Fixed Questions** | On/Off toggle | — | helper *"Use the same questions for all students"*; when On, note *"Question selection will be available after creating the test."* (default Off) |
| 16 | `use_specific_students` | **Specific Students** | On/Off toggle | — | helper *"Only allow specific students to take this test"*; when On: *"Student selection will be available after creating the test."* + *"You can assign specific students from the test details page."* (default Off) |

**Payload notes:** empty `subject_ids` / `topic_ids` / `student_ids` are omitted; `difficulty_ratio` is omitted unless some level is non-zero; times are sent as ISO strings **only when scheduled**; `timezone` defaults to `"UTC"`. Failure toast: *"Failed to create test"* (or the server's message).

<!-- img: ch19-manage-tests -->

## Managing the catalog — P13
**URL:** `/dashboard/tests/manage` (back arrow returns to the list). Header: **"Manage Tests"** / *"Create and manage predefined tests"* / **+ Create Test** (reads **Create** on small screens) → `/dashboard/tests/create`. Data: `GET /api/test/predefined` (paginated).

> **Note (A12):** this screen uses a **hand-rolled table**, not the shared DataTable component — so it brings its own loading/empty/pagination markup.

| Column | Meaning | Source |
|---|---|---|
| `#` | row number | client index |
| Title | test name (bold) + description truncated to 200px | `title` / `description` |
| Status | badge, word-capitalized: active **green** · draft **yellow** · anything else gray | `status` |
| Duration | `{n} min` — hidden below the `sm` breakpoint | `duration_minutes` |
| Questions | the limit — hidden below `sm` | `question_limit` |
| Created | locale date — hidden below `sm` | `createdAt` |
| Actions | for **draft** rows a ▶ Play button (activate); for **active** rows a ⏸ Pause button (deactivate); clicking it does *not* navigate | `stopPropagation` |

Clicking anywhere else on a row opens `/dashboard/tests/{id}`. Empty state: *"No tests found. Create your first test!"*. Pagination renders **only when there is more than one page**: *"Showing {start} to {end} of {total}"* with **Previous** / **Next**. Each toggle shows a toast — *"Test activated!"* / *"Test deactivated!"* — then **reloads the whole page**.

<!-- img: ch19-test-detail -->

## The test detail page — P14
**URL:** `/dashboard/tests/{id}` — the back arrow returns to **Manage Tests** (not the list). Header: test title (+ description) and a status badge (draft **yellow** · active **green** · inactive **gray** · archived **red**).

### Cards
| Card | Contents |
|---|---|
| **Test Configuration** | rows: Duration (*"{n} minutes"*) · Questions · Difficulty (capitalized) · Max Attempts · Fixed Questions *Yes/No* · Specific Students *Yes/No* |
| **Schedule** | Scheduled *Yes/No*; Start Time / End Time (locale time, *"N/A"* if unset) only when scheduled; Timezone |
| **Content Selection** | collapsible **course** rows (chevron rotates 90°, badge *"{n} subjects"*) → collapsible **subjects** (badge *"{n} topics"*) → topic bullets. Empty: *"No specific content selected. Questions will be randomly selected from all available content."* · an expanded subject with none: *"No topics selected"* |
| **Fixed Questions** *(only when fixed mode is on)* | subtitle *"{n}/{limit} questions selected"*; **Add Questions** (or **Edit Questions** once any exist); empty: *"No questions selected. Click "Add Questions" to select questions."*; lists the first 5 then *"And {n} more questions..."* |
| **Student Assignment** *(only when specific-students mode is on)* | Users icon; subtitle *"{n} students assigned"* / *"No specific students assigned"*; **Assign Students** / **Edit Students**; empty: *"No specific students assigned. You can assign students using the button above."*; first 5 then *"And {n} more students..."* |
| **Test Link** | the share URL in a code block (or *"No link generated"*) + copy button; caption *"Share this link with students to allow them to join the test"* |

**Share link format:** `{origin}/test/join/{slug}_{start}_{end}_{token}` where *slug* = the title lowercased with every non-alphanumeric run replaced by `_`, and *start*/*end* = the ISO timestamp truncated to 16 characters with `T` → `_`, or the literal `noschedule` when unscheduled. Copy shows a green check for 2 seconds + toast *"Test link copied!"* (the button is disabled without a token). Students open it per [Ch10 — Joining a Test](ch10-joining-a-test.md).

**Activation:** the bottom-right **Activate ▶** button shows only for draft/inactive tests and **Deactivate ⏸** (destructive) only for active ones; toasts *"Test activated!"* / *"Test deactivated!"*. Activation requires `canActivate` = status is draft/inactive **and** (either dynamic questions **or** ≥1 fixed question selected). A yellow warning box appears when fixed mode has zero questions while the test is draft/inactive: *"You must add questions before activating this test."* Saving selectors toasts *"Questions saved!"* / *"Students saved!"*; the Specific Students toggle toasts *"Specific students enabled/disabled"*.

<!-- img: ch19-question-selector -->

## Select Questions — D11 field table *(this chapter owns D11)*

Opened from **Add Questions** / **Edit Questions**. The dialog makes **no API calls itself** — it refetches `GET /api/question/filter` when its filters change and hands the ids back, where the page saves them with `PUT /api/test/predefined/{id}` `{ fixed_question_ids }`.

| Element | Label / placeholder | Behavior |
|---|---|---|
| Title | **"Select Questions"** | subtitle: *"Select up to {questionLimit} questions. {n}/{limit} selected."* |
| Quota panel | *"Questions per Difficulty Level:"* | **only when the test uses a mixed difficulty ratio** — one tile per level showing the level name and `{selected}/{required}`; completed tiles turn green with a check/progress fill |
| Search | *"Search questions..."* | client-side text filter |
| Filters | **All Difficulties** · **All Courses** · **All Subjects** | each shows the current selection when set |
| Counters | *"{n} questions available"* + badge *"{n}/{limit} selected"* (destructive red at the limit) + **Clear All** (appears when ≥1 selected) | Clear All empties the selection |
| Rows | checkbox + question text (2-line clamp) + difficulty badge + *({current}/{required} selected)* when a quota applies | rows **at their difficulty quota** are disabled (`opacity-50`, not clickable) |
| Empty | *"No questions found"* | |
| Footer | **Cancel** · **Select {n} Questions** (disabled at 0) | confirm → parent saves |

**Guard toasts:** `` `Cannot select more than {n} {Difficulty} questions` `` (per-level quota) · *"Cannot select more questions"* · `` `Cannot select more than {limit} questions` `` (overall limit).

<!-- img: ch19-student-selector -->

## Select Students — D12 field table *(this chapter owns D12)*

Opened from **Assign Students** / **Edit Students**. No API in the dialog either — the list is the first 100 students (`GET /api/user/role/student?page=1&limit=100`), and confirming saves with `PUT /api/test/predefined/{id}` `{ student_ids }`.

| Element | Label / placeholder | Behavior |
|---|---|---|
| Title | **"Select Students"** | subtitle: *"{n} students selected"* |
| Search | *"Search students..."* | client-side filter |
| Counters | badge *"{n} selected"* · **Select All** / **Deselect All** (label flips when every *filtered* row is selected — the buttons act on the **filtered list**) · **Clear** (appears when ≥1 selected) | |
| List | scrollable 400px box: checkbox + name + email per row | load failure toast: *"Failed to load students"* |
| Empty | *"No students found"* | |
| Footer | **Cancel** · **Select {n} Students** | **enabled even at 0** — confirming with nothing selected saves an **empty roster** |

> **Warning:** with a 100-student cap on the picker, classes larger than 100 can't be fully assigned from this dialog — search to reach students beyond the first page of the load.

<!-- img: ch19-student-results -->

## Student results — P15 *(direct URL only)*
**URL:** `/dashboard/tests/student-results?studentId={id}&name={First}`

> **Note (A16):** this route is **orphaned** — no sidebar entry, menu item, or frontend link points to it. Reach it only by typing the URL with `?studentId=` (the staff path in practice is **View** on a completed row in P11).

- **Without `studentId`:** a centered card reads *"No student selected"* with **Back to Tests**.
- **With `studentId`:** back arrow → `/dashboard/tests`; heading **"Student Results"**; subtitle *"Results for {name}"* (decoded from the query) or *"Test results"* when no name was passed.
- **Card "Test History"** columns: `#` · Test ID (monospace) · Status (*"Completed"* green, in_progress blue, abandoned red) · Score (same ≥70/≥50 color thresholds, one decimal + `%`) · Correct (`{n} / {m}`) · Date (completion date) · Actions → **View** → `/test-result?id={attempt}` — **note it omits `&studentId=`**, so it opens the plain result fetch (see [Ch13 — Results](ch13-results-analytics.md)).
- Data: `GET /api/test/student/{id}/results`, paginated (10 per page, numbered page links). Empty: *"No results found"*.

## Data on this screen (endpoints per screen)
| Screen | Data source |
|---|---|
| P11 list | admin `GET /api/test/all?status&student_id&date_from&date_to&page&limit` · teacher `GET /api/teacher/teaching/tests?page&limit&status&course_id&subject_id&student_id` |
| P12 wizard | lookups for courses/subjects/topics; submit `POST /api/test/predefined` |
| P13 catalog | `GET /api/test/predefined` (+ activate/deactivate calls) |
| P14 detail | `GET /api/test/predefined/{id}`; hierarchy/author lookups; save `PUT /api/test/predefined/{id}` |
| P15 results | `GET /api/test/student/{id}/results` |

## Roles & permissions
- **Teacher** — everything above, scoped to your teaching content; **Manage Tests** button and course/subject filters appear for you.
- **Admin** — identical screens with all-student scope and date filters in effect (differences consolidated in Ch28).
- **Student** — cannot open these routes; predefined tests reach them via [Ch9](ch09-available-tests-pre-assessment.md) and the share link ([Ch10](ch10-joining-a-test.md)).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| **Next** / **Create Test** stays disabled | the current step's gate fails (title empty · duration/limit ≤ 0 · no course) | fill the required field(s) for that step |
| *"Total cannot exceed 100%"* (red) | the difficulty ratios sum above 100 | lower a level — the per-level *"{max}%"* captions show what's left |
| Yellow *"You must add questions before activating this test."* | fixed-question mode with an empty selection | click **Add Questions** and pick at least one (D11) |
| **Activate** does nothing | `canActivate` is false (wrong status or empty fixed selection) | check the warning above; a fixed test needs ≥1 question |
| *"Cannot select more than {n} … questions"* toast | you hit a per-difficulty quota or the overall limit in D11 | deselect elsewhere, or accept the mix — quota tiles show current/required |
| Page fully reloads after toggling a test on P13 | by design — activate/deactivate call `window.location.reload()` | expected; your place resets to page 1 |
| *"No student selected"* card | P15 opened without `?studentId=` | use **View** from P11 instead (P15 is direct-URL only — A16) |
| Result opens without student context from P15's **View** | its link omits `studentId` (known behavior) | the score page still renders; cross-check the student in P11 |
| *"Failed to create test"* / *"Failed to save questions"* toast | server rejected the request (expired token, validation) | reload; re-sign-in if 401 ([Ch5](ch05-getting-started.md)); re-check limits |
| D12 list looks incomplete | only the first 100 students load — and the picker caps at 100 for admins too (it is the same D12 screen; there is no larger-roster admin path) | search within those 100 by name/email |

## Related
- **Chapters:** [Ch9 — Available Tests](ch09-available-tests-pre-assessment.md) · [Ch10 — Joining a Test](ch10-joining-a-test.md) · [Ch13 — Results](ch13-results-analytics.md) · [Ch14 — Teaching Dashboard](ch14-teaching-dashboard.md) · [Ch15 — Teaching Enrollments](ch15-teaching-enrollments.md) · [Ch17 — Question Bank](ch17-question-bank.md) · [Ch18 — Importing Questions](ch18-importing-questions.md) · Ch28 (admin differences)
- **Screens:** P11, P12, P13, P14, P15 · **Forms:** F03 *(owner)* · **Dialogs:** D11 *(owner)*, D12 *(owner)*
- **Endpoints:** `GET /api/test/all`, `GET /api/teacher/teaching/tests`, `POST /api/test/predefined`, `GET/PUT /api/test/predefined/{id}`, `…/activate`, `…/deactivate`, `GET /api/question/filter`, `GET /api/user/role/student`, `GET /api/test/student/{id}/results` (details: Appendix C)
