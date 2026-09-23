# Chapter 14 — The Teaching Dashboard

> **Part:** V — The Teacher Handbook · **Phase:** 7
> **Covers:** P03 `/dashboard` *(teacher view)*
> **Roles:** teacher

## In this chapter
- Reading the four KPI cards at the top of your dashboard
- Using the three analytics widgets — Top Students, Topics Needing Attention, Question Coverage by Topic
- Switching any widget between **Table** and **Chart** views
- Where every number comes from (and why the cards don't click through anywhere)

## Getting here
- **Menu path:** Main ▸ Dashboard
- **URL:** `/dashboard`
- **Requires:** teacher role; signed-in session

<!-- img: ch14-teacher-dashboard -->

## The greeting hero
The banner at the top is **shared with the student dashboard** — see [Ch6 — Your Dashboard](ch06-your-dashboard.md). It shows:

- A time-of-day tag: **"Good morning"** (before 12:00) / **"Good afternoon"** (before 18:00) / **"Good evening"**
- **"Welcome back, {first name}!"**
- The line *"Here's an overview of your activity and performance."*

Below the hero, the teacher-specific content renders: four KPI cards, then three analytics widgets.

## KPI cards (top row)

The cards come from the shared `StatisticsCard` component: big value, a **period** caption, and a colored change badge. They are **display-only** — no card links anywhere. All four read from `GET /api/dashboard/stats`.

| # | Title | Big value | Change badge | Period caption |
|--:|---|---|---|---|
| 1 | **Questions Added** | `questionsAdded` | "Created" | "By You" |
| 2 | **Students in Courses** | `studentsInCourses` | "Enrolled" | "Your Courses" |
| 3 | **Tests Submitted** | `testsSubmitted` | "Completed" | "By Students" |
| 4 | **Questions in Courses** | `questionsInCourses` | "Available" | "Your Courses" |

Cards sit in a responsive grid (1 → 2 → 3 → 4 columns) and lift slightly on hover.

> **Note:** The teacher-analytics endpoint (`/api/dashboard/teacher/{teacherId}`) is **not** used by this screen — the dashboard reads only the stats endpoint plus the three teaching endpoints below (inventory P03).

## The three analytics widgets

Each widget is a card with a titled header (icon + title) and a **ViewToggle** in the top-right corner offering **Table** / **Chart**. The empty state and the data source differ per widget:

<!-- img: ch14-widget-chart-view -->

### Top Students
- **Icon/title:** 🏆 (yellow trophy) **"Top Students"**
- **Table view:** one row per student — `#1` rank, the student's name, *"{n} tests"* underneath, and the average score right-aligned as a bold percentage (`58.3%`). The list scrolls inside a max-height box (top 10 by the endpoint).
- **Chart view:** a bar chart of `avgScore` for the **top 5** students (name on the X axis).
- **Empty state:** *"No student data available."*
- **Source:** `GET /api/teacher/teaching/top-students` (limit 10)

### Topics Needing Attention
- **Icon/title:** ⚠️ (orange alert triangle) **"Topics Needing Attention"**
- **Table view:** top **5** rows — topic name, then *"Subject • Course"* in small muted text, and on the right the weak-vs-total count in orange (`3/12`) with *"{avgAccuracy}% avg"* underneath.
- **Chart view:** a **radar chart** of average accuracy (0–100 scale) for the top **6** topics.
- **Empty state:** *"No weak topics identified."*
- **Source:** `GET /api/teacher/teaching/weakness-summary` (limit 10)

### Question Coverage by Topic
- **Icon/title:** 📘 (blue book) **"Question Coverage by Topic"**
- **Table view:** a real table with four columns (documented below).
- **Chart view:** a bar chart of question `count` for the **top 10** topics (long topic labels truncate past 12 characters).
- **Empty state:** *"No question data available."*
- **Source:** `GET /api/teacher/teaching/question-coverage` (limit 10)

## Data on this screen

### Question Coverage table
| Column | Meaning | Source |
|---|---|---|
| Topic | topic name | `…/question-coverage` → `topicName` |
| Subject | parent subject of the topic | `subjectName` |
| Course | parent course of the topic | `courseName` |
| Questions | how many questions exist in the topic | `count` (right-aligned, bold) |

### KPI cards
| Column | Meaning | Source |
|---|---|---|
| Title / value / badge / period | the four static captions and the live number | `GET /api/dashboard/stats` |

### Widgets (shared behavior)
| Column | Meaning | Source |
|---|---|---|
| Table ⇄ Chart | per-widget view toggle, remembered in component state | `ViewToggle` |
| Empty message | shown when the endpoint returns no rows | widget-specific (listed above) |

**Loading / errors:** while fetching, the dashboard shows a centered spinner in a `min-h-[400px)` area (all widgets load together). On failure the whole widget area is replaced by a card containing the error message in red (`text-destructive`); an expired token logs you out and returns you to sign-in (see [Ch5 — Getting Started](ch05-getting-started.md)).

## Roles & permissions
- **Teacher** — this is the teacher view of P03; all four KPIs and all three teaching widgets are yours.
- **Student / admin** — see their own dashboard variants instead ([Ch6](ch06-your-dashboard.md) and Ch20 respectively); the greeting hero is shared by all three.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Spinner that never resolves / instant sign-out | token expired or backend (:5001) not running | sign in again; check the backend is up ([Ch5](ch05-getting-started.md)) |
| Red error card instead of widgets | one of the four endpoints failed (server error, no permissions) | reload; if it persists, ask your admin to check the backend log |
| *"No student data available."* in Top Students | no student has completed a test in your courses yet | assign/launch a test — widget fills once results exist ([Ch19](ch19-designing-managing-tests.md)) |
| *"No weak topics identified."* | nobody scored low enough on any topic to qualify as "weak" | nothing to fix — it means performance is fine |
| *"No question data available."* | no questions exist for your courses' topics | add questions or import them ([Ch17](ch17-question-bank.md), [Ch18](ch18-importing-questions.md)) |
| KPI card shows `0` | fresh account, or stats endpoint returned no rows | cards are read-only; numbers appear as data accrues |

## Related
- **Chapters:** [Ch6 — Your Dashboard (shared hero)](ch06-your-dashboard.md) · [Ch15 — Teaching Enrollments](ch15-teaching-enrollments.md) · [Ch17 — The Question Bank](ch17-question-bank.md) · [Ch19 — Designing & Managing Tests](ch19-designing-managing-tests.md) · Ch20 (admin dashboard) · Ch30 (metric reference)
- **Screens:** P03
- **Endpoints:** `GET /api/dashboard/stats`, `GET /api/teacher/teaching/top-students`, `GET /api/teacher/teaching/weakness-summary`, `GET /api/teacher/teaching/question-coverage` (details: Appendix C)
