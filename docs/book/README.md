# Quizologist — The Complete Guide (Ebook)

> **Phase 2 deliverable:** book structure, table of contents, and writing conventions.
> Screenshots are captured at the **end** (Phase12) via Chrome MCP; chapters written earlier carry image placeholders registered in [`CAPTURE-MANIFEST.md`](CAPTURE-MANIFEST.md).
> Every chapter cites the entity IDs from [`00-INVENTORY.md`](00-INVENTORY.md) (P##/D##/F##/M##).

## How this book is organized

| Part | Contents | Written in |
|---|---|---|
| **I — Understanding the Application** | What the product is, domain model, architecture, security | Phase3 (Ch1–4) |
| **II — Getting Started** | Install, run, first login, accounts & errors | Phase4 (Ch5) |
| **III — The Student Handbook** | Dashboard, enrollments, tests, pre-assessment | Phase5 (Ch6–9) |
| **IV — Taking Tests** | Joining, live room, time-based, results | Phase6 (Ch10–13) |
| **V — The Teacher Handbook** | Teaching dashboard, students, question bank, import, test design | Phase7 (Ch14–19) |
| **VI — Administrator's Guide: People & Organization** | Dashboard, locations, users, teachers, students, profiles | Phase8 (Ch20–25) |
| **VII — Administrator's Guide: Content, Tests & Analytics** | Hierarchy, question bank, tests, analytics, metrics | Phase9 (Ch26–30) |
| **Appendices A–G** | Forms, data dictionary, API, permissions, errors, FAQ, security | Phase10 |
| *(Images)* | Environment prep → capture → integration | Phases11–13 |

## Master table of contents

Status: ⬜ not started · 🟡 in progress · ✅ written · 🖼️ images integrated (Phase13).

### Part I — Understanding the Application *(Phase3)*

| # | Title | Covers (inventory IDs) | Status |
|---|---|---|---|
| 1 | What Is Quizologist | product overview, personas (admin/teacher/student), feature map | ✅ |
| 2 | Core Concepts & Domain Model | M01–M15 relationships, test types (ad-hoc/predefined/live/time-based/pre-assessment), **glossary** | ✅ |
| 3 | How the Application Works | architecture (Next → proxy → Express → PG/Redis/sockets), request & socket lifecycle, data flow | ✅ |
| 4 | Sessions, Security & Permissions | cookies/refresh/revocation (§inventory8), password policy, rate limits (RL1/RL2), roles × features matrix | ✅ |

### Part II — Getting Started *(Phase4)*

| # | Title | Covers | Status |
|---|---|---|---|
| 5 | Getting Started | requirements, run backend+frontend, env reference, seed admin, P01 first visit, F01 sign-in, F02 sign-up, validation & error messages, logout/session lifecycle, startup troubleshooting | ✅ |

### Part III — The Student Handbook *(Phase5)*

| # | Title | Covers | Status |
|---|---|---|---|
| 6 | Your Dashboard | P03 student view: KPIs, performance charts, pre-assessment banner | ✅ |
| 7 | My Enrollments | P04, D07 *(D07 owner)* | ✅ |
| 8 | My Tests | P05, D10 *(D10 owner)*, history KPIs, resume/abandon | ✅ |
| 9 | Available Tests & Pre-Assessment | P06, filters, pre-assessment flow (A13 precondition), join-link concept | ✅ |

### Part IV — Taking Tests *(Phase6)*

| # | Title | Covers | Status |
|---|---|---|---|
| 10 | Joining a Test | P26 canonical share-link join; P25 legacy footnote (A01); schedule gating | ✅ |
| 11 | The Live Test Room | P27: palette, timer, auto-save, socket events, disconnect/heartbeat, submit | ✅ |
| 12 | Time-Based Tests | P28, `tb:*` events, differences from live | ✅ |
| 13 | Results & Review | P29, score cards, per-question review, where results live | ✅ |

### Part V — The Teacher Handbook *(Phase7)*

| # | Title | Covers | Status |
|---|---|---|---|
| 14 | The Teaching Dashboard | P03 teacher view, teaching analytics widgets (top students, weaknesses, coverage) | ✅ |
| 15 | Teaching Enrollments | P07, D08 *(D08 owner)* | ✅ |
| 16 | Working with Students | P08, D09 *(D09 owner)*, detail-page limitation (A09) | ✅ |
| 17 | The Question Bank | P09, D05 *(owner)*, D06 *(owner)*, filters, undo quirk (A11) | ✅ |
| 18 | Importing Questions from Excel | P10, F04 *(owner)* incl. admin-only "Create Missing Entities" step | ✅ |
| 19 | Designing & Managing Tests | P11, P12 + F03 *(owner)*, P13, P14 + D11/D12 *(owners)*, P15 | ✅ |

### Part VI — Administrator's Guide: People & Organization *(Phase8)*

| # | Title | Covers | Status |
|---|---|---|---|
| 20 | The Admin Dashboard | P03 admin view, KPI cards (display-only, no drill-downs), Users-by-Location widget, **first-time setup checklist** | ✅ |
| 21 | Locations | P23, D04 *(owner)*, central-location protection | ✅ |
| 22 | All Users | P16, assign/remove location workflow (D09 → cross-ref Ch16) | ✅ |
| 23 | Teachers | P17 roster | ✅ |
| 24 | Students | P18 roster | ✅ |
| 25 | Student Profiles & Performance | P19, details payload, test-history table | ✅ |

### Part VII — Administrator's Guide: Content, Tests & Analytics *(Phase9)*

| # | Title | Covers | Status |
|---|---|---|---|
| 26 | Courses, Subjects & Topics | P20, P21, P22 + D01/D02/D03 *(owners)*, hierarchy rules, delete-with-undo | ⬜ |
| 27 | Question Bank — Administrator View | P09 admin differences, authorship (questionAddedBy), cross-ref Ch17 | ⬜ |
| 28 | Tests — Administrator View | P11/P13/P14/P15 admin differences (all-student scope), cross-ref Ch19 | ⬜ |
| 29 | Analytics Dashboard | P24, filters, each chart + its endpoint | ⬜ |
| 30 | Metrics & Reports Reference | every KPI/card/metric: definition, source endpoint, tables used | ⬜ |

### Appendices *(Phase10)*

| # | Title | Covers | Status |
|---|---|---|---|
| A | Forms & Fields Dictionary | every form (D01–D13, F01–F04): condensed field + rule index (compiled from chapters) | ⬜ |
| B | Data Dictionary | every table/card: column → meaning → source | ⬜ |
| C | API Reference | all `/api` endpoints by module: method, path, auth, validation | ⬜ |
| D | Roles × Features Matrix | full permission matrix (extends inventory §1) | ⬜ |
| E | Error & Message Catalog |400/401/403/404/429 formats, validation messages, toast texts, socket errors | ⬜ |
| F | FAQ & Troubleshooting | common confusions, per anomalies A01–A14 where user-visible | ⬜ |
| G | Security Model & Sessions | cookies, tokens, password policy, rate limits, what admins should know | ⬜ |

## Single-owner rule (prevents duplicate field tables)

The **first chapter in book order** that documents a form/table owns its full field/column table. Later chapters get a one-line behavior note + cross-reference. Compiled quick-reference versions land in Appendices A/B during Phase10.

| Entity | Owner chapter | Referenced from |
|---|---|---|
| F01 SignInForm / F02 SignUpForm | Ch5 | Ch4 (policy visual only) |
| D07 EnrollDialog | Ch7 | — |
| D10 StartTestDialog | Ch8 | — |
| D09 AssignLocationDialog | Ch16 | Ch22, Ch23, Ch24 |
| D05 AddQuestion / D06 EditQuestion | Ch17 | Ch27 |
| F04 Import wizard | Ch18 | Ch27 |
| F03 Test-create wizard, D11/D12 selectors | Ch19 | Ch28 |
| D04 AddLocationDialog | Ch21 | — |
| D01/D02/D03 Course/Subject/Topic dialogs | Ch26 | Ch20 (checklist), Ch14 (context) |
| P09/P10/P11–P15 (admin+teacher pages) | Ch17/18/19 (workflow) | Ch27/Ch28 (admin differences only) |
| P03 dashboard | Ch6 (student), Ch14 (teacher), Ch20 (admin) | — |
| Tables/columns (all) | chapter that renders them | Appendix B (compiled) |
| API endpoints (all) | not in chapters — prose only | Appendix C (canonical) |

## Writing rules — short form (full spec in [TEMPLATE.md](TEMPLATE.md))

1. **Every claim traces to the inventory or source code.** If it isn't in `00-INVENTORY.md`, verify before writing.
2. **Do not document anomalies as intended behavior.** Handle per inventory §12: A01 legacy page = footnote; A09 teacher404 = stated limitation; A14 "Forgot password" = "not yet functional"; 🔒 items (A04/A05/A06) are **never** described as features — they were reported separately.
3. Image placeholders use the exact syntax `<!-- img: chNN-slug -->`; register every placeholder in `CAPTURE-MANIFEST.md` **in the same commit/step as the chapter**.
4. UI labels are quoted **as rendered** ("Available Tests"), routes as code (`/dashboard/tests/pending`).
5. Field/column tables follow TEMPLATE formats; one owner per table (rule above).
6. Backend behavior (validation rules, limits, defaults) comes from inventory §6/§9 — never from the stale `backend/*/API.md`.

## Phase status

| Phase | Deliverable | Status |
|---|---|---|
|1 Discovery & inventory | `00-INVENTORY.md` | ✅ |
|2 Architecture & standards | this file, `TEMPLATE.md`, `CAPTURE-MANIFEST.md`, folders | ✅ |
|3 Front matter Ch1–4 | `chapters/ch01…ch04` | ✅ |
|4 Getting started Ch5 | `chapters/ch05-getting-started.md` | ✅ |
|5 Student Ch6–9 | `chapters/ch06…ch09` (4 files) | ✅ |
|6 Test-taking Ch10–13 | `chapters/ch10…ch13` (4 files) | ✅ |
|7 Teacher Ch14–19 | `chapters/ch14…ch19` (6 files) | ✅ |
|8 Admin people Ch20–25 | `chapters/ch20…ch25` (6 files) | ✅ |
|9 Admin content Ch26–30 | | ⬜ |
|10 Appendices A–G | | ⬜ |
|11 Screenshot env prep | seed script + manifest validation | ⬜ |
|12 Capture (Chrome MCP) | `images/*.png` | ⬜ |
|13 Integration & QA | placeholders → figures, QA sweep, export | ⬜ |

## Folder layout

```
docs/book/
├── README.md               ← this file (TOC, ownership, rules)
├── 00-INVENTORY.md         ← Phase1 source of truth (IDs)
├── TEMPLATE.md             ← chapter template + style guide
├── CAPTURE-MANIFEST.md     ← every image slot (filled as chapters are written)
├── chapters/               ← ch01…ch30 + appendix files (written Phases3–10)
└── images/                 ← chNN-slug.png (captured Phase12, integrated Phase13)
```
