# Chapter 20 — The Admin Dashboard

> **Part:** VI — Administrator's Guide: People & Organization · **Phase:** 8
> **Covers:** P03 *(admin view of `/dashboard`)*
> **Roles:** admin (body); the page shell itself is shared with all roles

## In this chapter
- Reading the six KPI cards and knowing exactly what each number counts
- The **"Users by Location"** widget — table and chart views
- A recommended **first-time setup checklist** for a fresh installation (book guidance, not a screen)
- Why the admin dashboard has no clickable drill-downs

## Getting here
- **Menu path:** Dashboard *(top-level sidebar item)*
- **URL:** `/dashboard`
- **Requires:** any signed-in user; you see the admin body because your role is `admin`

The page opens with the shared gradient hero: a time-based greeting (**"Good morning"** / **"Good afternoon"** / **"Good evening"**), **"Welcome back, {fname}!"**, and *"Here's an overview of your activity and performance."* Below it, role detection renders `<AdminDashboard/>` (students and teachers get their own bodies — see [Ch6](ch06-your-dashboard.md) and [Ch14](ch14-teaching-dashboard.md)). The student-only pre-assessment banner never appears for admin.

<!-- img: ch20-admin-dashboard -->
<!-- img: ch20-users-by-location-chart -->

## Walkthrough

1. Sign in as an admin (F01, [Ch5](ch05-getting-started.md)) — you land on `/dashboard`.
2. Read the hero greeting, then the six KPI cards laid out in a responsive grid (1 column on mobile → 4 columns on wide screens; cards animate in with a staggered fade).
3. Scroll to the **"Users by Location"** card.
4. Click the **Chart** toggle (right side of the card header) to switch from the table to a bar chart; click **Table** to switch back.

### What the admin body fetches
One endpoint feeds the entire body: `GET /api/dashboard/stats`. While it loads you see a centered spinner (400px tall); on failure the error message renders as red text inside a card. If the failure mentions an invalid token, the page signs you out instead — sign in again ([Ch5](ch05-getting-started.md)).

> **Note:** unlike some dashboards you may have used, **nothing on this screen is a link**. The KPI cards and the location widget are display-only; use the sidebar (or the tables in later chapters) to navigate.

## Data on this screen

### KPI cards (StatisticsCard)
Each card shows a title, a colored icon tile, a large value, a small period label, and a pill badge.

| Title (exact) | Value source | Period label | Badge text |
|---|---|---|---|
| **Total Users** | `studentsCount` — i.e. the student count | Students | Active |
| **Total Teachers** | `totalTeachers` | Faculty | Active |
| **Total Questions** | `totalQuestions` | Question Bank | In Bank |
| **Total Topics** | `totalTopics` | All Topics | Total |
| **Total Subjects** | `totalSubjects` | Across Courses | Available |
| **Tests Submitted** | `testsSubmitted` | All Time | Total |

> **Tip:** despite its title, **"Total Users"** displays the number of *students* (its period label says "Students"). Use **All Users** ([Ch22](ch22-all-users.md)) to count people across every role.

### Users by Location
| Column | Meaning | Source |
|---|---|---|
| `#` | row number, sorted by user count descending | computed client-side |
| City | location city (capitalized) | `GET /api/dashboard/stats` → `usersByLocation[].city` |
| State | location state (capitalized) | `usersByLocation[].state` |
| Users | how many users are assigned to that location | `usersByLocation[].user_count` |

The card header also shows a running total: **"(N total users)"** — the sum of all `user_count` values. The **Chart** view renders the same data as a bar chart (series labeled "Users"); it loads lazily, so you may briefly see a gray pulse placeholder. Empty dataset → the table shows *"No location data available"*.

## First-time setup checklist

This is **book guidance** — there is no setup-wizard screen in the app. A brand-new installation is empty; work through these steps in order (each links to the chapter that owns the task):

1. Add your branches/centers under **Locations** — [Ch21](ch21-locations.md).
2. Build the course hierarchy: courses → subjects → topics (Ch26, *Administrator's Guide: Content*).
3. Fill the question bank — create questions by hand ([Ch17](ch17-question-bank.md)) or bulk-import from Excel ([Ch18](ch18-importing-questions.md)).
4. Design and activate tests ([Ch19](ch19-designing-managing-tests.md)); predefined tests produce the share links students join with.
5. Have students sign up themselves ([Ch5](ch05-getting-started.md), F02) and enroll in courses ([Ch7](ch07-my-enrollments.md)).
6. Verify people and their locations as they appear — [Ch22](ch22-all-users.md), [Ch24](ch24-students.md) — and review progress from student profiles ([Ch25](ch25-student-profiles-performance.md)).

> **Note:** teachers are assigned to courses through their own enrollments ([Ch15](ch15-teaching-enrollments.md)); you cannot do it from this screen.

## Roles & permissions
- **admin** — sees the KPI body and the location widget described here.
- **teacher** — same URL, different body ([Ch14](ch14-teaching-dashboard.md)).
- **student** — same URL, different body plus the pre-assessment banner ([Ch6](ch06-your-dashboard.md)).
- Route group: `/dashboard` home is open to any authenticated role (inventory §9).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Red error text in a card instead of KPIs | `GET /api/dashboard/stats` failed (backend down, network, or a 4xx/5xx) | ensure the backend is running on `:5001` and retry ([Ch5](ch05-getting-started.md) troubleshooting) |
| You are returned to `/signin` while loading | the stored token was rejected as invalid and the page auto-logs-out | sign in again; if it repeats, your session was revoked (see Ch4) |
| **"No location data available"** inside Users by Location | no users are assigned to any location yet | assign locations from **All Users** ([Ch22](ch22-all-users.md)) |
| KPI values all read `0` | fresh database with no content | follow the setup checklist above |

## Related
- **Chapters:** [Ch5 — Getting Started](ch05-getting-started.md) · [Ch6 — Your Dashboard](ch06-your-dashboard.md) · [Ch14 — The Teaching Dashboard](ch14-teaching-dashboard.md) · [Ch21 — Locations](ch21-locations.md) · [Ch22 — All Users](ch22-all-users.md)
- **Screens:** P03 *(admin view)*
- **Endpoints:** `GET /api/dashboard/stats` (details: Appendix C)
