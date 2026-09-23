# Chapter6 — Your Dashboard

> **Part:** III — The Student Handbook · **Phase:**5
> **Covers:** P03 (student view), PreAssessmentBanner
> **Roles:** student

## In this chapter
- The greeting hero and what it (doesn't) tell you
- Your four KPI cards at a glance
- Pending tests, performance trends, repeated questions
- Subject & performance tables — and their chart views
- The mandatory pre-assessment banner

## Getting here
- **From:** signed in as a student (Ch5) — the sidebar **Dashboard** link, or the default landing after sign-in
- **Ends at:** `/dashboard`, a read-only overview (actions live in Ch7–Ch9)

<!-- img: ch06-student-dashboard -->

## The greeting hero
A gradient banner at the top of every dashboard:

- Time-based greeting: **Good morning** (before12:00) · **Good afternoon** (before18:00) · **Good evening**
- **"Welcome back, {fname}!"** — your first name, title-cased for display (stored lower-cased; `capitalize()` upper-cases each word — Ch4)
- Subtitle: *"Here's an overview of your activity and performance."*

It's purely decorative — no data behind it.

## KPI cards
Four cards in a row (stack on small screens):

| Card | Shows | Notes |
|---|---|---|
| **Tests Completed** | count of tests you submitted | `0` for new accounts |
| **Questions Available** | questions reachable through your enrollments | `0` → you have no enrollments yet → [Ch7](ch07-my-enrollments.md) |
| **Overall Accuracy** | `…%` across your attempts | colored **green ≥70**, **yellow ≥50**, **red below** |
| **Topics Attempted** | distinct topics you've attempted | grows as you take tests |

Cards lift slightly on hover. Every value is `0` / `0%` until you enroll (Ch7) and take a test (Ch8/Ch9).

## Pending Tests card
Appears **only when at least one predefined test is waiting for you** (otherwise the whole card is hidden):

- Header: **Pending Tests** with a **View All** link → [Available Tests](ch09-available-tests-pre-assessment.md)
- Shows at most **three** rows; each: test title, `… min` · `… questions` · difficulty, and a badge — **Available** (green) or **Upcoming** (blue)
- Clicking any row (or View All) opens the full list (P06)

## Performance Trends
Card with a **table/chart toggle** (top-right) and three period tabs — **15 Days · 30 Days ·60 Days** (default15):

| Column | Content |
|---|---|
| Date | test date (browser locale) |
| Score | badge — **green ≥70%**, **yellow ≥50%**, **red below**, one decimal |
| Correct | questions you got right |
| Total | questions in that test |

- Empty period → *"No test data available for this period"*
- The toggle starts back at **table** every time you open the page (the choice isn't remembered)

## Repeated Questions
Appears only when there is data. Subtitle: *"Questions that appeared multiple times during time-based tests."* — that phenomenon is explained in [Ch12](ch12-time-based-tests.md).

| Column | Content |
|---|---|
| Question | question text (2-line clamp; hover for full text) |
| Subject / Topic | subject over smaller topic, both capitalized |
| Times Asked | how often it was served |
| Incorrect Answers | red badge when >0, green when0 |

## Subject Performance & Topic Performance
Two side-by-side cards, each with its own **table/chart toggle**:

**Subject Performance** (table view)

| Column | Content |
|---|---|
| Subject | capitalized name |
| Accuracy | progress bar + `…%` — bar is **red <50**, **orange <80**, **green ≥80** |
| Status | badge: **Strong** (green) · **Moderate** (yellow) · **Weak** (red) · **Insufficient** (gray) — classified server-side |

Chart view: radar chart of the same rows. No data → *"No data available"*.

**Topic Performance** (table view)

| Column | Content |
|---|---|
| Topic · Subject | capitalized names |
| Accuracy | same bar rules as above |
| Status | same badge set |

- The table lists only your **first five topics**; the bar-chart view covers all of them
- Empty → *"No data available"*

## The pre-assessment banner
When a mandatory pre-assessment is pending, an **amber banner** sits directly under the greeting hero (and also tops *My Tests* and *Available Tests*):

- Title: **⚠ Mandatory Pre-Assessment Required**
- Description: *"You must complete the pre-assessment before you can take any other tests. This helps us understand your baseline."*
- Button: **Start Pre-Assessment Now** — or **Resume Pre-Assessment** if you already have a session in progress

Clicking it opens the test room immediately (`/live-test?id=…`). The full gate logic — what it blocks and when it disappears — is [Ch9](ch09-available-tests-pre-assessment.md).

<!-- img: ch06-preassessment-banner -->

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Full-page spinner | dashboard series still loading | wait; slow backend → Ch5 health check |
| Red error text instead of the dashboard | API call failed | confirm backend on `:5001`, sign in again if the session expired (Ch4) |
| All KPIs `0`, "No data available" everywhere | brand-new account | enroll (Ch7), then take a test (Ch8/Ch9) |
| No *Pending Tests* card / no *Repeated Questions* card | simply no data — both are conditional | normal |
| No amber banner | you're not a student, or pre-assessment not required / already completed | normal |
| Name shows as "Jane Doe" though stored differently | names are stored lower-cased, then title-cased for display (Ch4) | by design |

## Roles & permissions
This body renders **only for the `student` role** — the greeting hero is shared, but teachers get the Teaching Dashboard (Ch14) and admins the admin dashboard (Ch20) at the same URL. Non-students never see the pre-assessment banner. Permission model: [Ch4](ch04-sessions-security-permissions.md).

## Related
- **Chapters:** [Ch4 — Sessions & Permissions](ch04-sessions-security-permissions.md) · [Ch5 — Getting Started](ch05-getting-started.md) · [Ch7 — My Enrollments](ch07-my-enrollments.md) · [Ch8 — My Tests](ch08-my-tests.md) · [Ch9 — Available Tests](ch09-available-tests-pre-assessment.md) · [Ch12 — Time-Based Tests](ch12-time-based-tests.md)
- **Screens:** P03 · **Appendices:** C (API) · E (errors)
