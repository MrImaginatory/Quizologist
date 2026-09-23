# Chapter13 — Results & Review

> **Part:** IV — Taking Tests · **Phase:**6
> **Covers:** P29 `/test-result`, score badge, question navigator, per-question review, PDF/Excel export, where results live
> **Roles:** student (own attempts); admin/teacher **with `?studentId=`**

## In this chapter
- Every way into this page
- The header: score badge + Download (PDF/Excel)
- The navigator: what the four tile colors mean
- Reading a question: graded choices, explanation, video, time taken
- Where results live afterwards

## Getting here
- **Student:** My Tests → row **View** (`/test-result?id={attempt}`) — or finish a test → *View Test History* → View
- **Teacher/Admin:** their result tables append `&studentId={id}` — the tests list [Ch19] and the student-profile screen [Ch25] (Parts V–VII)
- Without `?studentId=`, the normal result fetch runs; **staff with `studentId=`** load that student's result list and select this attempt (missing → *"Test result not found"*)

Loading: *"Loading results…"* spinner · Failure: **"Could not load results"** card — *"{error}"* or *"The results for this test are not available yet."* — plus **View Test History** (role-aware route).

<!-- img: ch13-test-result -->

## The header
| Element | Content |
|---|---|
| ← back | student → `/dashboard/my-tests` · staff → `/dashboard/tests` |
| Title | **Test Results** + mono `test_id` beneath |
| **Download** dropdown | **Download PDF** · **Download Excel** — generated in your browser from this result (score + question-by-question detail); available top-right (`sm+`) and again in the bottom bar on phones |
| Score badge | `x.x%` — **green ≥70 · amber ≥50 · red below** |

<!-- img: ch13-download-menu -->

## The navigator (left, `lg` screens and up)
Header: **Questions** + `{correct}/{totalQuestions}` + progress bar.

5-column tile grid — click a tile to jump to that question:

| Tile color | Meaning |
|---|---|
| Emerald | correct answer |
| Red | answered incorrectly |
| Amber | skipped (you visited, submission was empty) |
| Gray | never reached |
| Primary ring | currently viewed |

Legend below repeats Correct / Incorrect / Skipped / Unanswered.

> **Note:** the per-question badge lumps *skipped* and *never reached* together as **"Skipped"** — the sidebar colors keep them distinct (amber vs gray).

## Reading a question
- **"Question n of total"** + status badge — **✓ Correct** (emerald) · **Skipped** (gray) · **✕ Incorrect** (red) — plus Course / Subject badges
- Question text, then the choices with grading colors:
  - **emerald border + filled letter + ✓** = the correct answer
  - **red border + filled letter + ✕** = *your* wrong pick
  - plain rows = not chosen and not correct
- **Explanation** card (when the question author wrote one)
- **Video Explanation** card → *"Watch video explanation"* (opens in a new tab)
- **Time taken: {n} seconds** — per-question, as recorded during the test
- Background watermark: repeating `test_id` (same anti-leak treatment as the room)
- Bottom bar: **Previous** / **Next** (Download menu again on phones)

## Where results live afterwards
- **My Tests** ([Ch8](ch08-my-tests.md)) — the permanent history row (**Score**, **Correct**, **View**)
- **Dashboard trends** ([Ch6](ch06-your-dashboard.md)) — completed attempts feed Performance Trends, Subject/Topic accuracy and the KPIs
- **Teacher/Admin tables** (Parts V–VII) — staff drill into the same page with `&studentId=`
- Re-opening `/test-result?id=…` any time re-fetches the stored review — results don't expire client-side; access still requires a session with permission (Ch4)

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| "Could not load results" | wrong/missing `id`, expired session, or no permission | go via My Tests **View**; sign in again if needed (Ch5) |
| "Test result not found" (staff) | that attempt isn't in the student's result list | confirm the student/attempt pair (their chapters) |
| "…not available yet" | attempt isn't graded/submitted | finish or wait for grading to settle |
| No sidebar colors | screen narrower than `lg` | widen the window — review content itself is responsive |
| Badge says "Skipped" though you never opened it | by design (see navigator Note) | check the sidebar tile color for the true state |
| Nothing happens on Download | file is generated client-side | allow downloads; try the header menu on `sm+` screens |
| Score differs from the in-room circle | same source, different precision | room circle rounds to whole %, badge/headings keep one decimal |

## Roles & permissions
Students see their own results through the plain fetch; teachers/admins arrive via `?studentId=` and pull the student-scoped list — either way the session must permit it, and failures surface as the error card. [Ch4](ch04-sessions-security-permissions.md).

## Related
- **Chapters:** [Ch6 — trends fed by results](ch06-your-dashboard.md) · [Ch8 — history View](ch08-my-tests.md) · [Ch11](ch11-live-test-room.md) / [Ch12 — reaching this page](ch12-time-based-tests.md) · Parts V–VII for staff views
- **Screens:** P29 · **Appendices:** C (result API) · E
