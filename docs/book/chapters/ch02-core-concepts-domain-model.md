# Chapter2 — Core Concepts & Domain Model

> **Part:** I — Understanding the Application · **Phase:**3
> **Covers:** M01–M15 (relationships), test types, lifecycles, glossary
> **Roles:** all

## In this chapter
- The building blocks: courses, subjects, topics, questions — and how people connect to them
- The four ways to test a student, and the status lifecycle of each
- A glossary of every term the rest of this book uses

## Getting here
- **Applies to:** the whole application (conceptual chapter)

Everything in Quizologist hangs off a small number of nouns. Learn these once and every screen will make sense.

## The content hierarchy

```
Course            "Computer Science"
  └── Subject     "Data Structures"          (a course contains subjects)
        └── Topic "Binary Trees"             (a subject contains topics)
              └── Question                   (a topic contains questions)
```

| Entity | What it is | Managed by | Where |
|---|---|---|---|
| **Course** | A whole program of study | admin | Ch26 |
| **Subject** | A branch of a course | admin | Ch26 |
| **Topic** | A chapter inside a subject | admin | Ch26 |
| **Question** | One MCQ or descriptive item, always attached to course + subject + topic | admin, teacher | Ch17/18 |

**Question essentials:** type is `mcq` (2–5 choices, exactly one correct) or `descriptive` (written answer); difficulty is one of **beginner · normal · mid · hard · expert** (default *normal*); a question may carry an explanation and a video URL, and it remembers who added it. Questions are never orphaned — creating one requires picking course, subject and topic first:

<!-- img: ch02-content-hierarchy-cascade -->

**Locations** are *organization* structure, not content: a location is a branch/office that people (users) belong to. Content itself is shared across locations.

## People and how they connect

| Concept | Meaning |
|---|---|
| **User** | An account with exactly one role: `admin`, `teacher` or `student` (M01) |
| **Location** | The branch a user belongs to (optional; admins assign it) |
| **Enrollment** | A student's subscription to a course — optionally narrowed to specific subjects/topics; picking "All Subjects"/"All Topics" means the whole branch (Ch7) |
| **Teacher assignment** | A teacher mapped to a whole course, or to specific subjects within it; it decides which courses they see when authoring questions and tests (Ch15) |

```
locations ──1:N── users ──1:N── enrollments ──N:1── courses/subjects/topics
                    └────1:N── teacher_assignments ──N:1── courses (─ subjects)
courses ──1:N── subjects ──1:N── topics ──1:N── questions
```

## The four ways to test

| # | Test kind | Who starts it | Where | Chapter |
|---|---|---|---|---|
| 1 | **Standard practice test** (adaptive) | student, on the spot — picks duration, question count, subjects | "My Tests" ▸ Start Test | Ch8 |
| 2 | **Time-based practice test** | student, on the spot — fixed wall-clock duration | "My Tests" ▸ Start Test (time-based) | Ch8/12 |
| 3 | **Predefined test** | teacher/admin authored in advance; students find it in **"Available Tests"** or via a **share link** | wizard → activate → join | Ch9/10/19 |
| 4 | **Pre-assessment** | a predefined test *flagged* as pre-assessment — students must complete it before the dashboard and new-test buttons unlock | assigned like #3 | Ch9 |

**Predefined test lifecycle** (authored in Ch19):

```
draft ──activate──▶ active ──deactivate──▶ inactive        (archived = retired)
        (creator only; a test needs questions first)
```

- **Schedule:** optional start/end window with a timezone — students can only join inside it.
- **Fixed questions:** optionally the author pins an exact question set, often with a per-difficulty ratio (e.g.20% beginner,40% mid…).
- **Specific students:** optionally a test is restricted to a named roster instead of everyone with access.
- **Share link:** each test carries a secret token in its URL (`/test/join/…`); anyone the link is sent to opens the join screen (Ch10).

**Attempt lifecycle** (any test once started — stored as a *test session*, M11):

```
pending ──start──▶ in_progress ──submit──▶ completed
                        └── no submit / give up ──▶ abandoned
```

## Results, scores and skill rating

- An attempt stores total, attempted, skipped, **correct/incorrect** counts and a **score**; each answer is kept individually so results can be replayed question-by-question (Ch13).
- Every completed attempt updates a per-student **skill rating** — a score from1.0 upward with streak tracking — visible as a dashboard widget (Ch6).
- Dashboards and analytics aggregate attempts; teacher widgets surface *top students*, *weakness summaries* and *question coverage* (Ch14), admin analytics roll everything up per location (Ch29–30).

## Where it all lives (storage map)

| Group | Tables | Detail |
|---|---|---|
| People | `users`, `locations`, `enrollments`, `teacher_assignments`, `user_skill_ratings` | Appendix B |
| Content | `courses`, `subjects`, `topics` | Appendix B |
| Question bank | `questions` | Appendix B |
| Test definitions | `predefined_tests`, `predefined_test_questions`, `predefined_test_students` | Appendix B |
| Attempts | `test_sessions`, `test_answers`, `test_selections` | Appendix B |

## Glossary

| Term | Means | Chapter |
|---|---|---|
| Attempt / test session | one student's run through one test | Ch2 |
| Abandoned | attempt left without submitting | Ch8 |
| Active / Draft / Inactive / Archived | predefined-test statuses (see lifecycle above) | Ch19 |
| Adaptive | standard practice test where the server selects questions within your chosen scope | Ch8 |
| Central location | the protected default branch — cannot be edited/deleted | Ch21 |
| Difficulty ratio | per-difficulty percentage split used when authoring with "mixed" difficulty | Ch19 |
| Enrollment | student's course subscription (optionally subject/topic-scoped) | Ch7 |
| Fixed questions | an exact, author-pinned question set for a predefined test | Ch19 |
| Join link / test link token | secret URL that opens a predefined test's join screen | Ch10 |
| Pre-assessment | prerequisite test that gates the student dashboard | Ch9 |
| Predefined test | an authored, configurable test (#3 above) | Ch19 |
| Question bank | all questions across all topics | Ch17 |
| Share link | same as join link | Ch10 |
| Skill rating | per-student performance score with streaks | Ch6 |
| Ticket | short-lived credential the test room uses to open its live connection | Ch11 |

## Roles & permissions
- **Admin** defines locations, the course/subject/topic hierarchy, and all people.
- **Teacher** authors questions and tests within their assigned teaching scope.
- **Student** enrolls, takes tests, and sees only their own data.
Full matrix: [Ch4](ch04-sessions-security-permissions.md) / Appendix D.

## When things go wrong

| You see | Because | Fix |
|---|---|---|
| "Start Test" is disabled and you were pushed into a test screen | a **pre-assessment** is pending for you — it gates the dashboard until completed | finish the pre-assessment (Ch9) |
| You can't find the test a link was supposed to open | share links open at `/test/join/…` — or the schedule window hasn't started/expired | Ch10 — check the window, ask the author to re-activate |
| A course/subject is missing from your picker | your enrollment/teaching assignment doesn't include it | students: enroll (Ch7); teachers: ask admin (Ch15) |
| Results don't appear on dashboards yet | dashboards cache for about5 minutes | wait a few minutes (Ch3) |

## Related
- **Chapters:** [Ch3 — How the Application Works](ch03-how-application-works.md) · [Ch9 — Available Tests & Pre-Assessment](ch09-available-tests-pre-assessment.md) · [Ch19 — Designing & Managing Tests](ch19-designing-managing-tests.md)
- **Screens/Entities:** M01–M15 · **Appendices:** B (data dictionary), G (security terms)
