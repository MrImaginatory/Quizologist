# Chapter8 — My Tests

> **Part:** III — The Student Handbook · **Phase:**5
> **Covers:** P05, **D10 StartTestDialog (owner)**, D13 "Abandon Test?"
> **Roles:** student

## In this chapter
- Your test history — KPIs, columns, pagination, every action
- Designing and launching an ad-hoc test (the full Start New Test dialog)
- Resuming, abandoning, viewing results
- What the pre-assessment gate does to the Start button

## Getting here
- **From:** sidebar → **My Tests** (straight to `/dashboard/my-tests`)
- **Ends at:** history + the **Start Test** button

<!-- img: ch08-my-tests-history -->

## The page
- If a pre-assessment is pending, the amber banner sits on top (see [Ch6](ch06-your-dashboard.md) / [Ch9](ch09-available-tests-pre-assessment.md))
- Header: **"My Tests"** / *"View your test history and performance"* — **▶ Start Test** on the right
- The Start button is **disabled while the pre-assessment is pending** (hover shows *"Complete the pre-assessment first"*) — see the gate at the end of this chapter

## KPI cards

| Card | Shows |
|---|---|
| **Total Tests** | your completed count — **identical to the "Completed" card** (known display quirk, inventory **A10**: the true total isn't displayed) |
| **Completed** | the same completed count |
| **Average Score** | mean score of the completed tests **on the page you're viewing**, one decimal + `%` |

→ Because the average is **page-scoped**, it changes as you paginate — that's A10 too, described here as actual behavior.

## Test History table — P05 owns these columns

Title: **Test History** · pagination footer: page navigation + rows-per-page (default **10**).

| # | Content |
|---|---|
| **#** | row number on the current page |
| **Test ID** | monospace internal ID of the attempt |
| **Status** | badge — **Completed** (green) · **In Progress** (blue) · **Abandoned** (red) |
| **Score** | **green ≥70%**, **yellow ≥50%**, **red below**; `x.x%`, or `-` when there is no score |
| **Correct** | `right / total questions` |
| **Date** | start date (browser locale), or `-` |
| **Actions** | *In Progress* → **Resume** + red **✕** · *Completed* → **View* · otherwise empty |

**Action routing:** Resume → `/live-test?id=…` ([Ch11](ch11-live-test-room.md)) · View → `/test-result?id=…` ([Ch13](ch13-results-analytics.md)) · ✕ → abandon dialog below.

## Starting a new test — D10 "Start New Test" *(owner: this chapter)*

Opened by **▶ Start Test**. Title: **"Start New Test"** (play icon) · Description: *"Configure your test settings and select topics to test on."*

### Controls

| Control | Required | Behavior |
|---|:-:|---|
| **Test Type** | ✓ | pill toggle **Standard** (default) / **Time-Based** |
| **Duration (Minutes) \*** | ✓ | *Standard:* preset select — see range table. *Time-Based:* free number, min **1**, default **30** |
| **Questions \*** | ✓ (Standard only) | numeric; on blur it clamps to the duration's range shown underneath (*"Min: x \| Max: y"*). Choosing a different duration re-clamps the current value |
| **Test Selections \*** | ✓ | up to **3** selection blocks (below) |

**Standard duration → question range** (the dialog's Min/Max hint):

| Duration |15 min |20 min |25 min |30 min |40 min |45 min |
|---|---|---|---|---|---|---|
| Questions |15–30 |20–40 |25–50 |30–60 |30–80 |40–120 |

**Each selection block** (labeled *Selection 1…3*, removable with **✕** while more than one exists; **＋ Add** appears while under three):

| Field | Required | Behavior |
|---|:-:|---|
| **Course \*** | ✓ | searchable select listing **only courses you're enrolled in** ([Ch7](ch07-my-enrollments.md)). Changing it clears the block's subjects/topics |
| **Subjects** | ✗ | searchable checkbox list with **Select All**; appears after a course. Picking any subject clears topics |
| **Topics** | ✗ | searchable checkbox list; appears after ≥1 subject |

### Walkthrough
1. **▶ Start Test** → dialog opens (Standard,30 min,45 questions).
2. Optionally switch to **Time-Based** and type a duration.
3. In *Test Selections*, pick your course (searchable).
4. Tick subjects and/or topics — or leave them to draw from the whole course.
5. Press **Start Test** (disabled until a course + valid duration exist).

### Validation, payload, launch
- No course anywhere → red inline: **"Please select at least one course"**
- No enrollments → course select shows *"No courses found."* → enroll first (Ch7)
- **Standard:** request carries duration, question limit, your selections and `adaptive: true` → toast **"Test started successfully!"** → `/live-test?id=…` ([Ch11](ch11-live-test-room.md))
- **Time-Based:** → toast **"Time-Based Test started successfully!"** → `/tb-live-test?id=…` ([Ch12](ch12-time-based-tests.md))
- Scoping rule: a selection transmits a `subject_id`/`topic_id` **only when exactly one** is chosen in that block; several picks leave the scope at course level — the server then draws from the whole course

<!-- img: ch08-start-test-dialog -->

## Resuming · abandoning · viewing

- **Resume** (In Progress rows) → straight back into `/live-test?id=…` (Ch11)
- **✕** (In Progress rows) → D13 confirmation:
  - Title: **"Abandon Test?"**
  - Text: *"Are you sure you want to abandon this test? Your progress will be lost and the test will be marked as abandoned."*
  - Buttons: **Cancel** / **Abandon**
  - Confirm → toast **"Test abandoned successfully"** → row turns **Abandoned** (red), no actions left; failure → *"Failed to abandon test"*
- **View** (Completed rows) → `/test-result?id=…` (Ch13)

<!-- img: ch08-abandon-confirm -->

## The pre-assessment gate (A13)
While your pre-assessment is pending, **▶ Start Test** stays disabled with tooltip *"Complete the pre-assessment first"*, and predefined tests are blocked too ([Ch9](ch09-available-tests-pre-assessment.md)). Finish the pre-assessment and the button unlocks. The banner explaining it is shown in [Ch6](ch06-your-dashboard.md).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Empty history | you've never attempted a test | use **Start Test** or take a predefined one (Ch9) |
| "Total Tests" ≠ rows you can see | A10 — Total shows *completed* only; rows include in-progress/abandoned | compare against the **Completed** card instead |
| Average Score jumps after paging | average is page-scoped (A10) | known behavior |
| Start Test greyed out | pre-assessment pending | hover for the tooltip; complete it (Ch9) |
| *"No courses found."* in the dialog | zero enrollments | enroll in [Ch7](ch07-my-enrollments.md) first |
| Test disappeared from In Progress | it was abandoned | it's now listed as **Abandoned** |
| `404 — Page not found` | student-only page | Ch4 role matrix |

## Roles & permissions
**Student-only.** Every attempt belongs to your account and appears only in your history; the API calls require your session (Ch4). Admins/teachers manage tests from their own sides (Ch19/Ch29).

## Related
- **Chapters:** [Ch6 — Dashboard](ch06-your-dashboard.md) · [Ch7 — My Enrollments](ch07-my-enrollments.md) · [Ch9 — Available Tests](ch09-available-tests-pre-assessment.md) · [Ch11 — Live Test Room](ch11-live-test-room.md) · [Ch12 — Time-Based Tests](ch12-time-based-tests.md) · [Ch13 — Results & Analytics](ch13-results-analytics.md)
- **Screens:** P05 · **Dialogs:** D10, D13 · **Anomalies:** A10, A13 · **Appendices:** A · C · E
