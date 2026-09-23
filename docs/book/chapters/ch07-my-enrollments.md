# Chapter7 — My Enrollments

> **Part:** III — The Student Handbook · **Phase:**5
> **Covers:** P04, **D07 EnrollDialog (owner)**, D13 as used here
> **Roles:** student

## In this chapter
- What an enrollment *is* — and why rows can stop halfway down the hierarchy
- The enrollments table, state by state
- Enrolling in bulk with the Enroll dialog (every field)
- Unenrolling, with its confirmation

## Getting here
- **From:** sidebar → **Enrollments** (or straight to `/dashboard/enrollments`)
- **Ends at:** a list you'll want populated before using [Ch8](ch08-my-tests.md)

<!-- img: ch07-enrollments-list -->

## What an enrollment is
Content is hierarchical: **Course ▸ Subject ▸ Topic** ([Ch2](ch02-core-concepts-domain-model.md)). Your enrollments say *which slice of that content is yours* — and they may stop at any level:

- Row with only a **Course** → the whole course (every subject, every topic)
- Row with **Course + Subject** → that subject entirely
- Row with all three → just that one topic

Blank levels show as `-` in the table. Enrollments drive your **Questions Available** KPI ([Ch6](ch06-your-dashboard.md)) and the course list inside the Start Test dialog ([Ch8](ch08-my-tests.md)).

## The page
- Header: **"My Enrollments"** / *"Manage your course enrollments"* — **＋ Enroll** button on the right
- Card titled **Enrollments (n)** with a book icon; `n` is your current row count

**States**

| State | What you see |
|---|---|
| Loading | centered spinner inside the card |
| Error | centered red message |
| Empty | book icon + *"No enrollments yet"* + *"Click "Enroll" to get started"* |
| Populated | the table below |

## The table — P04 owns these columns

| # | Content |
|---|---|
| **#** | row number (`1…n`) |
| **Course** | purple badge, capitalized |
| **Subject** | blue badge — or `-` (course-wide row) |
| **Topic** | green badge — or `-` (subject-wide row) |
| *(no header)* | red **trash** icon → unenroll (below) |

The full list renders in one table — **there is no pagination**; the count lives in the card title.

## Enrolling — D07 "Enroll in Courses" *(owner: this chapter)*

Opened by **＋ Enroll**. Title: **"Enroll in Courses"** · Description: *"Select courses, subjects, and topics to enroll in. You can add multiple enrollments."*

### Fields

| Field | Required | Behavior |
|---|:-:|---|
| **Course \*** | ✓ | dropdown of the site-wide course catalog. Changing it **resets** subject and topic in that block |
| **Subject** | ✗ | disabled until a course is chosen. Options: **All Subjects** (default scope) + each subject of that course. Changing it resets topic |
| **Topic** | ✗ | disabled until a subject is chosen. Options: **All Topics** + the topics under the selected subject(s) |

Each set of three fields is one numbered block — **"Enrollment 1"**, **"Enrollment 2"**…

- **＋ Add Another Enrollment** — up to **50 blocks**
- **✕** on a block removes it (never below one block)
- Leaving Subject/Topic at *All* sends no scope to the server → the stored row covers everything below the course

### Walkthrough
1. Click **＋ Enroll**; the dialog opens with one empty block.
2. Pick a **Course** (subject/topic unlock).
3. Optionally narrow to a subject/topic — or leave *All*.
4. Optionally **Add Another Enrollment** and repeat (up to50).
5. Press **Enroll** (or **Cancel** to abort).

### Validation & results
- No course selected in any block → red inline: **"Please select at least one course"**
- Success → toast **"Enrolled in N item(s)"**; duplicates aren't errors — you get an info toast **"N item(s) skipped (already enrolled)"**
- The dialog closes and the table refreshes automatically
- Other failures → red inline message (e.g. server unreachable)

<!-- img: ch07-enroll-dialog-open -->

## Unenrolling — D13 confirmation
1. Click the row's **trash** icon.
2. Confirmation dialog appears:
   - Title: **"Unenroll"**
   - Text: *"Are you sure you want to unenroll from **{course name}**?"*
   - Buttons: **Cancel** / **Unenroll**
3. Confirm → `DELETE /api/enrollment/{id}` → toast **"Unenrolled successfully"** → the list refreshes.
4. Failure → toast **"Failed to unenroll"**.

Your existing tests and results stay in [My Tests](ch08-my-tests.md) — unenrolling only stops *future* questions from that scope.

<!-- img: ch07-unenroll-confirm -->

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Empty list right after enrolling | everything you picked was a duplicate ("skipped" toast) | the rows you expected already exist — look for them |
| Course dropdown empty in the dialog | no courses exist in the system yet | admin creates courses first (Ch26) |
| Subject options empty | that course has no subjects yet | admin side (Ch27) |
| Course missing from **Start Test** (Ch8) | that dialog only offers courses you're enrolled in | enroll here first |
| `404 — Page not found` | this page is student-only | role matrix in Ch4 |
| Dashboard "Questions Available" still `0` | no enrollments (or catalog empty) | fix rows above; refresh [Ch6](ch06-your-dashboard.md) |

## Roles & permissions
**Student-only.** Teachers and admins get `404` on this URL (Ch4); enrollment is a self-service student action — nobody assigns rows to you from here. The API requires your session cookie (Ch4).

## Related
- **Chapters:** [Ch2 — Domain Model](ch02-core-concepts-domain-model.md) · [Ch4 — Permissions](ch04-sessions-security-permissions.md) · [Ch5 — Getting Started](ch05-getting-started.md) · [Ch6 — Dashboard](ch06-your-dashboard.md) · [Ch8 — My Tests](ch08-my-tests.md) · Ch26 *(admin creates the catalog — link added when that chapter ships)*
- **Screens:** P04 · **Dialogs:** D07, D13 · **Appendices:** A (forms) · B (tables) · C (API) · E (errors)
