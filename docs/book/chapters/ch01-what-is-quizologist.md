# Chapter1 — What Is Quizologist

> **Part:** I — Understanding the Application · **Phase:**3
> **Covers:** application overview (P01–P29), personas
> **Roles:** all

## In this chapter
- What Quizologist is and who it is for
- What each of the three roles — student, teacher, admin — actually does
- How this book is organized so you can find answers fast

## Getting here
- **Applies to:** the whole application (conceptual chapter — nothing to open)
- **The first screen you will ever see:** `/signin`

Quizologist is an online teaching-and-testing platform for coaching institutes. Through it, an organization maintains its courses and teaching staff, builds a reusable question bank, runs tests — from quick practice sessions to scheduled exams — and tracks how students perform over time. Everything happens in one application, shared by three kinds of people.

<!-- img: ch01-app-overview-dashboard -->

## The three people

| Persona | What your day looks like | You sign in as |
|---|---|---|
| **Student** | Enroll in courses, take tests (practice and assigned), review scores and question-by-question results, watch your performance improve | `student` (self-registration offers this) |
| **Teacher** | Enroll to teach courses, keep an eye on your students, author questions, import banks from Excel, design and run tests | `teacher` (self-registration offers this) |
| **Admin** | Provision people and locations, define the course/subject/topic structure, curate the question bank, manage tests, read organization-wide analytics | `admin` (created by setup — not open for self-signup) |

One account, one role. The interface you see, the menus in your sidebar, and even the pages you are allowed to open all follow from your role.

## What each role can do

### Student
| Menu label | Route | You can… |
|---|---|---|
| Dashboard | `/dashboard` | see KPIs and performance charts (Ch6) |
| My Enrollments | `/dashboard/enrollments` | enroll in courses/subjects/topics, unenroll (Ch7) |
| My Tests | `/dashboard/my-tests` | start practice tests, resume, view history and results (Ch8) |
| Available Tests | `/dashboard/tests/pending` | start assigned/predefined tests, complete the pre-assessment (Ch9) |
| *(test rooms)* | `/live-test`, `/tb-live-test`, `/test-result` | take tests and review results (Parts III–IV) |

### Teacher
| Menu label | Route | You can… |
|---|---|---|
| Dashboard | `/dashboard` | see teaching widgets: top students, weaknesses, coverage (Ch14) |
| My Enrollments | `/dashboard/teacher-enrollments` | enroll to teach courses and subjects (Ch15) |
| Students | `/dashboard/students` | browse the student directory, assign locations (Ch16) |
| Questions ▸ All Questions | `/dashboard/questions` | author and edit questions (Ch17) |
| Questions ▸ Import Excel | `/dashboard/questions/import` | bulk-import a question bank (Ch18) |
| Tests ▸ View / Manage | `/dashboard/tests`, `/dashboard/tests/manage` | design, activate and monitor tests (Ch19) |

### Admin
Everything the teacher has, plus:

| Menu label | Route | You can… |
|---|---|---|
| Users ▸ All / Students / Teachers | `/dashboard/users…` | review every account, assign locations (Ch22–24) |
| Courses ▸ Courses / Subjects / Topics | `/dashboard/courses…` | define the content hierarchy (Ch26) |
| Locations | `/dashboard/locations` | manage branches (Ch21) |
| Analytics | `/dashboard/analytics` | read organization-wide reports (Ch29–30) |
| *(student profiles)* | `/dashboard/users/students/[id]` | inspect any student's full performance (Ch25) |

## How this book is organized

| Part | Read it when… |
|---|---|
| I — Understanding the Application | you are new and want the big picture (Ch1–4) |
| II — Getting Started | you need to install, run, or sign in for the first time (Ch5) |
| III — The Student Handbook / IV — Taking Tests | you study or support students (Ch6–13) |
| V — The Teacher Handbook | you teach: students, questions, tests (Ch14–19) |
| VI–VII — Administrator's Guides | you run the platform: people, content, analytics (Ch20–30) |
| Appendices A–G | you are stuck: every form, column, endpoint, error and rule in one place |

Chapters are self-contained: each one shows how to reach the screen, what every button does, what each field and column means, and what to do when something looks wrong. Screens are tagged with short codes (P04, D07…) that map to the master inventory if you ever need the underlying detail.

## Roles & permissions
Your role decides the sidebar you see and the pages you may open; a page outside your role shows a **"404 — Page not found"** screen rather than an error. The complete permission matrix is in [Ch4 — Sessions, Security & Permissions](ch04-sessions-security-permissions.md) and, in full, in Appendix D.

## When things go wrong

| You see | Because | Fix |
|---|---|---|
| "404 — Page not found" while signed in | you opened a URL your role doesn't allow — guards show404 deliberately | use your sidebar; check the matrix in Ch4 |
| Every table says "No data found." | the list is empty for your scope (not an error) | students: enroll first (Ch7); staff: content must exist (Ch20/26) |
| You followed a link and landed on sign-in | that screen requires a session (or yours expired) | sign in (Ch5) — you'll be returned to what you wanted |
| You registered but see no admin menus | self-signup creates students and teachers only | admin accounts are provisioned during setup (Ch5) |

## Related
- **Chapters:** [Ch2 — Core Concepts & Domain Model](ch02-core-concepts-domain-model.md) · [Ch4 — Sessions, Security & Permissions](ch04-sessions-security-permissions.md) · [Ch5 — Getting Started](ch05-getting-started.md)
- **Screens:** P01–P29 (overview) · **Appendices:** D (permissions), F (FAQ)
